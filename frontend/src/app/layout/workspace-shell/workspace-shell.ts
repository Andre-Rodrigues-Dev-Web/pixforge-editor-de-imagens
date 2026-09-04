import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideAppWindow as AppWindow,
  LucideBadge as Badge,
  LucideChevronLeft as ChevronLeft,
  LucideChevronRight as ChevronRight,
  LucideCrop as Crop,
  LucideGauge as Gauge,
  LucideHome as Home,
  LucideMenu as Menu,
  LucideMoon as Moon,
  LucidePlay as Youtube,
  LucideRefreshCw as RefreshCw,
  LucideScan as Scan,
  LucideSearch as Search,
  LucideSlidersHorizontal as SlidersHorizontal,
  LucideSparkles as Sparkles,
  LucideX as X,
  type LucideIconInput,
} from '@lucide/angular';
import { LogoComponent } from '../../shared/components/logo/logo';
import { ToastStackComponent } from '../../shared/components/toast-stack/toast-stack';
import { PIXFORGE_TOOLS } from '../../core/config/tools';
import { ThemeService } from '../../core/services/theme.service';
import { LucideIconComponent } from '../../shared/components/icon/icon';

@Component({ selector: 'pf-workspace-shell', standalone: true, imports: [RouterLink, RouterLinkActive, RouterOutlet, LucideIconComponent, LogoComponent, ToastStackComponent], templateUrl: './workspace-shell.html', styleUrl: './workspace-shell.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class WorkspaceShellComponent {
  readonly tools = PIXFORGE_TOOLS; readonly collapsed = signal(false); readonly mobileOpen = signal(false); readonly theme = inject(ThemeService);
  readonly icons = { ChevronLeft, ChevronRight, Home, Menu, Moon, Search, X };
  private readonly toolIcons: Record<string, LucideIconInput> = {
    converter: RefreshCw,
    optimizer: Gauge,
    background: Scan,
    thumbnail: Youtube,
    favicon: AppWindow,
    editor: SlidersHorizontal,
    social: Crop,
    'brand-gallery': Badge,
  };

  toolIcon(id: string): LucideIconInput {
    return this.toolIcons[id] ?? Sparkles;
  }
}
