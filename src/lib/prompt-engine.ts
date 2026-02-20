import type { AIModel, SceneConfig } from '@/types';

/**
 * Builds a professional photography prompt from an AI Model's DNA and scene configuration.
 * Optimized for FLUX.2 Pro's structured prompting capabilities.
 */
export function buildPrompt(model: AIModel, scene: SceneConfig): string {
  const parts: string[] = [];

  // ── Subject Description ──────────────────────────────────
  parts.push(buildSubjectDescription(model));

  // ── Scene & Environment ──────────────────────────────────
  parts.push(buildSceneDescription(scene));

  // ── Outfit ───────────────────────────────────────────────
  if (scene.outfit) {
    const outfitDesc = scene.outfitDetails
      ? `wearing ${scene.outfit}, ${scene.outfitDetails}`
      : `wearing ${scene.outfit}`;
    parts.push(outfitDesc);
  }

  // ── Photography Technical ────────────────────────────────
  parts.push(buildTechnicalDescription(scene));

  // ── Style & Mood ─────────────────────────────────────────
  parts.push(buildStyleDescription(model, scene));

  // ── Custom additions ─────────────────────────────────────
  if (scene.customPrompt) {
    parts.push(scene.customPrompt);
  }

  // ── Quality boosters ─────────────────────────────────────
  parts.push('professional photography, ultra-detailed, shot on Sony A7R IV, 85mm lens, RAW photo, photorealistic, 8k uhd');

  return parts.filter(Boolean).join('. ');
}

function buildSubjectDescription(model: AIModel): string {
  const { face, body } = model;
  const parts: string[] = [];

  // Core identity
  const ageDesc = face.age.includes('-') ? `${face.age} year old` : face.age;
  parts.push(`A stunning ${ageDesc} ${face.ethnicity} ${face.gender.toLowerCase()}`);

  // Face details
  const faceDetails: string[] = [];
  faceDetails.push(`${face.skinTone.toLowerCase()} skin`);
  faceDetails.push(`${face.faceShape.toLowerCase()} face`);
  faceDetails.push(`${face.eyeColor.toLowerCase()} ${face.eyeShape.toLowerCase()} eyes`);
  faceDetails.push(`${face.hairLength.toLowerCase()} ${face.hairStyle.toLowerCase()} ${face.hairColor.toLowerCase()} hair`);

  if (face.features.length > 0) {
    faceDetails.push(`with ${face.features.map((f) => f.toLowerCase()).join(', ')}`);
  }

  parts.push(`with ${faceDetails.join(', ')}`);

  // Expression
  if (face.expression) {
    parts.push(`${face.expression.toLowerCase()} expression`);
  }

  // Body
  const bodyParts: string[] = [];
  bodyParts.push(`${body.bodyType.toLowerCase()} ${body.build.toLowerCase()} build`);
  bodyParts.push(`${body.height}`);
  if (body.skinTexture) {
    bodyParts.push(`${body.skinTexture.toLowerCase()} skin`);
  }

  parts.push(bodyParts.join(', '));

  return parts.join(', ');
}

function buildSceneDescription(scene: SceneConfig): string {
  const parts: string[] = [];

  // Setting
  if (scene.setting) {
    parts.push(`in ${scene.setting.toLowerCase()}`);
  }

  // Pose
  if (scene.pose) {
    parts.push(scene.pose.toLowerCase());
  }

  // Background
  if (scene.background && scene.background !== 'Clean/Minimal') {
    parts.push(`${scene.background.toLowerCase()} background`);
  }

  // Time of day
  if (scene.timeOfDay) {
    parts.push(`during ${scene.timeOfDay.toLowerCase()}`);
  }

  // Props
  if (scene.props && scene.props.length > 0) {
    parts.push(`with ${scene.props.join(', ')}`);
  }

  return parts.join(', ');
}

function buildTechnicalDescription(scene: SceneConfig): string {
  const parts: string[] = [];

  // Lighting
  if (scene.lighting) {
    parts.push(`${scene.lighting.toLowerCase()} lighting`);
  }

  // Camera
  if (scene.cameraAngle) {
    parts.push(`${scene.cameraAngle.toLowerCase()} camera angle`);
  }

  if (scene.cameraDistance) {
    parts.push(`${scene.cameraDistance.toLowerCase()} shot`);
  }

  return parts.join(', ');
}

function buildStyleDescription(model: AIModel, scene: SceneConfig): string {
  const parts: string[] = [];

  // Mood
  if (scene.mood) {
    parts.push(`${scene.mood.toLowerCase()} mood`);
  }

  // Aesthetic
  if (model.style.aesthetic) {
    parts.push(`${model.style.aesthetic.toLowerCase()} aesthetic`);
  }

  // Vibe keywords
  if (model.style.vibeKeywords.length > 0) {
    parts.push(model.style.vibeKeywords.map((v) => v.toLowerCase()).join(', '));
  }

  return parts.join(', ');
}

/**
 * Builds a prompt specifically for generating the initial model portrait.
 */
export function buildPortraitPrompt(model: AIModel): string {
  const scene: SceneConfig = {
    setting: 'Studio (White Background)',
    pose: 'Three-Quarter Profile',
    outfit: '',
    outfitDetails: '',
    lighting: 'Studio Softbox',
    cameraAngle: 'Eye Level',
    cameraDistance: 'Close-up (Face)',
    mood: 'Serene',
    props: [],
    background: 'Clean/Minimal',
    timeOfDay: 'Afternoon',
    customPrompt: '',
  };

  return buildPrompt(model, scene);
}

/**
 * Builds a structured prompt object for FLUX.2 Pro's JSON prompt format.
 */
export function buildStructuredPrompt(model: AIModel, scene: SceneConfig) {
  return {
    scene: buildSceneDescription(scene),
    subjects: buildSubjectDescription(model),
    style: buildStyleDescription(model, scene),
    lighting: scene.lighting || 'Natural Daylight',
    camera: {
      angle: scene.cameraAngle || 'Eye Level',
      distance: scene.cameraDistance || 'Medium Shot',
    },
    color_palette: model.style.colorPalette,
  };
}
