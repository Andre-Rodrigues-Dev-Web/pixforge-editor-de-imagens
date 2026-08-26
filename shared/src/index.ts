export interface ApiSuccess<T> { success: true; data: T; meta?: Record<string, unknown>; }
export interface ApiFailure { success: false; error: { code: string; message: string }; }
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type ImageOutputFormat = 'jpeg' | 'png' | 'webp' | 'avif';

export interface ImageResult {
  id: string;
  filename: string;
  mimeType: string;
  originalBytes: number;
  resultBytes: number;
  width: number;
  height: number;
  downloadUrl: string;
}

export interface PixForgeTool {
  id: string;
  name: string;
  shortName: string;
  description: string;
  route: string;
  icon: string;
  category: 'transform' | 'create' | 'edit';
  formats: string;
}
