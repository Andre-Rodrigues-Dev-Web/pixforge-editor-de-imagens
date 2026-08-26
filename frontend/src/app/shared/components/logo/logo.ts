import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({ selector: 'pf-logo', standalone: true, template: `<a class="brand" href="/" aria-label="PixForge — início"><img src="/assets/pixforge-logo.png" alt="PixForge" [class.compact]="compact()"></a>`, styles: [`
  .brand{display:flex;align-items:center;height:44px}.brand img{width:150px;height:54px;object-fit:contain;object-position:left center}.brand img.compact{width:118px}
`], changeDetection: ChangeDetectionStrategy.OnPush })
export class LogoComponent { readonly compact = input(false); }
