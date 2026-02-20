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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, aspectRatio = '4:5', quality = 'hd', apiKey, seed } = body;

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

    // Map aspect ratio to width/height for fallback models
    const sizeMap: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '4:5': { width: 896, height: 1120 },
      '9:16': { width: 768, height: 1344 },
      '16:9': { width: 1344, height: 768 },
      '3:4': { width: 896, height: 1184 },
      '21:9': { width: 1536, height: 640 },
    };
    const size = sizeMap[aspectRatio] || sizeMap['4:5'];

    let output: unknown;
    let modelUsed = '';
    const errors: string[] = [];

    // --- Try FLUX Schnell first (fastest, cheapest, most reliable) ---
    try {
      modelUsed = 'flux-schnell';
      output = await replicate.run(
        'black-forest-labs/flux-schnell' as `${string}/${string}`,
        {
          input: {
            prompt,
            num_outputs: 1,
            aspect_ratio: aspectRatio,
            output_format: 'png',
            ...(seed ? { seed } : {}),
          },
        }
      );
    } catch (e1) {
      errors.push(`schnell: ${e1 instanceof Error ? e1.message : String(e1)}`);

      // --- Fallback: FLUX 1.1 Pro ---
      try {
        modelUsed = 'flux-1.1-pro';
        output = await replicate.run(
          'black-forest-labs/flux-1.1-pro' as `${string}/${string}`,
          {
            input: {
              prompt,
              width: size.width,
              height: size.height,
              output_format: 'png',
              ...(seed ? { seed } : {}),
            },
          }
        );
      } catch (e2) {
        errors.push(`pro: ${e2 instanceof Error ? e2.message : String(e2)}`);

        // --- Fallback: FLUX 1.1 Pro Ultra ---
        try {
          modelUsed = 'flux-1.1-pro-ultra';
          output = await replicate.run(
            'black-forest-labs/flux-1.1-pro-ultra' as `${string}/${string}`,
            {
              input: {
                prompt,
                aspect_ratio: aspectRatio,
                output_format: 'png',
                safety_tolerance: 2,
                ...(seed ? { seed } : {}),
              },
            }
          );
        } catch (e3) {
          errors.push(`ultra: ${e3 instanceof Error ? e3.message : String(e3)}`);
          return NextResponse.json(
            { error: `All models failed. Check your API key and billing at replicate.com. Errors: ${errors.join(' | ')}` },
            { status: 500 }
          );
        }
      }
    }

    // Convert output to a plain URL string
    const imageUrl = extractUrl(output);

    if (!imageUrl) {
      console.error('Could not extract URL from output:', typeof output, JSON.stringify(output).slice(0, 500));
      return NextResponse.json(
        { error: `Generation completed but could not extract image URL. Raw type: ${typeof output}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ output: imageUrl, model: modelUsed });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed unexpectedly' },
      { status: 500 }
    );
  }
}
