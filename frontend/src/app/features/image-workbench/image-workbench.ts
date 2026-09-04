import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  LucideCheck as Check,
  LucideChevronDown as ChevronDown,
  LucideDownload as Download,
  LucideFileImage as FileImage,
  LucideRotateCcw as RotateCcw,
  LucideShieldCheck as ShieldCheck,
  LucideTrash2 as Trash2,
  LucideX as X,
} from '@lucide/angular';
import { UploadZoneComponent } from '../../shared/components/upload-zone/upload-zone';
import { BinaryResult, ImageApiService, ProcessKind } from '../../core/services/image-api.service';
import { ToastService } from '../../core/services/toast.service';
import { UploadTransferService } from '../../core/services/upload-transfer.service';
import { LucideIconComponent } from '../../shared/components/icon/icon';
import JSZip from 'jszip';

type WorkbenchMode = 'converter' | 'optimizer' | 'background' | 'favicon';
type ItemStatus = 'ready' | 'processing' | 'done' | 'error';
interface WorkItem {
  id: string;
  file: File;
  previewUrl: string;
  status: ItemStatus;
  progress: number;
  result?: BinaryResult;
  resultUrl?: string;
  error?: string;
}
const configs: Record<
  WorkbenchMode,
  {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    action: string;
    success: string;
  }
> = {
  converter: {
    eyebrow: 'Conversor universal',
    title: 'Converta sem perder a essência.',
    accent: 'Formato novo. Qualidade intacta.',
    description: 'Transforme HEIC, HEIF, JPEG, PNG e WebP individualmente ou em lote.',
    action: 'Converter imagens',
    success: 'Imagem convertida.',
  },
  optimizer: {
    eyebrow: 'Otimizador inteligente',
    title: 'Mais leve. Tão bonita quanto antes.',
    accent: 'Menos bytes, mesma presença.',
    description: 'Reduza drasticamente o peso com controle total de qualidade e dimensões.',
    action: 'Otimizar imagens',
    success: 'Otimização concluída.',
  },
  background: {
    eyebrow: 'Removedor de fundo',
    title: 'Destaque o que realmente importa.',
    accent: 'Fundo removido localmente.',
    description: 'Remova fundos uniformes com processamento privado e exporte PNG transparente.',
    action: 'Remover fundo',
    success: 'Fundo removido.',
  },
  favicon: {
    eyebrow: 'Gerador de favicon',
    title: 'Sua marca em cada detalhe.',
    accent: 'Um upload. Todos os ícones.',
    description: 'Gere o pacote completo de ícones, manifest e tags essenciais para seu site.',
    action: 'Gerar pacote favicon',
    success: 'Pacote favicon criado.',
  },
};

@Component({
  selector: 'pf-image-workbench',
  standalone: true,
  imports: [ReactiveFormsModule, LucideIconComponent, UploadZoneComponent],
  templateUrl: './image-workbench.html',
  styleUrl: './image-workbench.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageWorkbenchComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ImageApiService);
  private readonly toast = inject(ToastService);
  private readonly transfer = inject(UploadTransferService);
  readonly mode = (this.route.snapshot.data['mode'] as WorkbenchMode) ?? 'converter';
  readonly config = configs[this.mode];
  readonly items = signal<WorkItem[]>([]);
  readonly processing = signal(false);
  readonly cancelled = signal(false);
  readonly advanced = signal(false);
  readonly icons = { Check, ChevronDown, Download, FileImage, RotateCcw, ShieldCheck, Trash2, X };
  readonly form = this.fb.nonNullable.group({
    format: [this.mode === 'optimizer' ? 'webp' : 'jpeg'],
    quality: [85, [Validators.min(1), Validators.max(100)]],
    mode: ['balanced'],
    width: [0, [Validators.min(0)]],
    height: [0, [Validators.min(0)]],
    removeMetadata: [true],
    preserveRatio: [true],
    withoutEnlargement: [true],
  });
  readonly done = computed(() => this.items().filter((item) => item.status === 'done').length);
  readonly totalProgress = computed(() => {
    const list = this.items();
    return list.length
      ? Math.round(list.reduce((sum, item) => sum + item.progress, 0) / list.length)
      : 0;
  });

  constructor() {
    const transferred = this.transfer.take();
    if (transferred.length) this.addFiles(transferred);
  }

  addFiles(files: File[]): void {
    const available = Math.max(0, 30 - this.items().length);
    const valid = files.slice(0, available).filter((file) => file.size <= 50 * 1024 * 1024);
    if (valid.length !== files.length)
      this.toast.show('Alguns arquivos excedem o limite de 50 MB ou 30 itens.', 'error');
    const next = valid.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'ready' as const,
      progress: 0,
    }));
    this.items.update((items) =>
      this.mode === 'favicon' ? next.slice(0, 1) : [...items, ...next],
    );
  }

  remove(item: WorkItem): void {
    URL.revokeObjectURL(item.previewUrl);
    if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    this.items.update((items) => items.filter((candidate) => candidate.id !== item.id));
  }
  reset(): void {
    for (const item of this.items()) {
      URL.revokeObjectURL(item.previewUrl);
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    }
    this.items.set([]);
    this.cancelled.set(false);
  }

  async process(): Promise<void> {
    if (!this.items().length || this.processing()) return;
    this.processing.set(true);
    this.cancelled.set(false);
    const pending = this.items().filter((item) => item.status !== 'done');
    let cursor = 0;
    const worker = async (): Promise<void> => {
      while (cursor < pending.length && !this.cancelled()) {
        const item = pending[cursor++];
        if (item) await this.processItem(item);
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, pending.length) }, () => worker()));
    this.processing.set(false);
    if (!this.cancelled() && this.done()) this.toast.show(this.config.success);
  }

  cancel(): void {
    this.cancelled.set(true);
    this.processing.set(false);
    this.toast.show('Processamento cancelado.', 'info');
  }
  download(item: WorkItem): void {
    if (item.result) {
      this.api.download(item.result);
      this.toast.show('Download iniciado.');
    }
  }
  async downloadAll(): Promise<void> {
    const results = this.items().flatMap((item) => (item.result ? [item.result] : []));
    if (!results.length) return;
    const zip = new JSZip();
    for (const result of results) zip.file(result.filename, result.blob);
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    this.api.download({
      blob,
      filename: 'pixforge-resultados.zip',
      width: 0,
      height: 0,
      originalBytes: 0,
    });
    this.toast.show('Pacote ZIP criado.');
  }
  bytes(value: number): string {
    if (!value) return '0 KB';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    return `${(value / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
  }
  saving(item: WorkItem): number {
    return item.result ? Math.round((1 - item.result.blob.size / item.file.size) * 100) : 0;
  }

  private async processItem(item: WorkItem): Promise<void> {
    this.patch(item.id, { status: 'processing', progress: 12, error: undefined });
    const timer = setInterval(() => {
      const current = this.items().find((candidate) => candidate.id === item.id);
      if (current?.status === 'processing')
        this.patch(item.id, { progress: Math.min(88, current.progress + 7) });
    }, 160);
    try {
      const values = this.form.getRawValue();
      let result: BinaryResult;
      if (this.mode === 'favicon') result = await this.api.favicon(item.file);
      else {
        const kind: ProcessKind =
          this.mode === 'background'
            ? 'remove-background'
            : this.mode === 'optimizer'
              ? 'optimize'
              : 'convert';
        result = await this.api.process(item.file, kind, {
          format: this.mode === 'background' ? 'png' : values.format,
          quality: values.quality,
          width: values.width || undefined,
          height: values.height || undefined,
          removeMetadata: values.removeMetadata,
        });
      }
      const resultUrl = result.blob.type.startsWith('image/')
        ? URL.createObjectURL(result.blob)
        : undefined;
      this.patch(item.id, { status: 'done', progress: 100, result, resultUrl });
    } catch (error) {
      this.patch(item.id, { status: 'error', progress: 0, error: await this.messageFrom(error) });
    } finally {
      clearInterval(timer);
    }
  }

  private patch(id: string, value: Partial<WorkItem>): void {
    this.items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, ...value } : item)),
    );
  }
  private async messageFrom(error: unknown): Promise<string> {
    const maybe = error as { error?: Blob; message?: string };
    if (maybe.error instanceof Blob) {
      try {
        const payload = JSON.parse(await maybe.error.text()) as { error?: { message?: string } };
        return payload.error?.message ?? 'Não foi possível processar a imagem.';
      } catch {
        return 'Não foi possível processar a imagem.';
      }
    }
    return maybe.message ?? 'Não foi possível processar a imagem.';
  }
  ngOnDestroy(): void {
    for (const item of this.items()) {
      URL.revokeObjectURL(item.previewUrl);
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    }
  }
}
