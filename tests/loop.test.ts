import { describe, it, expect, vi } from 'vitest';
import { stepAccumulator, STEP_MS, MAX_FRAME_MS } from '../src/engine/loop';

describe('stepAccumulator', () => {
  it('เวลาผ่านไป 1 วินาที -> update ถูกเรียก 60 ครั้ง', () => {
    const update = vi.fn();
    let acc = 0;
    for (let i = 0; i < 60; i++) acc = stepAccumulator(acc, 1000 / 60, update);
    expect(update).toHaveBeenCalledTimes(60);
  });

  it('เฟรมสั้นกว่า 1 step ไม่เรียก update แต่สะสมไว้', () => {
    const update = vi.fn();
    const acc = stepAccumulator(0, 5, update);
    expect(update).not.toHaveBeenCalled();
    expect(acc).toBe(5);
  });

  it('จอ 120Hz (เฟรมละ 8.33ms) -> 1 วินาทีก็ยังได้ 60 ครั้ง', () => {
    const update = vi.fn();
    let acc = 0;
    for (let i = 0; i < 120; i++) acc = stepAccumulator(acc, 1000 / 120, update);
    expect(update).toHaveBeenCalledTimes(60);
  });

  it('update ได้รับ dt คงที่เท่ากับ STEP_MS เสมอ', () => {
    const seen: number[] = [];
    stepAccumulator(0, 100, (dt) => seen.push(dt));
    expect(seen.every((d) => d === STEP_MS)).toBe(true);
  });

  it('เฟรมยาวผิดปกติ (สลับแท็บกลับมา) ถูก clamp ที่ MAX_FRAME_MS', () => {
    const update = vi.fn();
    const leftover = stepAccumulator(0, 60_000, update);
    const calls = update.mock.calls.length;
    // เวลาที่ถูกใช้จริง = จำนวนรอบ x STEP บวกเศษที่เหลือ ต้องเท่ากับ MAX_FRAME_MS พอดี
    // (อย่าเทียบกับ Math.floor(MAX_FRAME_MS/STEP_MS) เพราะ float ให้ 14 ขณะที่ลูปเดิน 15 รอบ)
    expect(calls * STEP_MS + leftover).toBeCloseTo(MAX_FRAME_MS, 6);
    // ถ้า clamp หายไป 60 วินาทีจะกลายเป็น 3600 รอบ
    expect(calls).toBeLessThan(60_000 / STEP_MS / 10);
  });
});
