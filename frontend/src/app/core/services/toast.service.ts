import { Injectable, signal } from '@angular/core';
export interface Toast { id: number; message: string; kind: 'success' | 'error' | 'info'; }
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly items = signal<Toast[]>([]); private id = 0;
  show(message: string, kind: Toast['kind'] = 'success'): void { const id = ++this.id; this.items.update((items) => [...items, { id, message, kind }]); setTimeout(() => this.items.update((items) => items.filter((item) => item.id !== id)), 3600); }
}
