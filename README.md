# IMAGE COMPOSER — AI Model & Influencer Generation Studio

Professional-grade standalone app for creating hyper-realistic AI models (face, body, style) and generating photo content for advertising, brands, campaigns, and social media influencers.

## Features

- **AI Model Creator** — Multi-step wizard to define face, body, style, and influencer DNA
- **Photo Studio** — Full scene control: pose, lighting, outfit, camera angle, mood, background
- **Viral Presets** — One-click presets for Editorial, Street Style, Golden Hour, Luxury, Fitness, Beauty, Travel, Night Out
- **Gallery** — Browse, filter, favorite, and download all generated content
- **Campaign Builder** — Create branded content series with brand colors, mood, and platform targeting
- **Export Presets** — Instagram, TikTok, YouTube, LinkedIn, Pinterest, Print-ready formats
- **Prompt Engine** — Automatically converts UI selections into optimized professional photography prompts
- **Character Consistency** — Seed locking and persona DNA injection for consistent AI model identity

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setup

1. Get a Replicate API token at [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
2. Enter it in the app when prompted, or go to Settings
3. Create your first AI model in the Model Creator
4. Generate photos in the Photo Studio

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui** — Professional dark-theme UI
- **Replicate API** — FLUX Pro for photorealistic generation
- **Zustand** — State management with localStorage persistence
- **Standalone** — No database required, runs entirely in the browser + API calls

## License

MIT
