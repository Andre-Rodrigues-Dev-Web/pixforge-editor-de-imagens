export class ImageProcessingQueue {
  private active = 0;
  private readonly waiting: Array<() => void> = [];

  constructor(private readonly maxConcurrency: number) {}

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrency) {
      await new Promise<void>((resolve) => this.waiting.push(resolve));
    }
    this.active += 1;
    try { return await task(); }
    finally {
      this.active -= 1;
      this.waiting.shift()?.();
    }
  }
}
