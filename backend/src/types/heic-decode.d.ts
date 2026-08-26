declare module 'heic-decode' {
  interface DecodeInput { buffer: Buffer; }
  interface DecodeResult { width: number; height: number; data: Uint8ClampedArray; }
  export default function decode(input: DecodeInput): Promise<DecodeResult>;
}
