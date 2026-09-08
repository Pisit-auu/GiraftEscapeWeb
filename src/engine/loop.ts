export const STEP_MS = 1000 / 60;

/**
 * เพดานเวลาที่ยอมสะสมต่อ 1 เฟรม กันเกม "กระโดด" ตอนผู้เล่นสลับแท็บแล้วกลับมา
 * (rAF หยุดตอนแท็บไม่ active เวลาที่ผ่านไปจริงอาจเป็นนาที)
 */
export const MAX_FRAME_MS = 250;

export type UpdateFn = (dtMs: number) => void;

/**
 * เดินตรรกะเกมด้วย timestep คงที่ ไม่ผูกกับ frame rate ของจอ
 * คืนค่า accumulator ที่เหลือไว้ใช้เฟรมถัดไป
 */
export function stepAccumulator(acc: number, elapsedMs: number, update: UpdateFn): number {
  let remaining = acc + Math.min(elapsedMs, MAX_FRAME_MS);
  while (remaining >= STEP_MS) {
    update(STEP_MS);
    remaining -= STEP_MS;
  }
  return remaining;
}

export function createLoop(update: UpdateFn, render: () => void) {
  let acc = 0;
  let last = 0;
  let rafId = 0;
  let running = false;

  function frame(now: number): void {
    acc = stepAccumulator(acc, now - last, update);
    last = now;
    render();
    rafId = requestAnimationFrame(frame);
  }

  return {
    start(): void {
      if (running) return;
      running = true;
      acc = 0;
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    },
    stop(): void {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
    },
  };
}
