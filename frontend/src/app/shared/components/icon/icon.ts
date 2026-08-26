import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideDynamicIcon, type LucideIconInput } from '@lucide/angular';

@Component({
  selector: 'lucide-icon', standalone: true, imports: [LucideDynamicIcon],
  template: `<svg [lucideIcon]="img()" [size]="size()" [attr.aria-hidden]="title() ? null : 'true'"><title>{{ title() }}</title></svg>`,
  styles: [':host{display:inline-flex;line-height:0}svg{display:block}'], changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LucideIconComponent {
  readonly img = input.required<LucideIconInput>(); readonly size = input<number | string>(24); readonly title = input('');
}
