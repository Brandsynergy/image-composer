import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

// Extract a plain URL string from Replicate's output (handles FileOutput, arrays, strings)
function extractUrl(output: unknown): string | null {
  if (!output) return null;

  // If it's an array, grab the first element and recurse
  if (Array.isArray(output)) {
    return extractUrl(output[0]);
  }

  // FileOutput / ReadableStream / object with .url()
  if (typeof output === 'object' && output !== null) {
    // FileOutput has a url() method in some SDK versions
    if ('url' in output && typeof (output as Record<string, unknown>).url === 'function') {
      return String((output as { url: () => string }).url());
    }
    // Or it might have a .href property
    if ('href' in output) {
      return String((output as { href: string }).href);
    }
  }

  // Plain string URL
  if (typeof output === 'string' && output.startsWith('http')) {
    return output;
  }

  // Last resort: coerce to string and check if it looks like a URL
  const str = String(output);
  if (str.startsWith('http')) {
    return str;
  }

  return null;
}

type ModelId = 'flux-kontext-pro' | 'flux-2-pro' | 'flux-2-flex' | 'flux-1.1-pro-ultra' | 'flux-schnell';

const MODEL_MAP: Record<ModelId, `${string}/${string}`> = {
  'flux-kontext-pro': 'black-forest-labs/flux-kontext-pro' as `${string}/${string}`,
  'flux-2-pro': 'black-forest-labs/flux-2-pro' as `${string}/${string}`,
  'flux-2-flex': 'black-forest-labs/flux-2-flex' as `${string}/${string}`,
  'flux-1.1-pro-ultra': 'black-forest-labs/flux-1.1-pro-ultra' as `${string}/${string}`,
  'flux-schnell': 'black-forest-labs/flux-schnell' as `${string}/${string}`,
};

// Internal enhancement prompt — not exposed to users (premium feature)
const ENHANCEMENT_PROMPT = `Ultra-high-resolution 4K enhancement based strictly on the provided reference image. Absolute fidelity to original facial anatomy, proportions, and identity. Preserve expression, gaze, pose, camera angle, framing, and perspective with zero deviation. Clothing, hair, skin, and background elements must remain unchanged in structure, placement, and design.
Critical eye correction: Both eyes must be perfectly clean, sharp, and anatomically correct. Irises must have identical color, size, shape, and clarity with natural limbal rings and realistic radial fiber patterns. Pupils must be round, centered, and symmetrically sized. Sclera must be clean bright white with subtle natural veining — no discoloration, no yellow tint, no red blotches. Corneal reflections must be consistent between both eyes matching the scene lighting. Eyelashes must be individually defined, naturally curved, and free of clumping or smearing. Eyelids must have clean edges with no doubling or ghosting artifacts. Remove any heterochromia, iris bleeding, pupil deformation, or gaze misalignment unless explicitly present in the source.
Recover fine-grain detail with natural realism. Enhance pores, fine lines, hair strands, eyelashes, fabric weave, seams, and material edges without introducing stylization. Maintain original color science, white balance, and tonal relationships exactly as captured. Lighting direction, intensity, contrast, and shadow behavior must match the source image precisely, with only improved clarity and expanded dynamic range. No relighting, no reshaping. Remove any grain.
Apply controlled sharpening and high-frequency detail reconstruction. Remove compression artifacts and noise while retaining authentic texture. No smoothing, no plastic skin, no artificial gloss. Facial features must remain consistent across the entire image with coherent anatomy and clean, stable edges. Teeth must be clean and natural if visible — no extra teeth, no merged teeth, no discoloration artifacts.
Negative constraints: no warping, no facial drift, no added or missing anatomy, no altered hands, no distortions, no perspective shift, no text or graphics, no hallucinated detail, no stylized rendering. Output must read as a true-to-life, photorealistic upscale that matches the reference exactly, only clearer, sharper, and higher resolution.`;

// Build the correct input payload per model
function buildInput(
  modelId: ModelId,
  opts: {
    prompt: string;
    aspectRatio: string;
    seed?: number;
    outputFormat?: string;
    outputQuality?: number;
    promptUpsampling?: boolean;
    raw?: boolean;
    steps?: number;
    guidance?: number;
  }
) {
  const { prompt, aspectRatio, seed, outputFormat = 'png', outputQuality = 90, promptUpsampling, raw, steps, guidance } = opts;

  const base: Record<string, unknown> = {
    prompt,
    output_format: outputFormat,
    ...(seed ? { seed } : {}),
  };

  switch (modelId) {
    case 'flux-kontext-pro':
      return {
        ...base,
        aspect_ratio: aspectRatio,
        output_format: outputFormat === 'webp' ? 'jpg' : outputFormat, // Kontext supports jpg/png only
        safety_tolerance: 2,
      };
    case 'flux-2-pro':
      return {
        ...base,
        aspect_ratio: aspectRatio,
        output_quality: outputQuality,
        ...(promptUpsampling !== undefined ? { prompt_upsampling: promptUpsampling } : {}),
        safety_tolerance: 2,
      };
    case 'flux-2-flex':
      return {
        ...base,
        aspect_ratio: aspectRatio,
        output_quality: outputQuality,
        ...(steps ? { steps } : {}),
        ...(guidance ? { guidance } : {}),
      };
    case 'flux-1.1-pro-ultra':
      return {
        ...base,
        aspect_ratio: aspectRatio,
        output_quality: outputQuality,
        ...(raw !== undefined ? { raw } : {}),
        safety_tolerance: 2,
      };
    case 'flux-schnell':
      return {
        ...base,
        num_outputs: 1,
        aspect_ratio: aspectRatio,
      };
    default:
      return base;
  }
}

async function runModel(
  replicate: Replicate,
  modelId: ModelId,
  opts: Parameters<typeof buildInput>[1]
): Promise<{ output: unknown; model: string }> {
  const input = buildInput(modelId, opts);
  const output = await replicate.run(MODEL_MAP[modelId], { input });
  return { output, model: modelId };
}

// Fallback order: requested → kontext-pro → flux-2-pro → flux-1.1-pro-ultra → flux-schnell
const FALLBACK_ORDER: ModelId[] = ['flux-kontext-pro', 'flux-2-pro', 'flux-1.1-pro-ultra', 'flux-schnell'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      aspectRatio = '4:5',
      apiKey,
      seed,
      model = 'flux-kontext-pro',
      outputFormat = 'png',
      outputQuality = 90,
      promptUpsampling,
      raw,
      steps,
      guidance,
      enhance = true,
    } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Replicate API key is required. Set it in Settings.' },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required.' },
        { status: 400 }
      );
    }

    const replicate = new Replicate({ auth: apiKey });
    const opts = { prompt, aspectRatio, seed, outputFormat, outputQuality, promptUpsampling, raw, steps, guidance };

    let result: { output: unknown; model: string } | null = null;
    const errors: string[] = [];

    // Build unique fallback chain: requested model first, then remaining in order
    const chain: ModelId[] = [model as ModelId, ...FALLBACK_ORDER.filter((m) => m !== model)];

    for (const mid of chain) {
      try {
        result = await runModel(replicate, mid, opts);
        break;
      } catch (e) {
        errors.push(`${mid}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: `All models failed. Check your API key and billing at replicate.com. Errors: ${errors.join(' | ')}` },
        { status: 500 }
      );
    }

    // Convert output to a plain URL string
    const imageUrl = extractUrl(result.output);

    if (!imageUrl) {
      console.error('Could not extract URL from output:', typeof result.output, JSON.stringify(result.output).slice(0, 500));
      return NextResponse.json(
        { error: `Generation completed but could not extract image URL. Raw type: ${typeof result.output}` },
        { status: 500 }
      );
    }

    // ── Enhancement pass: run through Kontext Pro for 4K sharpening ──
    let finalUrl = imageUrl;
    let enhanced = false;

    if (enhance) {
      try {
        const enhanceOutput = await replicate.run(
          MODEL_MAP['flux-kontext-pro'],
          {
            input: {
              prompt: ENHANCEMENT_PROMPT,
              input_image: imageUrl,
              aspect_ratio: 'match_input_image',
              output_format: 'png',
              safety_tolerance: 2,
            },
          }
        );
        const enhancedUrl = extractUrl(enhanceOutput);
        if (enhancedUrl) {
          finalUrl = enhancedUrl;
          enhanced = true;
        }
      } catch (enhErr) {
        // Enhancement failed — return the original image rather than erroring out
        console.warn('Enhancement pass failed, returning original:', enhErr instanceof Error ? enhErr.message : enhErr);
      }
    }

    return NextResponse.json({ output: finalUrl, model: result.model, enhanced });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed unexpectedly' },
      { status: 500 }
    );
  }
}
