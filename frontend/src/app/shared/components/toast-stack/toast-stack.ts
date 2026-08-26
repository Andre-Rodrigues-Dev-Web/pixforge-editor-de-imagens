import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
@Component({ selector: 'pf-toast-stack', standalone: true, template: `<div class="stack" aria-live="polite" aria-atomic="true">@for (toast of toasts.items(); track toast.id) {<div class="toast" [class.error]="toast.kind === 'error'"><span>{{ toast.kind === 'error' ? '!' : '✓' }}</span>{{ toast.message }}</div>}</div>`, styles: [`
  .stack{position:fixed;z-index:1000;right:22px;bottom:22px;display:grid;gap:10px}.toast{min-width:280px;max-width:400px;padding:14px 18px;border:1px solid var(--border-color);border-left:4px solid #20a268;border-radius:12px;background:var(--background-secondary);box-shadow:var(--shadow-md);font-weight:700;display:flex;gap:10px}.toast.error{border-left-color:#d94141}.toast span{color:#20a268}.toast.error span{color:#d94141}@media(max-width:600px){.stack{left:14px;right:14px;bottom:14px}.toast{min-width:0}}
`], changeDetection: ChangeDetectionStrategy.OnPush })
export class ToastStackComponent { readonly toasts = inject(ToastService); }
