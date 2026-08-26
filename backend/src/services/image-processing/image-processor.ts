import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { AppError } from '../../errors/app-error.js';
import type { BackgroundRemovalProvider } from './background-provider.js';

export type OutputFormat = 'jpeg' | 'png' | 'webp' | 'avif';
export interface ProcessOptions { format: OutputFormat; quality: number; width?: number; height?: number; fit?: 'cover' | 'inside'; withoutEnlargement?: boolean; removeMetadata?: boolean; }
export interface ProcessedImage { id: string; buffer: Buffer; format: OutputFormat; width: number; height: number; }

export class ImageProcessorService {
  constructor(private readonly backgroundProvider: BackgroundRemovalProvider) {}

  async transform(input: Buffer, options: ProcessOptions): Promise<ProcessedImage> {
    const format = options.format;
    if (!['jpeg', 'png', 'webp', 'avif'].includes(format)) throw new AppError('INVALID_OUTPUT_FORMAT', 'O formato de saída não é suportado.');
    let pipeline = sharp(input, { failOn: 'error', limitInputPixels: 80_000_000 }).rotate();
    if (options.width || options.height) pipeline = pipeline.resize({ width: options.width, height: options.height, fit: options.fit ?? 'inside', withoutEnlargement: options.withoutEnlargement ?? true });
    if (!options.removeMetadata) pipeline = pipeline.keepMetadata();
    const quality = Math.max(1, Math.min(100, options.quality));
    pipeline = pipeline.toFormat(format, { quality });
    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    return { id: randomUUID(), buffer: data, format, width: info.width, height: info.height };
  }

  async removeBackground(input: Buffer): Promise<ProcessedImage> {
    const buffer = await this.backgroundProvider.remove(input);
    const info = await sharp(buffer).metadata();
    return { id: randomUUID(), buffer, format: 'png', width: info.width ?? 0, height: info.height ?? 0 };
  }
}
