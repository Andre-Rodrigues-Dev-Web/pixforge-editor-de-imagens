import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class UploadTransferService {
  private readonly pending = signal<File[]>([]);
  set(files: File[]): void { this.pending.set(files); }
  take(): File[] { const files = this.pending(); this.pending.set([]); return files; }
}
