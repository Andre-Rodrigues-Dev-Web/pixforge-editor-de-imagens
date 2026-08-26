import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideChevronLeft as ChevronLeft, LucideChevronRight as ChevronRight, LucideHome as Home, LucideMenu as Menu, LucideMoon as Moon, LucideSearch as Search, LucideX as X } from '@lucide/angular';
import { LogoComponent } from '../../shared/components/logo/logo';
import { ToastStackComponent } from '../../shared/components/toast-stack/toast-stack';
import { PIXFORGE_TOOLS } from '../../core/config/tools';
import { ThemeService } from '../../core/services/theme.service';
import { LucideIconComponent } from '../../shared/components/icon/icon';

@Component({ selector: 'pf-workspace-shell', standalone: true, imports: [RouterLink, RouterLinkActive, RouterOutlet, LucideIconComponent, LogoComponent, ToastStackComponent], templateUrl: './workspace-shell.html', styleUrl: './workspace-shell.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class WorkspaceShellComponent {
  readonly tools = PIXFORGE_TOOLS; readonly collapsed = signal(false); readonly mobileOpen = signal(false); readonly theme = inject(ThemeService);
  readonly icons = { ChevronLeft, ChevronRight, Home, Menu, Moon, Search, X };
}
