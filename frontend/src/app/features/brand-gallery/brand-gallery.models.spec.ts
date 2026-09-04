import { describe, expect, it } from 'vitest';
import {
  csvCell,
  eventOutputFilename,
  galleryFilename,
  outputDimensions,
  slugify,
} from './brand-gallery.models';

describe('brand gallery helpers', () => {
  it('reduces large gallery images without changing their aspect ratio', () => {
    expect(outputDimensions(6000, 4000, 1920)).toEqual({ width: 1920, height: 1280 });
    expect(outputDimensions(1200, 800, 1920)).toEqual({ width: 1200, height: 800 });
  });

  it('creates safe, brand-aware output filenames', () => {
    expect(galleryFilename('Foto 1.png', 'bambui', 'image/webp')).toBe(
      'Foto-1-bambui-galeria.webp',
    );
    expect(galleryFilename('evento.jpg', 'minas', 'image/jpeg')).toBe('evento-minas-galeria.jpg');
    expect(galleryFilename('Festa Agosto.png', 'na-balada-mg', 'image/webp')).toBe(
      'Festa-Agosto-na-balada-mg-galeria.webp',
    );
  });

  it('creates ordered editorial filenames for every event output', () => {
    expect(eventOutputFilename('Festa do Rosário 2026', 'bambui', 7, 'feed', 'image/webp')).toBe(
      'festa-do-rosario-2026-bambui-007-feed.webp',
    );
    expect(slugify('  São João & Tradição  ')).toBe('sao-joao-tradicao');
  });

  it('escapes spreadsheet formulas and quotes in CSV cells', () => {
    expect(csvCell('=HYPERLINK("https://example.com")')).toBe(
      '"\'=HYPERLINK(""https://example.com"")"',
    );
    expect(csvCell('Legenda, com vírgula')).toBe('"Legenda, com vírgula"');
  });
});
