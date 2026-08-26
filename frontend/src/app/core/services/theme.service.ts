import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
export type ThemeMode = 'light' | 'dark' | 'system';
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly mode = signal<ThemeMode>(this.readMode());
  constructor() { effect(() => {
    const mode = this.mode(); const resolved = mode === 'system' && typeof matchMedia !== 'undefined' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;
    if (this.isBrowser) this.document.documentElement.dataset['theme'] = resolved;
    if (this.isBrowser && typeof localStorage.setItem === 'function') localStorage.setItem('pixforge-theme', mode);
  }); }
  cycle(): void { const modes: ThemeMode[] = ['light', 'dark', 'system']; this.mode.set(modes[(modes.indexOf(this.mode()) + 1) % modes.length]!); }
  private readMode(): ThemeMode { if (!this.isBrowser || typeof localStorage.getItem !== 'function') return 'system'; const stored = localStorage.getItem('pixforge-theme'); return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'; }
}
