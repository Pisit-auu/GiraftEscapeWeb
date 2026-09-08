export const STORAGE_KEY = 'giraffe-escape:unlocked';

export type LevelId = 1 | 2 | 3;

/** อ่านด่านที่ปลดล็อก อ่านไม่ได้ด้วยเหตุใดก็ตามให้ถือว่ามีแค่ด่าน 1 */
export function loadUnlocked(): Set<LevelId> {
  const base = new Set<LevelId>([1]);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return base;
    for (const value of parsed) {
      if (value === 2 || value === 3) base.add(value);
    }
  } catch {
    // โหมดส่วนตัว หรือค่าที่เก็บพัง: ใช้ค่าเริ่มต้น
  }
  return base;
}

export function unlock(level: 2 | 3 | null): void {
  if (level === null) return;
  try {
    const next = loadUnlocked();
    next.add(level);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {
    // เขียนไม่ได้ก็ปล่อยไป ผู้เล่นแค่ต้องปลดล็อกใหม่รอบหน้า
  }
}
