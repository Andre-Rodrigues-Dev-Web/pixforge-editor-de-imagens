import { ChangeDetectionStrategy, Component, HostListener, input, output, signal } from '@angular/core';
import { LucideUploadCloud as UploadCloud, LucideClipboardPaste as ClipboardPaste } from '@lucide/angular';
import { LucideIconComponent } from '../icon/icon';

@Component({
  selector: 'pf-upload-zone', standalone: true, imports: [LucideIconComponent], templateUrl: './upload-zone.html', styleUrl: './upload-zone.scss', changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadZoneComponent {
  readonly multiple = input(true); readonly compact = input(false); readonly maxFiles = input(30); readonly filesSelected = output<File[]>(); readonly dragging = signal(false);
  readonly icons = { UploadCloud, ClipboardPaste };
  onFiles(list: FileList | null): void { if (!list) return; this.emit(Array.from(list)); }
  onDrop(event: DragEvent): void { event.preventDefault(); this.dragging.set(false); this.onFiles(event.dataTransfer?.files ?? null); }
  onKey(event: KeyboardEvent, picker: HTMLInputElement): void { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); picker.click(); } }
  @HostListener('document:paste', ['$event']) onPaste(event: ClipboardEvent): void { const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith('image/')); if (files.length) this.emit(files); }
  private emit(files: File[]): void { const accepted = files.filter((file) => file.type.startsWith('image/') || /\.(heic|heif|jpe?g|png|webp|avif)$/i.test(file.name)); this.filesSelected.emit(this.multiple() ? accepted : accepted.slice(0, 1)); }
}
