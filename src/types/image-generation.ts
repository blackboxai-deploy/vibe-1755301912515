export interface GenerationRequest {
  prompt: string;
  systemPrompt?: string;
  width?: number;
  height?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  style?: string;
  seed?: number;
}

export interface GenerationResponse {
  id: string;
  imageUrl: string;
  prompt: string;
  systemPrompt?: string;
  parameters: GenerationParameters;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface GenerationParameters {
  width: number;
  height: number;
  guidance_scale: number;
  num_inference_steps: number;
  style: string;
  seed?: number;
}

export interface ImageDimensions {
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  preview?: string;
}

export interface GenerationHistory {
  id: string;
  prompt: string;
  systemPrompt?: string;
  imageUrl: string;
  parameters: GenerationParameters;
  createdAt: string;
  favorite?: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface GenerationSettings {
  dimensions: ImageDimensions;
  style: StylePreset;
  guidance_scale: number;
  num_inference_steps: number;
  seed?: number;
  batchSize: number;
}

export interface BatchGenerationRequest {
  prompt: string;
  systemPrompt?: string;
  count: number;
  parameters: GenerationParameters;
}

export interface BatchGenerationResponse {
  batchId: string;
  images: GenerationResponse[];
  totalCount: number;
  completedCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export const DEFAULT_DIMENSIONS: ImageDimensions[] = [
  { label: "Square", width: 1024, height: 1024, aspectRatio: "1:1" },
  { label: "Portrait", width: 768, height: 1024, aspectRatio: "3:4" },
  { label: "Landscape", width: 1024, height: 768, aspectRatio: "4:3" },
  { label: "Wide", width: 1536, height: 640, aspectRatio: "12:5" },
  { label: "Tall", width: 640, height: 1536, aspectRatio: "5:12" }
];

export const DEFAULT_STYLE_PRESETS: StylePreset[] = [
  {
    id: "photorealistic",
    name: "Photorealistic",
    description: "High-quality, realistic photography style",
    systemPrompt: "Create a photorealistic, high-quality image with professional lighting and composition. Focus on realistic textures, accurate proportions, and natural colors."
  },
  {
    id: "artistic",
    name: "Artistic",
    description: "Creative and expressive artistic style",
    systemPrompt: "Create an artistic interpretation with creative composition, expressive brushwork, and enhanced colors. Focus on artistic expression over photorealism."
  },
  {
    id: "digital_art",
    name: "Digital Art",
    description: "Modern digital illustration style",
    systemPrompt: "Create a digital artwork with clean lines, vibrant colors, and modern illustration techniques. Focus on stylized forms and contemporary digital art aesthetics."
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Movie-like dramatic lighting and composition",
    systemPrompt: "Create a cinematic image with dramatic lighting, film-like composition, and movie-quality production values. Focus on storytelling through visual elements."
  },
  {
    id: "abstract",
    name: "Abstract",
    description: "Non-representational abstract art",
    systemPrompt: "Create an abstract composition focusing on colors, shapes, and forms rather than realistic representation. Emphasize artistic expression and visual impact."
  }
];

export const DEFAULT_GENERATION_SETTINGS: GenerationSettings = {
  dimensions: DEFAULT_DIMENSIONS[0],
  style: DEFAULT_STYLE_PRESETS[0],
  guidance_scale: 7.5,
  num_inference_steps: 50,
  batchSize: 1
};