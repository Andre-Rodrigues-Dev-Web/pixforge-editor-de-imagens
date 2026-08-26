import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { buildApp } from './app.js';
import JSZip from 'jszip';

describe('PixForge API', () => {
  it('reports health', async () => {
    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/api/v1/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json().success).toBe(true);
    await app.close();
  });

  it('converts a real PNG to WebP', async () => {
    const app = await buildApp();
    const image = await sharp({ create: { width: 32, height: 32, channels: 4, background: '#fe7303' } }).png().toBuffer();
    const boundary = 'pixforge-test-boundary';
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n`), image, Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    const response = await app.inject({ method: 'POST', url: '/api/v1/images/convert?format=webp&quality=80', headers: { 'content-type': `multipart/form-data; boundary=${boundary}` }, payload: body });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/webp');
    await app.close();
  });

  it('creates a complete favicon ZIP', async () => {
    const app = await buildApp();
    const image = await sharp({ create: { width: 64, height: 64, channels: 4, background: '#101d30' } }).png().toBuffer();
    const boundary = 'pixforge-favicon-boundary';
    const body = Buffer.concat([Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="brand.png"\r\nContent-Type: image/png\r\n\r\n`), image, Buffer.from(`\r\n--${boundary}--\r\n`)]);
    const response = await app.inject({ method: 'POST', url: '/api/v1/favicon/generate', headers: { 'content-type': `multipart/form-data; boundary=${boundary}` }, payload: body });
    expect(response.statusCode).toBe(200);
    const zip = await JSZip.loadAsync(response.rawPayload);
    expect(Object.keys(zip.files)).toContain('favicon.ico');
    expect(Object.keys(zip.files)).toContain('site.webmanifest');
    expect(Object.keys(zip.files)).toContain('android-chrome-512x512.png');
    await app.close();
  });

  it('rejects files that only pretend to be images', async () => {
    const app = await buildApp(); const boundary = 'pixforge-invalid-boundary';
    const body = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="fake.png"\r\nContent-Type: image/png\r\n\r\nnot-an-image\r\n--${boundary}--\r\n`);
    const response = await app.inject({ method: 'POST', url: '/api/v1/images/convert', headers: { 'content-type': `multipart/form-data; boundary=${boundary}` }, payload: body });
    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('INVALID_IMAGE_FORMAT');
    await app.close();
  });
});
