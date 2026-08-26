import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight as ArrowRight, LucideClock3 as Clock3, LucideSearch as Search, LucideShieldCheck as ShieldCheck, LucideSparkles as Sparkles, LucideZap as Zap } from '@lucide/angular';
import { PIXFORGE_TOOLS } from '../../core/config/tools';
import { LucideIconComponent } from '../../shared/components/icon/icon';
@Component({ selector: 'pf-dashboard', standalone: true, imports: [RouterLink, LucideIconComponent], templateUrl: './dashboard.html', styleUrl: './dashboard.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class DashboardComponent {
  readonly query = signal(''); readonly icons = { ArrowRight, Clock3, Search, ShieldCheck, Sparkles, Zap };
  readonly tools = computed(() => { const term = this.query().toLowerCase().trim(); return term ? PIXFORGE_TOOLS.filter((tool) => `${tool.name} ${tool.description} ${tool.formats}`.toLowerCase().includes(term)) : PIXFORGE_TOOLS; });
}
