import { describe, it, expect } from 'vitest';
import { intersects, type Rect } from '../src/engine/rect';

const r = (x: number, y: number, w = 80, h = 80): Rect => ({ x, y, w, h });

describe('intersects', () => {
  it('ซ้อนกันบางส่วน -> true', () => {
    expect(intersects(r(0, 0), r(40, 40))).toBe(true);
  });
  it('แยกกันคนละที่ -> false', () => {
    expect(intersects(r(0, 0), r(200, 0))).toBe(false);
  });
  it('ขอบชนขอบพอดี -> false (ตรงกับ Rectangle.intersects ของ Java)', () => {
    expect(intersects(r(0, 0), r(80, 0))).toBe(false);
  });
  it('ซ้อนแกน x แต่คนละแถว y -> false', () => {
    expect(intersects(r(0, 0), r(10, 500))).toBe(false);
  });
  it('อันหนึ่งอยู่ในอีกอันทั้งหมด -> true', () => {
    expect(intersects(r(0, 0, 400, 400), r(100, 100, 80, 80))).toBe(true);
  });
});
