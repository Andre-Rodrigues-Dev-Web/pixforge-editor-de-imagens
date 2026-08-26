import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { AppError } from '../../errors/app-error.js';
import { SharpHeicDecoderAdapter } from './heic-decoder.js';

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif']);

const heicDecoder = new SharpHeicDecoderAdapter();

export async function validateImage(buffer: Buffer): Promise<{ mime: string; width: number; height: number; normalizedBuffer: Buffer }> {
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !allowed.has(detected.mime)) {
    throw new AppError('INVALID_IMAGE_FORMAT', 'Não conseguimos reconhecer este arquivo como uma imagem válida.');
  }
  try {
    const normalizedBuffer = detected.mime === 'image/heic' || detected.mime === 'image/heif' ? await heicDecoder.decode(buffer) : buffer;
    const metadata = await sharp(normalizedBuffer, { failOn: 'error', limitInputPixels: 80_000_000 }).metadata();
    if (!metadata.width || !metadata.height) throw new Error('Dimensões ausentes');
    if (metadata.width * metadata.height > 80_000_000) throw new Error('Imagem excede o limite de pixels');
    return { mime: detected.mime, width: metadata.width, height: metadata.height, normalizedBuffer };
  } catch {
    throw new AppError('CORRUPTED_IMAGE', 'Não foi possível processar esta imagem. Verifique se o arquivo está corrompido.');
  }
}
