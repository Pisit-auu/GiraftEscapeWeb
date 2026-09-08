import { describe, it, expect } from 'vitest';
import { Fortress, FORTRESS_SIZE } from '../src/game/fortress';

describe('Fortress', () => {
  it('เริ่มด้วย hp เต็ม', () => {
    expect(new Fortress('giraffe', '/x.png', 1350, 300, 1000).hp).toBe(1000);
  });
  it('bounds ใช้ขนาด 400x400 ตามต้นฉบับ', () => {
    expect(new Fortress('enemy', '/x.png', -200, 250, 1000).bounds)
      .toEqual({ x: -200, y: 250, w: FORTRESS_SIZE, h: FORTRESS_SIZE });
  });
  it('takeDamage ลด hp และไม่ต่ำกว่า 0', () => {
    const f = new Fortress('giraffe', '/x.png', 0, 0, 100);
    f.takeDamage(30); expect(f.hp).toBe(70);
    f.takeDamage(999); expect(f.hp).toBe(0);
  });
  it('reset คืน hp เต็ม', () => {
    const f = new Fortress('giraffe', '/x.png', 0, 0, 1000);
    f.takeDamage(1000); f.reset();
    expect(f.hp).toBe(1000);
  });
});
