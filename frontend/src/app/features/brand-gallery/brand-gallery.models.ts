export type BrandId = 'bambui' | 'minas' | 'na-balada-mg';
export type GalleryFormat = 'image/webp' | 'image/jpeg';
export type EditorialOutputId = 'gallery' | 'cover' | 'feed' | 'story' | 'thumbnail';

export interface BrandPreset {
  id: BrandId;
  name: string;
  shortName: string;
  website: string;
  footerText: string;
  footerControlLabel: string;
  accent: string;
  logo: string;
  logoPlacement: 'top-right' | 'bottom-center';
}

export interface EditorialOutputPreset {
  id: EditorialOutputId;
  name: string;
  description: string;
  folder: string;
  width?: number;
  height?: number;
  fit: 'inside' | 'cover';
}

export const EDITORIAL_OUTPUT_PRESETS: readonly EditorialOutputPreset[] = [
  {
    id: 'gallery',
    name: 'Galeria do site',
    description: 'Proporção original · largura configurável',
    folder: 'galeria',
    fit: 'inside',
  },
  {
    id: 'cover',
    name: 'Capa da matéria',
    description: '1200 × 630 · horizontal',
    folder: 'capa',
    width: 1200,
    height: 630,
    fit: 'cover',
  },
  {
    id: 'feed',
    name: 'Instagram Feed',
    description: '1080 × 1350 · 4:5',
    folder: 'instagram-feed',
    width: 1080,
    height: 1350,
    fit: 'cover',
  },
  {
    id: 'story',
    name: 'Story / Reels',
    description: '1080 × 1920 · 9:16',
    folder: 'story',
    width: 1080,
    height: 1920,
    fit: 'cover',
  },
  {
    id: 'thumbnail',
    name: 'Miniatura',
    description: '640 × 426 · listagens',
    folder: 'miniaturas',
    width: 640,
    height: 426,
    fit: 'cover',
  },
] as const;

export const BRAND_PRESETS: Record<BrandId, BrandPreset> = {
  bambui: {
    id: 'bambui',
    name: 'Jornal Sou Mais Bambuí',
    shortName: 'Sou Mais Bambuí',
    website: 'soumaisbambui.com.br',
    footerText: 'Acesse nosso site: soumaisbambui.com.br',
    footerControlLabel: 'Adicionar endereço do site',
    accent: '#07963f',
    logo: '/assets/brands/sou-mais-bambui.png',
    logoPlacement: 'bottom-center',
  },
  minas: {
    id: 'minas',
    name: 'Sou Mais Minas Gerais',
    shortName: 'Sou Mais Minas Gerais',
    website: 'soumaisminasgerais.com.br',
    footerText: 'Acesse nosso site: soumaisminasgerais.com.br',
    footerControlLabel: 'Adicionar endereço do site',
    accent: '#ed1c24',
    logo: '/assets/brands/sou-mais-minas-gerais-primary.png',
    logoPlacement: 'top-right',
  },
  'na-balada-mg': {
    id: 'na-balada-mg',
    name: 'Na BaladaMG',
    shortName: 'Na BaladaMG',
    website: 'instagram.com/nabaladamg_oficial',
    footerText: 'Siga nosso Instagram: @nabaladamg_oficial',
    footerControlLabel: 'Adicionar chamada do Instagram',
    accent: '#00d9ea',
    logo: '/assets/brands/na-balada-mg.png',
    logoPlacement: 'top-right',
  },
};

export function outputDimensions(
  width: number,
  height: number,
  maxWidth: number,
): { width: number; height: number } {
  const safeWidth = Math.max(320, maxWidth);
  const scale = Math.min(1, safeWidth / width);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export function galleryFilename(filename: string, brand: BrandId, format: GalleryFormat): string {
  const clean =
    filename
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-z0-9-_]+/gi, '-')
      .replace(/^-+|-+$/g, '') || 'imagem';
  return `${clean}-${brand}-galeria.${format === 'image/webp' ? 'webp' : 'jpg'}`;
}

export function slugify(value: string, fallback = 'evento'): string {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || fallback
  );
}

export function eventOutputFilename(
  eventName: string,
  brand: BrandId,
  order: number,
  output: EditorialOutputId,
  format: GalleryFormat,
): string {
  const sequence = String(order).padStart(3, '0');
  const extension = format === 'image/webp' ? 'webp' : 'jpg';
  return `${slugify(eventName)}-${brand}-${sequence}-${output}.${extension}`;
}

export function csvCell(value: string | number | boolean): string {
  let safe = String(value ?? '');
  if (/^[=+\-@]/.test(safe)) safe = `'${safe}`;
  return `"${safe.replace(/"/g, '""')}"`;
}
