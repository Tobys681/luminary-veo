
export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

export type GenerationMode = 'text-to-video' | 'image-to-video' | 'multi-reference';

export interface GenerationSettings {
  mode: GenerationMode;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
  startImage?: string; // base64
  endImage?: string; // base64
  referenceImages: string[]; // base64 array
}
