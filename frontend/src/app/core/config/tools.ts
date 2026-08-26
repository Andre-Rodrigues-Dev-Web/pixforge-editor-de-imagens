export interface PixForgeTool {
  id: string; name: string; shortName: string; description: string; route: string; icon: string;
  category: 'transform' | 'create' | 'edit'; formats: string;
}

export const PIXFORGE_TOOLS: readonly PixForgeTool[] = [
  { id: 'converter', name: 'Conversor universal', shortName: 'Converter', description: 'Converta HEIC, HEIF, PNG, JPEG e WebP.', route: '/converter', icon: 'refresh-cw', category: 'transform', formats: 'HEIC · JPG · PNG · WEBP' },
  { id: 'optimizer', name: 'Otimizador inteligente', shortName: 'Otimizar', description: 'Reduza o peso sem comprometer a qualidade.', route: '/optimizer', icon: 'gauge', category: 'transform', formats: 'JPG · PNG · WEBP · AVIF' },
  { id: 'background', name: 'Removedor de fundo', shortName: 'Remover fundo', description: 'Remova fundos e exporte transparência.', route: '/background-remover', icon: 'scan', category: 'transform', formats: 'PRIVADO · SEM API PAGA' },
  { id: 'thumbnail', name: 'Thumbnail YouTube', shortName: 'Thumbnail', description: 'Crie thumbnails profissionais em poucos minutos.', route: '/youtube-thumbnail', icon: 'youtube', category: 'create', formats: '1280 × 720 · 16:9' },
  { id: 'favicon', name: 'Gerador de favicon', shortName: 'Favicon', description: 'Crie todos os ícones do seu site.', route: '/favicon-generator', icon: 'app-window', category: 'create', formats: 'PNG · MANIFEST · ZIP' },
  { id: 'editor', name: 'Editor de fotos', shortName: 'Editor', description: 'Ajuste cores, luz, filtros e detalhes.', route: '/photo-editor', icon: 'sliders-horizontal', category: 'edit', formats: 'AJUSTES NÃO DESTRUTIVOS' },
  { id: 'social', name: 'Social Crop', shortName: 'Social Crop', description: 'Redimensione imagens para qualquer rede social.', route: '/social-crop', icon: 'crop', category: 'edit', formats: 'FEED · STORY · CAPAS' },
] as const;
