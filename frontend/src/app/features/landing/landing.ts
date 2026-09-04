import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAppWindow as AppWindow,
  LucideArrowRight as ArrowRight,
  LucideCheck as Check,
  LucideCrop as Crop,
  LucideGauge as Gauge,
  LucideMenu as Menu,
  LucideRefreshCw as RefreshCw,
  LucideScan as Scan,
  LucideShieldCheck as ShieldCheck,
  LucideSlidersHorizontal as SlidersHorizontal,
  LucideSparkles as Sparkles,
  LucideX as X,
  LucidePlay as Youtube,
  LucideZap as Zap,
  type LucideIconInput,
} from '@lucide/angular';
import { LogoComponent } from '../../shared/components/logo/logo';
import { UploadZoneComponent } from '../../shared/components/upload-zone/upload-zone';
import { PIXFORGE_TOOLS } from '../../core/config/tools';
import { UploadTransferService } from '../../core/services/upload-transfer.service';
import { LucideIconComponent } from '../../shared/components/icon/icon';

@Component({
  selector: 'pf-landing',
  standalone: true,
  imports: [RouterLink, LucideIconComponent, LogoComponent, UploadZoneComponent],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  readonly tools = PIXFORGE_TOOLS;
  readonly menuOpen = signal(false);
  readonly icons = { ArrowRight, Check, Menu, ShieldCheck, Sparkles, X, Zap };
  private readonly toolIcons: Record<string, LucideIconInput> = {
    converter: RefreshCw,
    optimizer: Gauge,
    background: Scan,
    thumbnail: Youtube,
    favicon: AppWindow,
    editor: SlidersHorizontal,
    social: Crop,
  };
  private readonly router = inject(Router);
  private readonly transfer = inject(UploadTransferService);
  start(files: File[]): void {
    if (!files.length) return;
    this.transfer.set(files);
    void this.router.navigateByUrl('/converter');
  }
  toolIcon(id: string): LucideIconInput {
    return this.toolIcons[id] ?? Sparkles;
  }
}
