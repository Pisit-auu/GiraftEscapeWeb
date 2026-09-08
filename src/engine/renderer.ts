import type { AssetMap } from './assets';

export type TextOptions = {
  font?: string;
  color?: string;
  align?: CanvasTextAlign;
};

export class Renderer {
  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly assets: AssetMap,
  ) {}

  clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  image(path: string, x: number, y: number, w: number, h: number): void {
    const img = this.assets.get(path);
    if (!img) return;                       // รูปหาย: ข้ามไป ไม่ให้ทั้งเฟรมพัง
    this.ctx.drawImage(img, Math.round(x), Math.round(y), w, h);
  }

  text(value: string, x: number, y: number, opts: TextOptions = {}): void {
    this.ctx.font = opts.font ?? 'bold 20px system-ui, sans-serif';
    this.ctx.fillStyle = opts.color ?? '#000';
    this.ctx.textAlign = opts.align ?? 'left';
    this.ctx.fillText(value, x, y);
  }
}
