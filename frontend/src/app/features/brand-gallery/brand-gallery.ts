import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import JSZip from 'jszip';
import {
  LucideArrowDown as ArrowDown,
  LucideArrowUp as ArrowUp,
  LucideCheck as Check,
  LucideCircleCheck as CircleCheck,
  LucideDownload as Download,
  LucideFileArchive as FileArchive,
  LucideImagePlus as ImagePlus,
  LucideLoaderCircle as LoaderCircle,
  LucideRotateCcw as RotateCcw,
  LucideRotateCw as RotateCw,
  LucideShieldCheck as ShieldCheck,
  LucideSparkles as Sparkles,
  LucideStar as Star,
  LucideTrash2 as Trash2,
  LucideTriangleAlert as TriangleAlert,
  LucideX as X,
  LucideZap as Zap,
} from '@lucide/angular';
import { ToastService } from '../../core/services/toast.service';
import { LucideIconComponent } from '../../shared/components/icon/icon';
import { UploadZoneComponent } from '../../shared/components/upload-zone/upload-zone';
import {
  BRAND_PRESETS,
  BrandId,
  EDITORIAL_OUTPUT_PRESETS,
  EditorialOutputId,
  GalleryFormat,
  csvCell,
  eventOutputFilename,
  outputDimensions,
  slugify,
} from './brand-gallery.models';

type FileStatus = 'ready' | 'processing' | 'done' | 'error';
type EditablePhotoField = 'caption' | 'credit' | 'altText';
type AdjustmentField = 'brightness' | 'contrast' | 'focalX' | 'focalY';

interface OutputArtifact {
  id: EditorialOutputId;
  blob: Blob;
  url: string;
  filename: string;
  width: number;
  height: number;
}

interface GalleryFile {
  id: string;
  file: File;
  sourceUrl: string;
  width: number;
  height: number;
  status: FileStatus;
  included: boolean;
  favorite: boolean;
  rotation: number;
  brightness: number;
  contrast: number;
  focalX: number;
  focalY: number;
  caption: string;
  credit: string;
  altText: string;
  outputs: Partial<Record<EditorialOutputId, OutputArtifact>>;
  warnings: string[];
  error?: string;
}

@Component({
  selector: 'pf-brand-gallery',
  standalone: true,
  imports: [LucideIconComponent, UploadZoneComponent],
  templateUrl: './brand-gallery.html',
  styleUrl: './brand-gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandGalleryComponent implements OnDestroy {
  @ViewChild('previewCanvas') private previewCanvas?: ElementRef<HTMLCanvasElement>;
  private readonly toast = inject(ToastService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly logoCache = new Map<BrandId, HTMLImageElement>();
  private previewRevision = 0;

  readonly brands = BRAND_PRESETS;
  readonly outputPresets = EDITORIAL_OUTPUT_PRESETS;
  readonly brand = signal<BrandId>('bambui');
  readonly eventName = signal('');
  readonly eventDate = signal('');
  readonly eventCity = signal('');
  readonly photographer = signal('');
  readonly includeLogo = signal(true);
  readonly includeText = signal(true);
  readonly logoOpacity = signal(90);
  readonly logoScale = signal(100);
  readonly format = signal<GalleryFormat>('image/webp');
  readonly quality = signal(78);
  readonly maxWidth = signal(1920);
  readonly selectedOutputs = signal<EditorialOutputId[]>([
    'gallery',
    'cover',
    'feed',
    'story',
    'thumbnail',
  ]);
  readonly previewOutput = signal<EditorialOutputId>('gallery');
  readonly files = signal<GalleryFile[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly processing = signal(false);
  readonly current = computed(
    () => this.files().find((item) => item.id === this.selectedId()) ?? this.files()[0],
  );
  readonly activeBrand = computed(() => BRAND_PRESETS[this.brand()]);
  readonly includedFiles = computed(() => this.files().filter((item) => item.included));
  readonly favoriteCount = computed(
    () => this.files().filter((item) => item.included && item.favorite).length,
  );
  readonly processedCount = computed(
    () => this.files().filter((item) => item.included && item.status === 'done').length,
  );
  readonly totalOriginalBytes = computed(() =>
    this.includedFiles().reduce((sum, item) => sum + item.file.size, 0),
  );
  readonly galleryOutputBytes = computed(() =>
    this.includedFiles().reduce(
      (sum, item) => sum + (item.outputs.gallery?.blob.size ?? 0),
      0,
    ),
  );
  readonly totalOutputBytes = computed(() =>
    this.includedFiles().reduce(
      (sum, item) =>
        sum + Object.values(item.outputs).reduce((fileSum, output) => fileSum + output.blob.size, 0),
      0,
    ),
  );
  readonly gallerySavings = computed(() => {
    const original = this.totalOriginalBytes();
    const output = this.galleryOutputBytes();
    return original && output ? Math.max(0, Math.round((1 - output / original) * 100)) : 0;
  });
  readonly readyForDownload = computed(
    () => Boolean(this.includedFiles().length) && this.processedCount() === this.includedFiles().length,
  );
  readonly icons = {
    ArrowDown,
    ArrowUp,
    Check,
    CircleCheck,
    Download,
    FileArchive,
    ImagePlus,
    LoaderCircle,
    RotateCcw,
    RotateCw,
    ShieldCheck,
    Sparkles,
    Star,
    Trash2,
    TriangleAlert,
    X,
    Zap,
  };

  constructor() {
    if (!this.isBrowser || typeof localStorage.getItem !== 'function') return;
    const savedBrand = localStorage.getItem('pixforge:event:last-brand');
    if (savedBrand && savedBrand in BRAND_PRESETS) this.brand.set(savedBrand as BrandId);
    this.loadPreferences(this.brand());
  }

  async addFiles(selected: File[]): Promise<void> {
    const available = Math.max(0, 200 - this.files().length);
    const known = new Set(
      this.files().map((item) => `${item.file.name}:${item.file.size}:${item.file.lastModified}`),
    );
    const accepted = selected
      .filter((file) => {
        const fingerprint = `${file.name}:${file.size}:${file.lastModified}`;
        if (known.has(fingerprint)) return false;
        known.add(fingerprint);
        return true;
      })
      .slice(0, available);
    const valid: GalleryFile[] = [];
    for (const file of accepted) {
      const item = await this.loadFile(file);
      if (item) valid.push(item);
    }
    if (!valid.length) return;
    if (accepted.length !== selected.length) {
      this.toast.show('Arquivos duplicados ou acima do limite foram ignorados.', 'info');
    }
    this.files.update((items) => [...items, ...valid]);
    this.selectedId.set(this.selectedId() ?? valid[0]!.id);
    await this.preloadActiveLogo();
    this.schedulePreview();
    this.toast.show(
      `${valid.length} ${valid.length === 1 ? 'imagem adicionada' : 'imagens adicionadas'}.`,
    );
  }

  select(id: string): void {
    this.selectedId.set(id);
    this.schedulePreview();
  }

  remove(id: string): void {
    const item = this.files().find((candidate) => candidate.id === id);
    if (item) this.releaseFile(item);
    this.files.update((items) => items.filter((candidate) => candidate.id !== id));
    if (this.selectedId() === id) this.selectedId.set(this.files()[0]?.id ?? null);
    this.schedulePreview();
  }

  clear(): void {
    this.files().forEach((item) => this.releaseFile(item));
    this.files.set([]);
    this.selectedId.set(null);
  }

  move(id: string, direction: -1 | 1): void {
    const items = [...this.files()];
    const index = items.findIndex((item) => item.id === id);
    const destination = index + direction;
    if (index < 0 || destination < 0 || destination >= items.length) return;
    [items[index], items[destination]] = [items[destination]!, items[index]!];
    this.files.set(items);
    this.invalidateResults();
  }

  toggleIncluded(id: string): void {
    this.patchFile(id, { included: !this.files().find((item) => item.id === id)?.included });
    this.invalidateResults();
  }

  toggleFavorite(id: string): void {
    const item = this.files().find((candidate) => candidate.id === id);
    if (!item) return;
    this.patchFile(id, { favorite: !item.favorite, included: true });
    this.invalidateResults();
  }

  chooseBrand(brand: BrandId): void {
    if (this.brand() === brand) return;
    this.savePreferences();
    this.brand.set(brand);
    if (this.isBrowser && typeof localStorage.setItem === 'function') localStorage.setItem('pixforge:event:last-brand', brand);
    this.loadPreferences(brand);
    void this.preloadActiveLogo().then(() => this.invalidateResults());
  }

  setEventField(field: 'name' | 'date' | 'city' | 'photographer', value: string): void {
    if (field === 'name') this.eventName.set(value);
    if (field === 'date') this.eventDate.set(value);
    if (field === 'city') this.eventCity.set(value);
    if (field === 'photographer') this.photographer.set(value);
    this.invalidateResults();
  }

  updateCurrent(field: EditablePhotoField, value: string): void {
    const item = this.current();
    if (!item) return;
    this.patchFile(item.id, { [field]: value });
    this.invalidateResults(false);
  }

  adjustCurrent(field: AdjustmentField, value: string): void {
    const item = this.current();
    if (!item) return;
    this.patchFile(item.id, { [field]: Number(value) });
    this.invalidateResults();
  }

  rotateCurrent(degrees: -90 | 90): void {
    const item = this.current();
    if (!item) return;
    this.patchFile(item.id, { rotation: (item.rotation + degrees + 360) % 360 });
    this.invalidateResults();
  }

  toggleLogo(): void {
    this.includeLogo.update((value) => !value);
    this.savePreferences();
    this.invalidateResults();
  }

  toggleText(): void {
    this.includeText.update((value) => !value);
    this.savePreferences();
    this.invalidateResults();
  }

  setLogoOpacity(value: string): void {
    this.logoOpacity.set(Number(value));
    this.savePreferences();
    this.invalidateResults();
  }

  setLogoScale(value: string): void {
    this.logoScale.set(Number(value));
    this.savePreferences();
    this.invalidateResults();
  }

  setFormat(format: GalleryFormat): void {
    this.format.set(format);
    this.savePreferences();
    this.invalidateResults();
  }

  setQuality(value: string): void {
    this.quality.set(Number(value));
    this.savePreferences();
    this.invalidateResults();
  }

  setMaxWidth(value: string): void {
    this.maxWidth.set(Number(value));
    this.savePreferences();
    this.invalidateResults();
  }

  toggleOutput(id: EditorialOutputId): void {
    this.selectedOutputs.update((selected) =>
      selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id],
    );
    if (!this.selectedOutputs().includes(this.previewOutput())) {
      this.previewOutput.set(this.selectedOutputs()[0] ?? 'gallery');
    }
    this.savePreferences();
    this.invalidateResults();
  }

  choosePreviewOutput(id: EditorialOutputId): void {
    this.previewOutput.set(id);
    this.schedulePreview();
  }

  isOutputSelected(id: EditorialOutputId): boolean {
    return this.selectedOutputs().includes(id);
  }

  async processAll(): Promise<void> {
    const included = this.includedFiles();
    if (!included.length || !this.selectedOutputs().length || this.processing()) return;
    this.processing.set(true);
    await this.preloadActiveLogo();
    this.revokeOutputs();
    const socialTargets = this.socialTargets(included);
    for (const item of included) {
      this.patchFile(item.id, { status: 'processing', outputs: {}, error: undefined });
      try {
        const outputs: Partial<Record<EditorialOutputId, OutputArtifact>> = {};
        for (const outputId of this.selectedOutputs()) {
          if (!this.shouldRenderOutput(item, outputId, socialTargets)) continue;
          const canvas = await this.renderItem(item, outputId);
          const blob = await this.canvasToBlob(canvas, this.format(), this.quality() / 100);
          const filename = eventOutputFilename(
            this.eventName(),
            this.brand(),
            this.orderOf(item),
            outputId,
            this.format(),
          );
          outputs[outputId] = {
            id: outputId,
            blob,
            url: URL.createObjectURL(blob),
            filename,
            width: canvas.width,
            height: canvas.height,
          };
        }
        this.patchFile(item.id, { status: 'done', outputs });
      } catch (error) {
        this.patchFile(item.id, {
          status: 'error',
          outputs: {},
          error: error instanceof Error ? error.message : 'Falha ao processar',
        });
      }
    }
    this.processing.set(false);
    this.schedulePreview();
    if (this.processedCount()) this.toast.show('Pacote editorial pronto para baixar.');
  }

  async downloadAll(): Promise<void> {
    if (!this.readyForDownload()) return;
    const zip = new JSZip();
    const manifest = this.buildManifest();
    for (const item of this.includedFiles()) {
      for (const output of Object.values(item.outputs)) {
        const preset = EDITORIAL_OUTPUT_PRESETS.find((candidate) => candidate.id === output.id);
        zip.file(`${preset?.folder ?? output.id}/${output.filename}`, output.blob);
      }
    }
    zip.file('dados/manifesto.json', JSON.stringify(manifest, null, 2));
    zip.file('dados/fotos.csv', this.buildCsv());
    zip.file('dados/wordpress-import.json', JSON.stringify(this.buildWordPressManifest(), null, 2));
    zip.file(
      'LEIA-ME.txt',
      [
        `Evento: ${this.eventName() || 'Evento sem nome'}`,
        `Veículo: ${this.activeBrand().name}`,
        `Data: ${this.eventDate() || 'Não informada'}`,
        `Cidade: ${this.eventCity() || 'Não informada'}`,
        `Fotógrafo: ${this.photographer() || 'Não informado'}`,
        '',
        'As imagens estão separadas por canal. A pasta dados contém os manifestos editorial e WordPress.',
        'Revise legendas, créditos e textos alternativos antes da publicação.',
      ].join('\n'),
    );
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
    this.downloadBlob(blob, `${slugify(this.eventName())}-${this.brand()}-publicacao.zip`);
    this.toast.show('Download do pacote editorial iniciado.');
  }

  downloadArtifact(item: GalleryFile): void {
    const artifact = this.primaryArtifact(item);
    if (artifact) this.downloadBlob(artifact.blob, artifact.filename);
  }

  primaryArtifact(item: GalleryFile): OutputArtifact | undefined {
    return item.outputs.gallery ?? Object.values(item.outputs)[0];
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  trackOutput(_: number, output: { id: EditorialOutputId }): EditorialOutputId {
    return output.id;
  }

  ngOnDestroy(): void {
    this.files().forEach((item) => this.releaseFile(item));
  }

  private async loadFile(file: File): Promise<GalleryFile | null> {
    const sourceUrl = URL.createObjectURL(file);
    try {
      const image = await this.loadImage(sourceUrl);
      const item: GalleryFile = {
        id: `${Date.now()}-${crypto.randomUUID()}`,
        file,
        sourceUrl,
        width: image.naturalWidth,
        height: image.naturalHeight,
        status: 'ready',
        included: true,
        favorite: false,
        rotation: 0,
        brightness: 100,
        contrast: 100,
        focalX: 50,
        focalY: 50,
        caption: '',
        credit: this.photographer(),
        altText: '',
        outputs: {},
        warnings: this.analyzeImage(image),
      };
      image.src = '';
      return item;
    } catch {
      URL.revokeObjectURL(sourceUrl);
      this.toast.show(`Não foi possível abrir ${file.name}.`, 'error');
      return null;
    }
  }

  private savePreferences(): void {
    if (!this.isBrowser || typeof localStorage.setItem !== 'function') return;
    localStorage.setItem(
      `pixforge:event:preferences:${this.brand()}`,
      JSON.stringify({
        includeLogo: this.includeLogo(),
        includeText: this.includeText(),
        logoOpacity: this.logoOpacity(),
        logoScale: this.logoScale(),
        format: this.format(),
        quality: this.quality(),
        maxWidth: this.maxWidth(),
        selectedOutputs: this.selectedOutputs(),
      }),
    );
  }

  private loadPreferences(brand: BrandId): void {
    if (!this.isBrowser || typeof localStorage.getItem !== 'function') return;
    try {
      const raw = localStorage.getItem(`pixforge:event:preferences:${brand}`);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<{
        includeLogo: boolean;
        includeText: boolean;
        logoOpacity: number;
        logoScale: number;
        format: GalleryFormat;
        quality: number;
        maxWidth: number;
        selectedOutputs: EditorialOutputId[];
      }>;
      if (typeof saved.includeLogo === 'boolean') this.includeLogo.set(saved.includeLogo);
      if (typeof saved.includeText === 'boolean') this.includeText.set(saved.includeText);
      if (typeof saved.logoOpacity === 'number') this.logoOpacity.set(saved.logoOpacity);
      if (typeof saved.logoScale === 'number') this.logoScale.set(saved.logoScale);
      if (saved.format === 'image/webp' || saved.format === 'image/jpeg') this.format.set(saved.format);
      if (typeof saved.quality === 'number') this.quality.set(saved.quality);
      if (typeof saved.maxWidth === 'number') this.maxWidth.set(saved.maxWidth);
      if (Array.isArray(saved.selectedOutputs)) {
        const valid = saved.selectedOutputs.filter((id) =>
          EDITORIAL_OUTPUT_PRESETS.some((preset) => preset.id === id),
        );
        if (valid.length) this.selectedOutputs.set(valid);
      }
    } catch {
      localStorage.removeItem(`pixforge:event:preferences:${brand}`);
    }
  }

  private loadImage(source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Formato não suportado pelo navegador'));
      image.src = source;
    });
  }

  private analyzeImage(image: HTMLImageElement): string[] {
    const warnings: string[] = [];
    if (image.naturalWidth < 1200 || image.naturalHeight < 630) {
      warnings.push('Resolução baixa para capa e redes sociais');
    }
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return warnings;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let luminance = 0;
    let edgeDifference = 0;
    let comparisons = 0;
    let previous = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const current = pixels[index]! * 0.2126 + pixels[index + 1]! * 0.7152 + pixels[index + 2]! * 0.0722;
      luminance += current;
      if (index > 0) {
        edgeDifference += Math.abs(current - previous);
        comparisons += 1;
      }
      previous = current;
    }
    const average = luminance / (pixels.length / 4);
    const edgeScore = edgeDifference / Math.max(1, comparisons);
    if (average < 38) warnings.push('Foto possivelmente escura');
    if (average > 232) warnings.push('Foto possivelmente clara demais');
    if (edgeScore < 7) warnings.push('Verifique a nitidez da foto');
    return warnings;
  }

  private async preloadActiveLogo(): Promise<void> {
    const preset = this.activeBrand();
    if (!this.logoCache.has(preset.id)) {
      this.logoCache.set(preset.id, await this.loadImage(preset.logo));
    }
  }

  private invalidateResults(redraw = true): void {
    this.revokeOutputs();
    this.files.update((items) =>
      items.map((item) => ({ ...item, status: 'ready', outputs: {}, error: undefined })),
    );
    if (redraw) this.schedulePreview();
  }

  private revokeOutputs(): void {
    this.files().forEach((item) =>
      Object.values(item.outputs).forEach((output) => URL.revokeObjectURL(output.url)),
    );
  }

  private releaseFile(item: GalleryFile): void {
    URL.revokeObjectURL(item.sourceUrl);
    Object.values(item.outputs).forEach((output) => URL.revokeObjectURL(output.url));
  }

  private schedulePreview(): void {
    const revision = ++this.previewRevision;
    setTimeout(async () => {
      const item = this.current();
      const canvas = this.previewCanvas?.nativeElement;
      if (!item || !canvas || revision !== this.previewRevision) return;
      try {
        await this.preloadActiveLogo();
        await this.renderItem(item, this.previewOutput(), canvas);
      } catch {
        this.toast.show('Não foi possível atualizar a prévia.', 'error');
      }
    });
  }

  private async renderItem(
    item: GalleryFile,
    outputId: EditorialOutputId,
    target?: HTMLCanvasElement,
  ): Promise<HTMLCanvasElement> {
    const canvas = target ?? document.createElement('canvas');
    const preset = EDITORIAL_OUTPUT_PRESETS.find((candidate) => candidate.id === outputId)!;
    const rotated = item.rotation % 180 !== 0;
    const sourceWidth = rotated ? item.height : item.width;
    const sourceHeight = rotated ? item.width : item.height;
    const dimensions =
      preset.fit === 'inside'
        ? outputDimensions(sourceWidth, sourceHeight, this.maxWidth())
        : { width: preset.width!, height: preset.height! };
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext('2d', { alpha: this.format() !== 'image/jpeg' });
    if (!context) throw new Error('Canvas indisponível');
    const image = await this.loadImage(item.sourceUrl);
    try {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.filter = `brightness(${item.brightness}%) contrast(${item.contrast}%)`;
      const scale =
        preset.fit === 'cover'
          ? Math.max(canvas.width / sourceWidth, canvas.height / sourceHeight)
          : Math.min(canvas.width / sourceWidth, canvas.height / sourceHeight);
      const renderedWidth = sourceWidth * scale;
      const renderedHeight = sourceHeight * scale;
      const offsetX =
        preset.fit === 'cover'
          ? (0.5 - item.focalX / 100) * Math.max(0, renderedWidth - canvas.width)
          : 0;
      const offsetY =
        preset.fit === 'cover'
          ? (0.5 - item.focalY / 100) * Math.max(0, renderedHeight - canvas.height)
          : 0;
      context.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
      context.rotate((item.rotation * Math.PI) / 180);
      context.drawImage(
        image,
        (-item.width * scale) / 2,
        (-item.height * scale) / 2,
        item.width * scale,
        item.height * scale,
      );
      context.restore();
      this.drawBrand(context, canvas.width, canvas.height);
      return canvas;
    } finally {
      image.src = '';
    }
  }

  private drawBrand(context: CanvasRenderingContext2D, width: number, height: number): void {
    const preset = this.activeBrand();
    const logo = this.logoCache.get(preset.id);
    const unit = Math.min(width, height);
    if (this.includeLogo() && logo) {
      context.save();
      context.globalAlpha = this.logoOpacity() / 100;
      const scale = this.logoScale() / 100;
      if (preset.logoPlacement === 'top-right') {
        const logoWidth = Math.min(width * 0.125, height * 0.22) * scale;
        const logoHeight = logoWidth * (logo.naturalHeight / logo.naturalWidth);
        context.drawImage(
          logo,
          width - logoWidth - width * 0.025,
          height * 0.025,
          logoWidth,
          logoHeight,
        );
      } else {
        const logoWidth = Math.min(width * 0.33, height * 0.38) * scale;
        const logoHeight = logoWidth * (logo.naturalHeight / logo.naturalWidth);
        context.drawImage(logo, (width - logoWidth) / 2, height * 0.79, logoWidth, logoHeight);
      }
      context.restore();
    }
    if (!this.includeText()) return;
    const bannerWidth = Math.min(width * 0.76, 1140);
    const bannerHeight = Math.max(unit * 0.09, Math.min(70, height * 0.14));
    const x = (width - bannerWidth) / 2;
    const y = height - bannerHeight - height * 0.022;
    const radius = Math.max(8, unit * 0.018);
    context.save();
    context.fillStyle = 'rgba(8, 10, 15, 0.88)';
    context.strokeStyle = preset.accent;
    context.lineWidth = Math.max(2, unit * 0.004);
    context.beginPath();
    context.roundRect(x, y, bannerWidth, bannerHeight, radius);
    context.fill();
    context.stroke();
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const label = preset.footerText;
    const fontSize = this.fitText(context, label, bannerWidth * 0.9, Math.max(18, unit * 0.033));
    context.font = `700 ${fontSize}px Manrope, Arial, sans-serif`;
    context.fillText(label, width / 2, y + bannerHeight / 2);
    context.restore();
  }

  private fitText(
    context: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    preferredSize: number,
  ): number {
    let size = preferredSize;
    while (size > 12) {
      context.font = `700 ${size}px Manrope, Arial, sans-serif`;
      if (context.measureText(text).width <= maxWidth) break;
      size -= 2;
    }
    return size;
  }

  private canvasToBlob(
    canvas: HTMLCanvasElement,
    format: GalleryFormat,
    quality: number,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar a imagem'))),
        format,
        quality,
      );
    });
  }

  private socialTargets(included: GalleryFile[]): Set<string> {
    const favorites = included.filter((item) => item.favorite);
    return new Set((favorites.length ? favorites : included.slice(0, 1)).map((item) => item.id));
  }

  private shouldRenderOutput(
    item: GalleryFile,
    output: EditorialOutputId,
    socialTargets: Set<string>,
  ): boolean {
    return output === 'gallery' || output === 'thumbnail' || socialTargets.has(item.id);
  }

  private orderOf(item: GalleryFile): number {
    return this.includedFiles().findIndex((candidate) => candidate.id === item.id) + 1;
  }

  private buildManifest(): Record<string, unknown> {
    return {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      event: {
        name: this.eventName() || 'Evento sem nome',
        date: this.eventDate(),
        city: this.eventCity(),
        photographer: this.photographer(),
        brand: this.brand(),
        brandName: this.activeBrand().name,
      },
      settings: {
        format: this.format(),
        quality: this.quality(),
        galleryMaxWidth: this.maxWidth(),
        outputs: this.selectedOutputs(),
        metadataPolicy: 'Conteúdo reprocessado sem EXIF/GPS; crédito preservado no manifesto.',
      },
      photos: this.includedFiles().map((item, index) => ({
        order: index + 1,
        sourceName: item.file.name,
        favorite: item.favorite,
        caption: item.caption,
        credit: item.credit || this.photographer(),
        altText: item.altText,
        adjustments: {
          rotation: item.rotation,
          brightness: item.brightness,
          contrast: item.contrast,
          focalPoint: { x: item.focalX, y: item.focalY },
        },
        outputs: Object.fromEntries(
          Object.entries(item.outputs).map(([id, output]) => [
            id,
            {
              filename: output.filename,
              width: output.width,
              height: output.height,
              bytes: output.blob.size,
            },
          ]),
        ),
      })),
    };
  }

  private buildCsv(): string {
    const header = [
      'ordem',
      'arquivo_original',
      'favorita',
      'legenda',
      'credito',
      'texto_alternativo',
      'arquivos_gerados',
    ];
    const rows = this.includedFiles().map((item, index) => [
      index + 1,
      item.file.name,
      item.favorite,
      item.caption,
      item.credit || this.photographer(),
      item.altText,
      Object.values(item.outputs)
        .map((output) => output.filename)
        .join(';'),
    ]);
    return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  }

  private buildWordPressManifest(): Record<string, unknown> {
    return {
      mode: 'draft',
      title: this.eventName() || 'Evento sem nome',
      date: this.eventDate(),
      city: this.eventCity(),
      brand: this.activeBrand().name,
      media: this.includedFiles().map((item, index) => ({
        order: index + 1,
        file: item.outputs.gallery?.filename ?? this.primaryArtifact(item)?.filename,
        title: item.caption || `${this.eventName() || 'Evento'} - foto ${index + 1}`,
        caption: item.caption,
        description: item.credit || this.photographer(),
        alt_text: item.altText,
      })),
    };
  }

  private patchFile(id: string, patch: Partial<GalleryFile>): void {
    this.files.update((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.hidden = true;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
