import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { AppError } from './errors/app-error.js';
import { LocalBackgroundRemovalProvider } from './services/image-processing/background-provider.js';
import { ImageProcessorService } from './services/image-processing/image-processor.js';
import { ImageProcessingQueue } from './services/image-processing/queue.js';
import { registerImageRoutes } from './modules/images/routes.js';
import { registerFaviconRoutes } from './modules/favicon/routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: env.nodeEnv !== 'test', bodyLimit: env.maxUploadBytes, requestTimeout: 60_000 });
  await app.register(cors, { origin: env.corsOrigin, exposedHeaders: ['content-disposition', 'x-pixforge-original-bytes', 'x-pixforge-width', 'x-pixforge-height'] });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(compress);
  await app.register(rateLimit, { max: 60, timeWindow: '1 minute' });
  await app.register(multipart, { limits: { fileSize: env.maxUploadBytes, files: env.maxBatchFiles, fields: 12 } });

  const processor = new ImageProcessorService(new LocalBackgroundRemovalProvider());
  const queue = new ImageProcessingQueue(env.concurrency);
  await registerImageRoutes(app, processor, queue);
  await registerFaviconRoutes(app);

  app.get('/api/v1/health', async () => ({ success: true, data: { status: 'ok', service: 'pixforge-api' }, meta: {} }));
  app.setNotFoundHandler((_request, reply) => reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Recurso não encontrado.' } }));
  app.setErrorHandler((error, _request, reply) => {
    const candidate = error as { statusCode?: number };
    const isAppError = error instanceof AppError;
    const statusCode = isAppError ? error.statusCode : (candidate.statusCode && candidate.statusCode < 500 ? candidate.statusCode : 500);
    const code = isAppError ? error.code : statusCode === 413 ? 'FILE_TOO_LARGE' : 'PROCESSING_ERROR';
    const message = isAppError ? error.message : statusCode === 413 ? 'Esta imagem ultrapassa o limite permitido.' : 'Não foi possível forjar sua imagem. Tente novamente.';
    if (statusCode >= 500) app.log.error({ err: error, code }, 'Image processing failed');
    return reply.status(statusCode).send({ success: false, error: { code, message } });
  });
  return app;
}
