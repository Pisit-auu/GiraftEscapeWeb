/**
 * ย่อ/ขยายชั้น overlay ให้ทับ canvas พอดีทุกขนาดจอ
 * overlay ใช้พิกัดออกแบบ (1600x800) เหมือน canvas แล้ว scale ทั้งชั้นทีเดียว
 * ทำให้โค้ดวางปุ่มใช้พิกัดเดียวกับที่วาดใน canvas ได้เลย
 */
export function syncOverlayScale(
  stage: HTMLElement,
  overlay: HTMLElement,
  designWidth = 1600,
): () => void {
  const apply = (): void => {
    overlay.style.transform = `scale(${stage.clientWidth / designWidth})`;
  };
  apply();
  const observer = new ResizeObserver(apply);
  observer.observe(stage);
  return () => observer.disconnect();
}
