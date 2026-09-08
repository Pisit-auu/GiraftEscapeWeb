export type ImageLoader = (src: string) => Promise<HTMLImageElement>;
export type AssetMap = ReadonlyMap<string, HTMLImageElement>;

export const browserImageLoader: ImageLoader = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('โหลดรูปไม่สำเร็จ'));
    img.src = src;
  });

/**
 * โหลดรูปทั้งหมดแบบขนาน รายงานความคืบหน้าทีละไฟล์
 * path ซ้ำจะโหลดครั้งเดียว
 */
export async function loadAll(
  paths: readonly string[],
  load: ImageLoader,
  onProgress?: (done: number, total: number) => void,
): Promise<AssetMap> {
  const unique = [...new Set(paths)];
  const total = unique.length;
  let done = 0;
  const map = new Map<string, HTMLImageElement>();

  await Promise.all(
    unique.map(async (src) => {
      try {
        map.set(src, await load(src));
      } catch (cause) {
        throw new Error(`โหลดไฟล์ไม่สำเร็จ: ${src}`, { cause });
      }
      done += 1;
      onProgress?.(done, total);
    }),
  );

  return map;
}
