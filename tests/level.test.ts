import { describe, it, expect } from 'vitest';
import { Level, FORTRESS_HP, ENEMY_SPAWN_X } from '../src/game/level';
import { LEVELS } from '../src/game/data';
import { STEP_MS } from '../src/engine/loop';

/** rng ที่คืนค่าเดิมเสมอ ทำให้เทสไม่สุ่ม */
const fixedRng = (v: number) => () => v;
const tick = (lv: Level, ms: number) => { for (let t = 0; t < ms; t += STEP_MS) lv.update(STEP_MS); };

describe('Level', () => {
  it('เริ่มต้นไม่มีตัวละครและ status เป็น playing', () => {
    const lv = new Level(LEVELS[1], fixedRng(0));
    expect(lv.giraffes).toHaveLength(0);
    expect(lv.enemies).toHaveLength(0);
    expect(lv.status).toBe('playing');
    expect(lv.giraffeFortress.hp).toBe(FORTRESS_HP);
  });

  it('กดปุ่มแล้วได้ยีราฟที่ x = 1300', () => {
    const lv = new Level(LEVELS[1], fixedRng(0));
    expect(lv.trySpawnGiraffe(0)).toBe(true);
    expect(lv.giraffes).toHaveLength(1);
    expect(lv.giraffes[0].x).toBe(1300);
    expect(lv.giraffes[0].spec.id).toBe('DefaultGiraffe');
  });

  it('cooldown เป็นแบบรวม กดปุ่มหนึ่งแล้วปุ่มอื่นก็กดไม่ได้', () => {
    const lv = new Level(LEVELS[1], fixedRng(0));
    lv.trySpawnGiraffe(0);                 // cooldown 1000ms
    expect(lv.trySpawnGiraffe(1)).toBe(false);
    // tick เดินเป็นก้อนละ 16.67ms อย่าใช้ 999 เพราะจะ overshoot เป็น 1000.00 พอดี
    tick(lv, 900);
    expect(lv.trySpawnGiraffe(1)).toBe(false);
    tick(lv, 200);
    expect(lv.trySpawnGiraffe(1)).toBe(true);
  });

  it('ศัตรูตัวแรกเกิดทันทีที่ x = 150 ตัวถัดไปเกิดตามช่วงเวลาของด่าน', () => {
    // ต้นฉบับ Java spawn ก่อนแล้วค่อย sleep รอบแรก ตัวแรกจึงต้องอยู่บนสนามตั้งแต่เฟรมแรก
    const lv = new Level(LEVELS[1], fixedRng(0));  // rng 0 -> ช่วงต่ำสุด 2000ms
    expect(lv.enemies).toHaveLength(0);    // ยังไม่ update เลย ยังไม่มีตัวเกิด
    lv.update(STEP_MS);
    expect(lv.enemies).toHaveLength(1);
    expect(lv.enemies[0].x).toBe(ENEMY_SPAWN_X);

    // ตัวถัดไปยังต้องรอครบช่วงเวลาของด่านตามปกติ (2000ms กับ rng นี้)
    tick(lv, 1900);
    expect(lv.enemies).toHaveLength(1);
    // เดินทีละเฟรมจนศัตรูตัวที่สองโผล่ แล้วเช็คตำแหน่งในเฟรมนั้นเลย
    // ถ้า tick ทีเดียว 200ms ตัวที่เกิดจะถูกขยับต่ออีกหลายเฟรมก่อนถึง assertion
    let frames = 0;
    while (lv.enemies.length === 1 && frames < 60) {
      lv.update(STEP_MS);
      frames += 1;
    }
    expect(lv.enemies).toHaveLength(2);
    expect(lv.enemies[1].x).toBe(ENEMY_SPAWN_X);
    expect(frames * STEP_MS).toBeLessThan(200);   // เกิดในช่วง 1900-2100ms หลังตัวแรก
  });

  it('สุ่มศัตรูได้หลายชนิดจริง (ไม่ใช่ตัวเดิมตลอดแบบบั๊กเดิม)', () => {
    const ids = new Set<string>();
    for (const r of [0, 0.25, 0.45, 0.65, 0.85]) {
      const lv = new Level(LEVELS[3], fixedRng(r));
      tick(lv, 9000);
      for (const e of lv.enemies) ids.add(e.spec.id);
    }
    expect(ids.size).toBeGreaterThan(1);
  });

  it('ยีราฟชนศัตรูแล้วตีกัน ฝ่ายที่แพ้หลุดจากลิสต์', () => {
    const lv = new Level(LEVELS[1], fixedRng(0));
    lv.trySpawnGiraffe(0);                // DefaultGiraffe hp100 dmg15 as500
    const giraffe = lv.giraffes[0];
    lv.update(STEP_MS);                   // ศัตรูตัวแรกเกิดทันทีที่ด่านเริ่ม (ไม่ต้องรอช่วงเวลา)
    expect(lv.enemies).toHaveLength(1);
    const human = lv.enemies[0];          // Human hp200 dmg20 as500
    // ย้ายคู่ดวลไปกลางฉาก ให้ห่างทั้งจุดเกิดศัตรู (x=150) และป้อมทั้งสองฝั่ง
    // ไม่งั้นศัตรูตัวถัดไปที่เกิดทุก 2 วินาทีจะเดินมาร่วมวง ทำให้ยีราฟตายเร็วขึ้นหนึ่งจังหวะ
    giraffe.x = 700;
    human.x = 700;
    tick(lv, 3000);                       // แลกหมัดกัน 5 ครั้ง
    // ยีราฟ 100hp โดน 20 x 5 = ตายก่อน ส่วน Human เหลือ 200 - 15 x 5 = 125
    expect(lv.giraffes).not.toContain(giraffe);
    expect(human.hp).toBe(200 - 15 * 5);
    expect(lv.enemies).toContain(human);
  });

  it('ยีราฟถึงป้อมศัตรูแล้วตีป้อมจน hp ลด', () => {
    const lv = new Level(LEVELS[1], fixedRng(0));
    lv.trySpawnGiraffe(0);
    lv.giraffes[0].x = 100;               // ป้อมศัตรูอยู่ (-200,250) กว้าง 400 -> ถึง x=200
    lv.update(STEP_MS);
    lv.update(STEP_MS);
    expect(lv.enemyFortress.hp).toBeLessThan(FORTRESS_HP);
  });

  it('ป้อมศัตรู hp หมด -> ชนะ และหยุดเกิดศัตรู', () => {
    const lv = new Level(LEVELS[1], fixedRng(0));
    lv.enemyFortress.takeDamage(FORTRESS_HP);
    lv.update(STEP_MS);
    expect(lv.status).toBe('won');
    const before = lv.enemies.length;
    tick(lv, 20_000);
    expect(lv.enemies).toHaveLength(before);
  });

  it('ป้อมยีราฟ hp หมด -> แพ้', () => {
    const lv = new Level(LEVELS[1], fixedRng(0));
    lv.giraffeFortress.takeDamage(FORTRESS_HP);
    lv.update(STEP_MS);
    expect(lv.status).toBe('lost');
  });

  it('restart ล้างตัวละคร คืน hp ป้อม และกลับไป playing', () => {
    const lv = new Level(LEVELS[1], fixedRng(0));
    lv.trySpawnGiraffe(0);
    lv.giraffeFortress.takeDamage(FORTRESS_HP);
    lv.update(STEP_MS);
    expect(lv.status).toBe('lost');
    lv.restart();
    expect(lv.status).toBe('playing');
    expect(lv.giraffes).toHaveLength(0);
    expect(lv.enemies).toHaveLength(0);
    expect(lv.giraffeFortress.hp).toBe(FORTRESS_HP);
    expect(lv.enemyFortress.hp).toBe(FORTRESS_HP);
  });

  it('เกมจบแล้วตัวละครหยุดขยับ', () => {
    const lv = new Level(LEVELS[1], fixedRng(0));
    lv.trySpawnGiraffe(0);
    lv.enemyFortress.takeDamage(FORTRESS_HP);
    lv.update(STEP_MS);                   // update นี้ขยับตัวละครก่อนแล้วค่อยตั้ง status
    expect(lv.status).toBe('won');
    const x0 = lv.giraffes[0].x;          // จับตำแหน่งหลังเกมจบแล้วเท่านั้น
    tick(lv, 1000);
    expect(lv.giraffes[0].x).toBe(x0);
  });
});
