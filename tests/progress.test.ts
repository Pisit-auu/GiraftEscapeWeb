import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadUnlocked, unlock, STORAGE_KEY } from '../src/game/progress';

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  });
});

describe('progress', () => {
  it('ครั้งแรกปลดล็อกแค่ด่าน 1', () => {
    expect([...loadUnlocked()]).toEqual([1]);
  });
  it('unlock แล้วอ่านกลับมาได้', () => {
    unlock(2);
    expect([...loadUnlocked()].sort()).toEqual([1, 2]);
  });
  it('unlock(null) ไม่ทำอะไร', () => {
    unlock(null);
    expect([...loadUnlocked()]).toEqual([1]);
  });
  it('ค่าที่เก็บพัง -> ถือว่าปลดล็อกแค่ด่าน 1 ไม่ throw', () => {
    store.set(STORAGE_KEY, 'ขยะที่ไม่ใช่ json');
    expect([...loadUnlocked()]).toEqual([1]);
  });
  it('localStorage ใช้ไม่ได้ (โหมดส่วนตัว) -> ไม่ throw', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
    });
    expect(() => loadUnlocked()).not.toThrow();
    expect(() => unlock(2)).not.toThrow();
  });
});
