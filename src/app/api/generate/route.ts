import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

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

    // Map quality to model parameters
    const qualityMap: Record<string, { steps?: number; guidance?: number }> = {
      standard: { steps: 25, guidance: 3 },
      hd: { steps: 35, guidance: 3.5 },
      ultra: { steps: 50, guidance: 4 },
    };

    const qualitySettings = qualityMap[quality] || qualityMap.hd;

    // Map aspect ratio to width/height
    const sizeMap: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '4:5': { width: 896, height: 1120 },
      '9:16': { width: 768, height: 1344 },
      '16:9': { width: 1344, height: 768 },
      '3:4': { width: 896, height: 1184 },
      '21:9': { width: 1536, height: 640 },
    };

    const size = sizeMap[aspectRatio] || sizeMap['4:5'];

    // Use FLUX 1.1 Pro Ultra as primary (widely available), fallback gracefully
    const input: Record<string, unknown> = {
      prompt,
      aspect_ratio: aspectRatio,
      output_format: 'png',
      safety_tolerance: 2,
    };

    // Add seed for character consistency if provided
    if (seed) {
      input.seed = seed;
    }

    let output: unknown;

    try {
      // Try FLUX 1.1 Pro Ultra first (best quality, most available)
      output = await replicate.run(
        'black-forest-labs/flux-1.1-pro-ultra' as `${string}/${string}`,
        { input }
      );
    } catch {
      try {
        // Fallback to FLUX 1.1 Pro
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
      } catch {
        try {
          // Fallback to FLUX Schnell (free/cheap, always available)
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
        } catch (schnellError) {
          return NextResponse.json(
            { error: `All generation models failed. Please check your API key and billing. Details: ${schnellError instanceof Error ? schnellError.message : 'Unknown error'}` },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ output });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
