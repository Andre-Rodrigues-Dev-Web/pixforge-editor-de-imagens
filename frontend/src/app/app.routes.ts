import { Routes } from '@angular/router';

const workbench = (mode: 'converter' | 'optimizer' | 'background' | 'favicon') => ({
  loadComponent: () => import('./features/image-workbench/image-workbench').then((m) => m.ImageWorkbenchComponent), data: { mode }
});
const studio = (mode: 'editor' | 'thumbnail' | 'social') => ({
  loadComponent: () => import('./features/canvas-studio/canvas-studio').then((m) => m.CanvasStudioComponent), data: { mode }
});

export const routes: Routes = [
  { path: '', title: 'PixForge — Suas imagens, forjadas para impressionar', loadComponent: () => import('./features/landing/landing').then((m) => m.LandingComponent) },
  { path: '', loadComponent: () => import('./layout/workspace-shell/workspace-shell').then((m) => m.WorkspaceShellComponent), children: [
    { path: 'dashboard', title: 'Ferramentas | PixForge', loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardComponent) },
    { path: 'converter', title: 'Converter imagens | PixForge', ...workbench('converter') },
    { path: 'optimizer', title: 'Otimizar imagens | PixForge', ...workbench('optimizer') },
    { path: 'background-remover', title: 'Remover fundo | PixForge', ...workbench('background') },
    { path: 'favicon-generator', title: 'Gerar favicon | PixForge', ...workbench('favicon') },
    { path: 'photo-editor', title: 'Editor de fotos | PixForge', ...studio('editor') },
    { path: 'youtube-thumbnail', title: 'Criar thumbnail para YouTube | PixForge', ...studio('thumbnail') },
    { path: 'social-crop', title: 'Redimensionar para redes sociais | PixForge', ...studio('social') },
  ] },
  { path: 'converter-heic', redirectTo: 'converter', pathMatch: 'full' },
  { path: 'otimizar-imagem', redirectTo: 'optimizer', pathMatch: 'full' },
  { path: 'remover-fundo', redirectTo: 'background-remover', pathMatch: 'full' },
  { path: 'criar-thumbnail-youtube', redirectTo: 'youtube-thumbnail', pathMatch: 'full' },
  { path: 'gerar-favicon', redirectTo: 'favicon-generator', pathMatch: 'full' },
  { path: 'editor-de-fotos', redirectTo: 'photo-editor', pathMatch: 'full' },
  { path: 'redimensionar-imagem-redes-sociais', redirectTo: 'social-crop', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
