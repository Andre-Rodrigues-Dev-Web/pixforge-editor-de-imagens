import sharp from 'sharp';

export interface BackgroundRemovalProvider { remove(image: Buffer): Promise<Buffer>; }

/** Local privacy-first provider for uniform studio backgrounds. Replaceable by a segmentation model adapter. */
export class LocalBackgroundRemovalProvider implements BackgroundRemovalProvider {
  async remove(image: Buffer): Promise<Buffer> {
    const { data, info } = await sharp(image).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const corners = [[0, 0], [info.width - 1, 0], [0, info.height - 1], [info.width - 1, info.height - 1]];
    const bg = corners.reduce<[number, number, number]>((acc, [x, y]) => {
      const offset = ((y ?? 0) * info.width + (x ?? 0)) * 4;
      return [acc[0] + (data[offset] ?? 0), acc[1] + (data[offset + 1] ?? 0), acc[2] + (data[offset + 2] ?? 0)];
    }, [0, 0, 0]);
    bg[0] /= corners.length; bg[1] /= corners.length; bg[2] /= corners.length;
    for (let i = 0; i < data.length; i += 4) {
      const distance = Math.hypot((data[i] ?? 0) - bg[0], (data[i + 1] ?? 0) - bg[1], (data[i + 2] ?? 0) - bg[2]);
      data[i + 3] = Math.max(0, Math.min(255, Math.round((distance - 18) * 7)));
    }
    return sharp(data, { raw: info }).png().toBuffer();
  }
}
