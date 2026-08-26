import 'dotenv/config';

const numberFromEnv = (name: string, fallback: number): number => {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = Object.freeze({
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port: numberFromEnv('PORT', 3000),
  maxUploadBytes: numberFromEnv('MAX_UPLOAD_SIZE_MB', 50) * 1024 * 1024,
  maxBatchFiles: numberFromEnv('MAX_BATCH_FILES', 30),
  concurrency: numberFromEnv('IMAGE_PROCESSING_CONCURRENCY', 4),
  corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:4200',
});
