import { describe, it, expect } from 'vitest';
import { LEVELS, ALL_ASSET_PATHS } from '../src/game/data';

describe('LEVELS', () => {
  it('ด่าน 1 มี 2 ปุ่ม, ด่าน 2 มี 3, ด่าน 3 มี 5', () => {
    expect(LEVELS[1].buttons).toHaveLength(2);
    expect(LEVELS[2].buttons).toHaveLength(3);
    expect(LEVELS[3].buttons).toHaveLength(5);
  });

  it('ด่าน 2 และ 3 สุ่มศัตรูได้ 5 ชนิดที่ต่างกันจริง (แก้บั๊ก enemyType hardcode ของต้นฉบับ)', () => {
    for (const id of [2, 3] as const) {
      expect(LEVELS[id].enemies).toHaveLength(5);
      // นับชนิดที่ไม่ซ้ำ ไม่ใช่แค่ความยาว ไม่งั้น 5 ตัวเดิมซ้ำกันก็ผ่าน
      expect(new Set(LEVELS[id].enemies.map((e) => e.id)).size).toBe(5);
    }
  });

  it('ยีราฟ velocity ติดลบ (เดินไปทางซ้าย) ศัตรูเป็นบวก', () => {
    for (const lv of Object.values(LEVELS)) {
      for (const b of lv.buttons) expect(b.spec.velocity).toBeLessThan(0);
      for (const e of lv.enemies) expect(e.velocity).toBeGreaterThan(0);
    }
  });

  it('ค่าตัวอย่างตรงกับต้นฉบับ', () => {
    const bird = LEVELS[3].buttons.find((b) => b.spec.id === 'BirdGiraffe');
    expect(bird?.spec).toMatchObject({ velocity: -8, hp: 2500, damage: 30, attackSpeedMs: 400 });
    expect(bird?.cooldownMs).toBe(1500);
    const lizardRobot = LEVELS[3].enemies.find((e) => e.id === 'LizardRobot');
    expect(lizardRobot).toMatchObject({ velocity: 15, hp: 3000, damage: 100, attackSpeedMs: 500 });
  });

  it('การปลดล็อกเรียงถูก', () => {
    expect(LEVELS[1].unlocks).toBe(2);
    expect(LEVELS[2].unlocks).toBe(3);
    expect(LEVELS[3].unlocks).toBeNull();
  });

  it('ทุก spec มีเฟรม walk และ attack อย่างน้อยอย่างละ 1', () => {
    for (const lv of Object.values(LEVELS)) {
      for (const s of [...lv.buttons.map((b) => b.spec), ...lv.enemies]) {
        expect(s.walk.length).toBeGreaterThan(0);
        expect(s.attack.length).toBeGreaterThan(0);
      }
    }
  });

  it('ทุก asset path ขึ้นต้นด้วย /assets/ และไม่มีตัวซ้ำหลงเหลือใน manifest', () => {
    expect(ALL_ASSET_PATHS.every((p) => p.startsWith('/assets/'))).toBe(true);
    expect(ALL_ASSET_PATHS.length).toBeGreaterThan(60);
    expect(new Set(ALL_ASSET_PATHS).size).toBe(ALL_ASSET_PATHS.length);
  });
});
