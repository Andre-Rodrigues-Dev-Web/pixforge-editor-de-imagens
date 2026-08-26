import type { FastifyInstance, FastifyRequest } from 'fastify';
import { basename, extname } from 'node:path';
import type { ImageProcessorService, OutputFormat } from '../../services/image-processing/image-processor.js';
import type { ImageProcessingQueue } from '../../services/image-processing/queue.js';
import { validateImage } from '../../services/image-processing/image-validator.js';
import { AppError } from '../../errors/app-error.js';

interface TransformQuery { format?: OutputFormat; quality?: string; width?: string; height?: string; fit?: 'cover' | 'inside'; removeMetadata?: string; }

const extensionFor = (format: OutputFormat): string => format === 'jpeg' ? 'jpg' : format;

async function readUpload(request: FastifyRequest): Promise<{ buffer: Buffer; filename: string; originalBytes: number }> {
  const upload = await request.file();
  if (!upload) throw new AppError('FILE_REQUIRED', 'Selecione uma imagem para continuar.');
  const buffer = await upload.toBuffer();
  const validated = await validateImage(buffer);
  return { buffer: validated.normalizedBuffer, filename: basename(upload.filename).replace(/[^a-zA-Z0-9._-]/g, '_'), originalBytes: buffer.byteLength };
}

export async function registerImageRoutes(app: FastifyInstance, processor: ImageProcessorService, queue: ImageProcessingQueue): Promise<void> {
  const transform = async (request: FastifyRequest<{ Querystring: TransformQuery }>, reply: import('fastify').FastifyReply) => {
    const upload = await readUpload(request);
    const query = request.query;
    const format = query.format ?? 'webp';
    const result = await queue.run(() => processor.transform(upload.buffer, {
      format,
      quality: Number(query.quality ?? 85),
      width: query.width ? Number(query.width) : undefined,
      height: query.height ? Number(query.height) : undefined,
      fit: query.fit ?? 'inside',
      withoutEnlargement: true,
      removeMetadata: query.removeMetadata === 'true',
    }));
    const base = upload.filename.slice(0, Math.max(1, upload.filename.length - extname(upload.filename).length));
    return reply
      .header('content-type', `image/${format}`)
      .header('content-disposition', `attachment; filename="${base}-pixforge.${extensionFor(format)}"`)
      .header('x-pixforge-original-bytes', String(upload.originalBytes))
      .header('x-pixforge-width', String(result.width))
      .header('x-pixforge-height', String(result.height))
      .send(result.buffer);
  };

  app.post('/api/v1/images/convert', transform);
  app.post('/api/v1/images/optimize', transform);
  app.post('/api/v1/images/crop', transform);
  app.post('/api/v1/images/resize', transform);
  app.post('/api/v1/images/export', transform);

  app.post('/api/v1/images/remove-background', async (request, reply) => {
    const upload = await readUpload(request);
    const result = await queue.run(() => processor.removeBackground(upload.buffer));
    return reply
      .header('content-type', 'image/png')
      .header('content-disposition', 'attachment; filename="pixforge-sem-fundo.png"')
      .header('x-pixforge-original-bytes', String(upload.originalBytes))
      .header('x-pixforge-width', String(result.width))
      .header('x-pixforge-height', String(result.height))
      .send(result.buffer);
  });
}
