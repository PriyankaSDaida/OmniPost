export enum Platform {
  LINKEDIN = 'LINKEDIN',
  TWITTER = 'TWITTER',
  INSTAGRAM = 'INSTAGRAM',
}

export enum Tone {
  PROFESSIONAL = 'Professional',
  WITTY = 'Witty',
  URGENT = 'Urgent',
  CUSTOM = 'Custom',
}

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface PlatformConfig {
  id: Platform;
  name: string;
  icon: string;
  defaultAspectRatio: AspectRatio;
  maxLength?: number;
}

export interface GeneratedContent {
  text: string;
  imagePrompt: string;
  imageUrl?: string; // Base64 data URL
  isImageLoading: boolean;
  imageError?: string;
}

export interface ContentResult {
  [Platform.LINKEDIN]: GeneratedContent;
  [Platform.TWITTER]: GeneratedContent;
  [Platform.INSTAGRAM]: GeneratedContent;
}

export interface GenerationRequest {
  idea: string;
  tone: Tone;
  customTone?: string;
  aspectRatios: {
    [key in Platform]: AspectRatio;
  };
}