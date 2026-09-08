import { describe, it, expect, vi } from 'vitest';
import { loadAll, type ImageLoader } from '../src/engine/assets';

const fakeImage = (src: string) => ({ src } as unknown as HTMLImageElement);
const okLoader: ImageLoader = async (src) => fakeImage(src);

describe('loadAll', () => {
  it('คืน map ที่ครบทุก path และคีย์คือ path เดิม', async () => {
    const map = await loadAll(['/a.png', '/b.png'], okLoader);
    expect(map.size).toBe(2);
    expect(map.get('/a.png')?.src).toBe('/a.png');
  });

  it('เรียก onProgress ครบทุกไฟล์และจบที่ done === total', async () => {
    const seen: Array<[number, number]> = [];
    await loadAll(['/a.png', '/b.png', '/c.png'], okLoader, (d, t) => seen.push([d, t]));
    expect(seen).toHaveLength(3);
    expect(seen[seen.length - 1]).toEqual([3, 3]);
  });

  it('โหลดซ้ำ path เดิมไม่ยิงโหลดสองครั้ง', async () => {
    const load = vi.fn(okLoader);
    await loadAll(['/a.png', '/a.png'], load);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('ไฟล์พัง -> โยน error ที่บอกชื่อไฟล์', async () => {
    const failing: ImageLoader = async (src) => {
      if (src === '/bad.png') throw new Error('404');
      return fakeImage(src);
    };
    await expect(loadAll(['/a.png', '/bad.png'], failing)).rejects.toThrow('/bad.png');
  });
});
