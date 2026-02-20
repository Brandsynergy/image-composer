import { ExportPreset } from '@/types';

// ─── Face Configuration Options ────────────────────────────────
export const ETHNICITIES = [
  'East Asian', 'South Asian', 'Southeast Asian', 'Middle Eastern',
  'African', 'West African', 'East African', 'European', 'Nordic',
  'Mediterranean', 'Latin American', 'Pacific Islander', 'Mixed/Multiracial',
];

export const AGES = [
  '18-22', '23-27', '28-32', '33-37', '38-45', '46-55',
];

export const GENDERS = ['Female', 'Male', 'Non-binary'];

export const SKIN_TONES = [
  'Porcelain', 'Fair', 'Light', 'Light-Medium', 'Medium',
  'Medium-Tan', 'Olive', 'Tan', 'Brown', 'Dark Brown', 'Deep',
];

export const FACE_SHAPES = [
  'Oval', 'Round', 'Square', 'Heart', 'Diamond',
  'Oblong', 'Triangle',
];

export const EYE_COLORS = [
  'Brown', 'Dark Brown', 'Hazel', 'Green', 'Blue',
  'Grey', 'Amber', 'Light Brown',
];

export const EYE_SHAPES = [
  'Almond', 'Round', 'Monolid', 'Hooded', 'Downturned',
  'Upturned', 'Wide-set', 'Close-set',
];

export const HAIR_COLORS = [
  'Black', 'Dark Brown', 'Medium Brown', 'Light Brown', 'Auburn',
  'Red', 'Strawberry Blonde', 'Dark Blonde', 'Golden Blonde',
  'Platinum Blonde', 'Silver/Grey', 'White',
];

export const HAIR_STYLES = [
  'Straight', 'Wavy', 'Curly', 'Coily', 'Braids',
  'Locs', 'Pixie Cut', 'Bob', 'Buzz Cut', 'Afro',
  'Slicked Back', 'Messy/Textured', 'Updos', 'Ponytail',
];

export const HAIR_LENGTHS = [
  'Buzz/Shaved', 'Very Short', 'Short', 'Chin-Length',
  'Shoulder-Length', 'Mid-Back', 'Waist-Length',
];

export const FACIAL_FEATURES = [
  'Freckles', 'Dimples', 'Beauty Mark', 'Strong Jawline',
  'High Cheekbones', 'Full Lips', 'Thin Lips', 'Prominent Nose',
  'Button Nose', 'Thick Eyebrows', 'Arched Eyebrows', 'Gap Teeth',
  'Cleft Chin', 'Widow\'s Peak',
];

export const EXPRESSIONS = [
  'Neutral/Confident', 'Subtle Smile', 'Warm Smile', 'Intense Gaze',
  'Playful', 'Serious/Editorial', 'Laughing', 'Pensive',
  'Sultry', 'Candid/Natural',
];

// ─── Body Configuration Options ────────────────────────────────
export const BODY_TYPES = [
  'Slim', 'Athletic', 'Lean', 'Average', 'Curvy',
  'Plus-Size', 'Muscular', 'Petite',
];

export const HEIGHTS = [
  'Petite (5\'0-5\'3)', 'Average (5\'4-5\'6)', 'Tall (5\'7-5\'9)',
  'Very Tall (5\'10+)', 'Short (5\'5-5\'8) [M]', 'Average (5\'9-5\'11) [M]',
  'Tall (6\'0-6\'2) [M]', 'Very Tall (6\'3+) [M]',
];

export const BUILDS = [
  'Lean', 'Toned', 'Fit', 'Muscular', 'Slim',
  'Average', 'Full-figured', 'Stocky',
];

export const SKIN_TEXTURES = [
  'Smooth', 'Natural/Textured', 'Glowing', 'Matte', 'Dewy',
];

// ─── Style Configuration Options ───────────────────────────────
export const AESTHETICS = [
  'Clean Girl', 'Dark Academia', 'Y2K', 'Minimalist',
  'Streetwear', 'Old Money', 'Cottagecore', 'Coastal',
  'Grunge', 'Athleisure', 'Haute Couture', 'Bohemian',
  'Corporate Chic', 'Festival', 'Retro/Vintage',
];

export const FASHION_STYLES = [
  'High Fashion/Editorial', 'Casual Chic', 'Streetwear',
  'Activewear/Athletic', 'Business Professional', 'Bohemian',
  'Preppy', 'Avant-Garde', 'Romantic/Feminine', 'Minimalist',
  'Luxury/Designer', 'Sustainable/Eco', 'Urban', 'Resort Wear',
];

export const INFLUENCER_NICHES = [
  'Fashion & Style', 'Beauty & Skincare', 'Fitness & Wellness',
  'Travel & Lifestyle', 'Food & Culinary', 'Tech & Gaming',
  'Luxury & High-End', 'Sustainable Living', 'Business & Finance',
  'Art & Creative', 'Music & Entertainment', 'Health & Nutrition',
];

export const VIBE_KEYWORDS = [
  'Aspirational', 'Authentic', 'Edgy', 'Sophisticated', 'Playful',
  'Mysterious', 'Warm', 'Bold', 'Ethereal', 'Powerful',
  'Serene', 'Rebellious', 'Glamorous', 'Down-to-earth', 'Futuristic',
];

// ─── Scene Configuration Options ───────────────────────────────
export const SETTINGS = [
  'Studio (White Background)', 'Studio (Colored Background)',
  'Urban Street', 'Rooftop', 'Coffee Shop', 'Beach/Coastal',
  'Mountain/Nature', 'Luxury Interior', 'Office/Workspace',
  'Restaurant/Bar', 'Gym/Fitness Studio', 'Garden/Park',
  'City Skyline', 'Fashion Runway', 'Art Gallery',
  'Hotel Suite', 'Car Interior', 'Pool/Spa',
  'Yacht/Boat', 'Market/Bazaar',
];

export const POSES = [
  'Standing Confident', 'Walking/In Motion', 'Seated Casual',
  'Seated Cross-legged', 'Leaning Against Wall', 'Arms Crossed',
  'Hand on Hip', 'Looking Over Shoulder', 'Close-up Portrait',
  'Three-Quarter Profile', 'Full Body', 'Sitting on Steps',
  'Candid/Natural Movement', 'Power Pose', 'Relaxed Recline',
];

export const OUTFITS = [
  'Business Suit', 'Casual Streetwear', 'Evening Dress/Gown',
  'Activewear', 'Summer Dress', 'Denim & T-Shirt',
  'Swimwear', 'Winter Coat & Layers', 'Crop Top & High-Waist',
  'Blazer & Jeans', 'Lingerie/Intimate', 'Formal Tuxedo',
  'Bohemian Layers', 'Monochrome Outfit', 'Designer/Runway Look',
  'Leather Jacket & Boots', 'Athleisure Set', 'Traditional/Cultural Wear',
];

export const LIGHTING = [
  'Golden Hour', 'Natural Daylight', 'Studio Softbox',
  'Dramatic Side Light', 'Ring Light', 'Neon/Colored Gels',
  'Backlit/Silhouette', 'Overcast/Diffused', 'Cinematic',
  'High Key (Bright)', 'Low Key (Moody)', 'Window Light',
  'Flash/Strobe', 'Candlelight', 'Sunset/Sunrise',
];

export const CAMERA_ANGLES = [
  'Eye Level', 'Slightly Above', 'Low Angle (Power)',
  'High Angle', 'Dutch Angle', 'Bird\'s Eye',
  'Worm\'s Eye', 'Over the Shoulder',
];

export const CAMERA_DISTANCES = [
  'Extreme Close-up', 'Close-up (Face)', 'Medium Close-up (Bust)',
  'Medium Shot (Waist)', 'Medium Full (Knees)', 'Full Body',
  'Wide Shot (Environment)', 'Establishing Shot',
];

export const MOODS = [
  'Empowering', 'Serene', 'Edgy', 'Romantic', 'Energetic',
  'Mysterious', 'Joyful', 'Luxurious', 'Raw/Authentic',
  'Dreamy', 'Fierce', 'Cozy', 'Futuristic', 'Nostalgic',
];

export const TIMES_OF_DAY = [
  'Dawn', 'Morning', 'Midday', 'Afternoon', 'Golden Hour',
  'Dusk', 'Blue Hour', 'Night',
];

export const BACKGROUNDS = [
  'Clean/Minimal', 'Blurred (Bokeh)', 'Textured Wall',
  'Nature/Greenery', 'Urban Architecture', 'Gradient',
  'Solid Color', 'Interior Design', 'Busy Street',
  'Water/Ocean', 'Mountains', 'Sky/Clouds',
];

// ─── Aspect Ratios ─────────────────────────────────────────────
export const ASPECT_RATIOS = [
  { label: 'Square (1:1)', value: '1:1', description: 'Instagram Feed' },
  { label: 'Portrait (4:5)', value: '4:5', description: 'Instagram Portrait' },
  { label: 'Story (9:16)', value: '9:16', description: 'TikTok / Stories' },
  { label: 'Landscape (16:9)', value: '16:9', description: 'YouTube / Banner' },
  { label: 'Classic (3:4)', value: '3:4', description: 'Pinterest / Print' },
  { label: 'Wide (21:9)', value: '21:9', description: 'Cinematic / Hero' },
];

// ─── Export Presets ─────────────────────────────────────────────
export const EXPORT_PRESETS: ExportPreset[] = [
  { name: 'Instagram Feed', platform: 'instagram', width: 1080, height: 1080, aspectRatio: '1:1', icon: '📷' },
  { name: 'Instagram Story', platform: 'instagram', width: 1080, height: 1920, aspectRatio: '9:16', icon: '📱' },
  { name: 'Instagram Portrait', platform: 'instagram', width: 1080, height: 1350, aspectRatio: '4:5', icon: '🖼️' },
  { name: 'TikTok', platform: 'tiktok', width: 1080, height: 1920, aspectRatio: '9:16', icon: '🎵' },
  { name: 'YouTube Thumbnail', platform: 'youtube', width: 1280, height: 720, aspectRatio: '16:9', icon: '▶️' },
  { name: 'Twitter/X Post', platform: 'twitter', width: 1200, height: 675, aspectRatio: '16:9', icon: '🐦' },
  { name: 'LinkedIn', platform: 'linkedin', width: 1200, height: 627, aspectRatio: '16:9', icon: '💼' },
  { name: 'Pinterest Pin', platform: 'pinterest', width: 1000, height: 1500, aspectRatio: '2:3', icon: '📌' },
  { name: 'Print A4', platform: 'print', width: 2480, height: 3508, aspectRatio: '3:4', icon: '🖨️' },
  { name: 'Billboard', platform: 'print', width: 3840, height: 2160, aspectRatio: '16:9', icon: '🏙️' },
];

// ─── Viral Preset Styles ───────────────────────────────────────
export const VIRAL_PRESETS = [
  {
    name: 'Editorial Cover',
    description: 'High-fashion magazine cover look',
    scene: { setting: 'Studio (Colored Background)', lighting: 'Studio Softbox', pose: 'Three-Quarter Profile', mood: 'Fierce', cameraAngle: 'Eye Level', cameraDistance: 'Medium Close-up (Bust)' },
  },
  {
    name: 'Street Style',
    description: 'Urban influencer candid moment',
    scene: { setting: 'Urban Street', lighting: 'Natural Daylight', pose: 'Walking/In Motion', mood: 'Empowering', cameraAngle: 'Eye Level', cameraDistance: 'Full Body' },
  },
  {
    name: 'Golden Hour Glow',
    description: 'Warm sunset portrait that stops the scroll',
    scene: { setting: 'Beach/Coastal', lighting: 'Golden Hour', pose: 'Candid/Natural Movement', mood: 'Dreamy', cameraAngle: 'Slightly Above', cameraDistance: 'Medium Shot (Waist)' },
  },
  {
    name: 'Luxury Lifestyle',
    description: 'Premium brand ambassador aesthetic',
    scene: { setting: 'Hotel Suite', lighting: 'Window Light', pose: 'Seated Casual', mood: 'Luxurious', cameraAngle: 'Eye Level', cameraDistance: 'Medium Shot (Waist)' },
  },
  {
    name: 'Fitness Power',
    description: 'Athletic brand content',
    scene: { setting: 'Gym/Fitness Studio', lighting: 'Dramatic Side Light', pose: 'Power Pose', mood: 'Energetic', cameraAngle: 'Low Angle (Power)', cameraDistance: 'Full Body' },
  },
  {
    name: 'Beauty Close-up',
    description: 'Skincare & beauty product placement ready',
    scene: { setting: 'Studio (White Background)', lighting: 'Ring Light', pose: 'Close-up Portrait', mood: 'Serene', cameraAngle: 'Eye Level', cameraDistance: 'Extreme Close-up' },
  },
  {
    name: 'Travel Wanderlust',
    description: 'Destination influencer content',
    scene: { setting: 'Mountain/Nature', lighting: 'Natural Daylight', pose: 'Standing Confident', mood: 'Joyful', cameraAngle: 'Slightly Above', cameraDistance: 'Wide Shot (Environment)' },
  },
  {
    name: 'Night Out',
    description: 'Nightlife & entertainment content',
    scene: { setting: 'Restaurant/Bar', lighting: 'Neon/Colored Gels', pose: 'Looking Over Shoulder', mood: 'Mysterious', cameraAngle: 'Eye Level', cameraDistance: 'Medium Close-up (Bust)' },
  },
];

// ─── Color Palette Presets ─────────────────────────────────────
export const COLOR_PALETTES = [
  { name: 'Warm Earth', colors: ['#D4A373', '#FAEDCD', '#E9EDC9', '#CCD5AE'] },
  { name: 'Ocean Blue', colors: ['#023E8A', '#0077B6', '#0096C7', '#48CAE4'] },
  { name: 'Rose Gold', colors: ['#B76E79', '#E8C4C8', '#F2D7D9', '#FAE8E0'] },
  { name: 'Midnight', colors: ['#0D1B2A', '#1B2838', '#2C3E50', '#415A77'] },
  { name: 'Neon Pop', colors: ['#FF006E', '#8338EC', '#3A86FF', '#06D6A0'] },
  { name: 'Monochrome', colors: ['#000000', '#333333', '#666666', '#999999'] },
  { name: 'Sunset', colors: ['#FF6B6B', '#FFA07A', '#FFD93D', '#FF8C42'] },
  { name: 'Forest', colors: ['#2D6A4F', '#40916C', '#52B788', '#74C69D'] },
];
