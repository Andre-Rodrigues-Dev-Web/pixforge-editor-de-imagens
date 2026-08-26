import sharp from 'sharp';
import decode from 'heic-decode';

export interface HeicDecoder { decode(input: Buffer): Promise<Buffer>; }

export class SharpHeicDecoderAdapter implements HeicDecoder {
  async decode(input: Buffer): Promise<Buffer> {
    try {
      return await sharp(input, { failOn: 'error' }).rotate().png().toBuffer();
    } catch {
      const image = await decode({ buffer: input });
      return sharp(Buffer.from(image.data), { raw: { width: image.width, height: image.height, channels: 4 } }).png().toBuffer();
    }
  }
}
