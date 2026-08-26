import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
export type ProcessKind = 'convert' | 'optimize' | 'remove-background' | 'crop' | 'resize' | 'export';
export interface ProcessOptions { format?: string; quality?: number; width?: number; height?: number; fit?: string; removeMetadata?: boolean; }
export interface BinaryResult { blob: Blob; filename: string; width: number; height: number; originalBytes: number; }
@Injectable({ providedIn: 'root' })
export class ImageApiService {
  private readonly http = inject(HttpClient); private readonly api = 'http://localhost:3000/api/v1';
  async process(file: File, kind: ProcessKind, options: ProcessOptions = {}): Promise<BinaryResult> {
    const body = new FormData(); body.append('file', file, file.name); let params = new HttpParams();
    for (const [key, value] of Object.entries(options)) if (value !== undefined) params = params.set(key, String(value));
    const response = await firstValueFrom(this.http.post(`${this.api}/images/${kind}`, body, { params, observe: 'response', responseType: 'blob' }));
    return { blob: response.body ?? new Blob(), filename: this.filenameFrom(response.headers.get('content-disposition')), width: Number(response.headers.get('x-pixforge-width') ?? 0), height: Number(response.headers.get('x-pixforge-height') ?? 0), originalBytes: Number(response.headers.get('x-pixforge-original-bytes') ?? file.size) };
  }
  async favicon(file: File): Promise<BinaryResult> { const body = new FormData(); body.append('file', file, file.name); const response = await firstValueFrom(this.http.post(`${this.api}/favicon/generate`, body, { observe: 'response', responseType: 'blob' })); return { blob: response.body ?? new Blob(), filename: 'pixforge-favicon-package.zip', width: 0, height: 0, originalBytes: file.size }; }
  download(result: BinaryResult): void { const url = URL.createObjectURL(result.blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = result.filename; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  private filenameFrom(disposition: string | null): string { return disposition?.match(/filename="?([^";]+)"?/i)?.[1] ?? 'pixforge-result.webp'; }
}
