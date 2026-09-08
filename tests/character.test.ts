import { describe, it, expect } from 'vitest';
import { Character, SPEED_FACTOR, FRAME_MS, type CharacterSpec, type Damageable } from '../src/game/character';
import { STEP_MS } from '../src/engine/loop';
import type { Rect } from '../src/engine/rect';

const spec: CharacterSpec = {
  id: 'test', walk: ['w0', 'w1'], attack: ['a0', 'a1', 'a2'],
  hp: 100, damage: 10, attackSpeedMs: 500, velocity: -5,
};

class Dummy implements Damageable {
  hp = 100;
  get bounds(): Rect { return { x: 0, y: 0, w: 80, h: 80 }; }
  takeDamage(n: number): void { this.hp -= n; }
}

const tick = (c: Character, ms: number) => {
  for (let t = 0; t < ms; t += STEP_MS) c.update(STEP_MS);
};

describe('Character', () => {
  it('เดินด้วย velocity * SPEED_FACTOR ต่อ tick', () => {
    const c = new Character(spec, 'giraffe', 1000, 520);
    c.update(STEP_MS);
    expect(c.x).toBeCloseTo(1000 + -5 * SPEED_FACTOR, 6);
  });

  it('60 tick = 1 วินาที เคลื่อนที่ velocity * SPEED_FACTOR * 60', () => {
    const c = new Character(spec, 'giraffe', 1000, 520);
    for (let i = 0; i < 60; i++) c.update(STEP_MS);
    expect(c.x).toBeCloseTo(1000 + -5 * 0.1 * 60, 6);
  });

  it('เศษทศนิยมไม่ถูกตัดทิ้ง (บั๊กเดิมของ Java ที่ x เป็น int)', () => {
    const slow: CharacterSpec = { ...spec, velocity: -2 };
    const c = new Character(slow, 'giraffe', 1300, 520);
    for (let i = 0; i < 100; i++) c.update(STEP_MS);
    expect(c.x).toBeCloseTo(1300 - 20, 6); // ไม่ใช่ -100 แบบบั๊กเดิม
  });

  it('อนิเมชันเปลี่ยนเฟรมทุก FRAME_MS', () => {
    const c = new Character(spec, 'giraffe', 0, 0);
    expect(c.sprite).toBe('w0');
    tick(c, FRAME_MS);
    expect(c.sprite).toBe('w1');
  });

  it('ตอนตีใช้เฟรมชุด attack', () => {
    const c = new Character(spec, 'giraffe', 0, 0);
    c.startAttacking(new Dummy());
    expect(c.sprite).toBe('a0');
  });

  it('หมัดแรกออกทันทีไม่ต้องรอ attackSpeedMs', () => {
    const c = new Character(spec, 'giraffe', 0, 0);
    const target = new Dummy();
    c.startAttacking(target);
    c.update(STEP_MS);
    expect(target.hp).toBe(90);
  });

  it('attackSpeedMs 500 -> ตีที่ t=0, 500, 1000 รวม 3 หมัดใน 1 วินาที', () => {
    const c = new Character(spec, 'giraffe', 0, 0);
    const target = new Dummy();
    c.startAttacking(target);
    tick(c, 1000);
    // หมัดแรกออกทันที (ตรงกับ Java ที่ตีก่อนแล้วค่อย sleep) จึงได้ 3 ไม่ใช่ 2
    expect(target.hp).toBe(100 - 10 * 3);
  });

  it('ครึ่งวินาทีแรกได้ 2 หมัด (t=0 และ t=500)', () => {
    const c = new Character(spec, 'giraffe', 0, 0);
    const target = new Dummy();
    c.startAttacking(target);
    tick(c, 900);
    expect(target.hp).toBe(100 - 10 * 2);
  });

  it('ตอนตีต้องหยุดเดิน', () => {
    const c = new Character(spec, 'giraffe', 1000, 0);
    c.startAttacking(new Dummy());
    tick(c, 500);
    expect(c.x).toBe(1000);
  });

  it('เป้าหมายตายแล้วกลับไปเดินต่อ', () => {
    const c = new Character(spec, 'giraffe', 1000, 0);
    const target = new Dummy();
    target.hp = 10;
    c.startAttacking(target);
    tick(c, 100);
    expect(c.state).toBe('walking');
    tick(c, 100);
    expect(c.x).toBeLessThan(1000);
  });

  it('เรียก startAttacking ซ้ำระหว่างตีอยู่ ไม่รีเซ็ตจังหวะ', () => {
    const c = new Character(spec, 'giraffe', 0, 0);
    const target = new Dummy();
    c.startAttacking(target);
    c.update(STEP_MS);          // หมัดแรก
    for (let i = 0; i < 5; i++) { c.startAttacking(target); c.update(STEP_MS); }
    expect(target.hp).toBe(90); // ยังไม่ถึง 500ms จึงยังหมัดเดียว
  });

  it('takeDamage ลด hp และ isAlive เป็น false เมื่อถึง 0', () => {
    const c = new Character(spec, 'giraffe', 0, 0);
    c.takeDamage(100);
    expect(c.hp).toBe(0);
    expect(c.isAlive).toBe(false);
  });

  it('bounds ใช้ตำแหน่งที่ปัดแล้วและขนาด 80x80', () => {
    const c = new Character(spec, 'giraffe', 100.7, 520);
    expect(c.bounds).toEqual({ x: 101, y: 520, w: 80, h: 80 });
  });
});
