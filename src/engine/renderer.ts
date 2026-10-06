import type { AssetMap } from './assets';

export type TextOptions = {
  font?: string;
  color?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  /** ขอบตัวอักษร ให้อ่านออกบนพื้นหลังที่สีไม่แน่นอน */
  stroke?: string;
  strokeWidth?: number;
};

export type MeterOptions = {
  track: string;
  fill: string;
  shade: string;
  stroke: string;
  lineWidth?: number;
  /** เติมจากขวาไปซ้าย ใช้กับแถบฝั่งขวาของจอให้หดเข้าหาขอบจอ */
  fromRight?: boolean;
};

export class Renderer {
  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly assets: AssetMap,
  ) {}

  clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  /** ทาสีเต็มทั้ง canvas */
  fill(color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  image(path: string, x: number, y: number, w: number, h: number): void {
    const img = this.assets.get(path);
    if (!img) return;                       // รูปหาย: ข้ามไป ไม่ให้ทั้งเฟรมพัง
    this.ctx.drawImage(img, Math.round(x), Math.round(y), w, h);
  }

  /** แถบค่า (เช่น HP) ขอบมน เติมสีตามสัดส่วน 0..1 */
  meter(x: number, y: number, w: number, h: number, ratio: number, opts: MeterOptions): void {
    const ctx = this.ctx;
    const r = h / 2;
    const clamped = Math.max(0, Math.min(1, ratio));

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = opts.track;
    ctx.fill();

    if (clamped > 0) {
      ctx.save();
      ctx.clip();
      ctx.fillStyle = opts.fill;
      ctx.fillRect(opts.fromRight ? x + w * (1 - clamped) : x, y, w * clamped, h);
      // เงาด้านล่างของแถบให้ดูนูนเหมือนปุ่ม
      ctx.fillStyle = opts.shade;
      ctx.fillRect(opts.fromRight ? x + w * (1 - clamped) : x, y + h * 0.72, w * clamped, h * 0.28);
      ctx.restore();
    }

    ctx.lineWidth = opts.lineWidth ?? 4;
    ctx.strokeStyle = opts.stroke;
    ctx.stroke();
    ctx.restore();
  }

  text(value: string, x: number, y: number, opts: TextOptions = {}): void {
    this.ctx.font = opts.font ?? 'bold 20px system-ui, sans-serif';
    this.ctx.fillStyle = opts.color ?? '#000';
    this.ctx.textAlign = opts.align ?? 'left';
    this.ctx.textBaseline = opts.baseline ?? 'alphabetic';
    if (opts.stroke) {
      this.ctx.lineJoin = 'round';
      this.ctx.lineWidth = opts.strokeWidth ?? 6;
      this.ctx.strokeStyle = opts.stroke;
      this.ctx.strokeText(value, x, y);
    }
    this.ctx.fillText(value, x, y);
  }
}
