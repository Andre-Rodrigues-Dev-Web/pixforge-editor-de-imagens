import type { FastifyInstance, FastifyRequest } from 'fastify';
import sharp from 'sharp';
import JSZip from 'jszip';
import pngToIco from 'png-to-ico';
import { validateImage } from '../../services/image-processing/image-validator.js';
import { AppError } from '../../errors/app-error.js';

const manifest = JSON.stringify({ name: 'Meu site', short_name: 'Site', icons: [
  { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
  { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
], theme_color: '#101D30', background_color: '#FFFFFF', display: 'standalone' }, null, 2);

export async function registerFaviconRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/v1/favicon/generate', async (request: FastifyRequest, reply) => {
    const upload = await request.file();
    if (!upload) throw new AppError('FILE_REQUIRED', 'Selecione uma imagem para gerar os ícones.');
    const buffer = await upload.toBuffer();
    const validated = await validateImage(buffer);
    const zip = new JSZip();
    for (const [name, size] of [['favicon-16x16.png', 16], ['favicon-32x32.png', 32], ['apple-touch-icon.png', 180], ['android-chrome-192x192.png', 192], ['android-chrome-512x512.png', 512]] as const) {
      zip.file(name, await sharp(validated.normalizedBuffer).rotate().resize(size, size, { fit: 'cover' }).png().toBuffer());
    }
    const icoPng = await sharp(validated.normalizedBuffer).rotate().resize(32, 32, { fit: 'cover' }).png().toBuffer();
    zip.file('favicon.ico', await pngToIco(icoPng));
    zip.file('site.webmanifest', manifest);
    zip.file('favicon.html', '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">');
    const archive = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    return reply.header('content-type', 'application/zip').header('content-disposition', 'attachment; filename="pixforge-favicon-package.zip"').send(archive);
  });
}
