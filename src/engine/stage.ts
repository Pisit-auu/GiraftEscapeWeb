/**
 * ย่อ/ขยายชั้น overlay ให้ทับ canvas พอดีทุกขนาดจอ
 * overlay ใช้พิกัดออกแบบ (1600x800) เหมือน canvas แล้ว scale ทั้งชั้นทีเดียว
 * ทำให้โค้ดวางปุ่มใช้พิกัดเดียวกับที่วาดใน canvas ได้เลย
 */
export function syncOverlayScale(
  stage: HTMLElement,
  overlay: HTMLElement,
  designWidth = 1600,
  onHiddenChange?: (hidden: boolean) => void,
): () => void {
  let hidden: boolean | null = null;
  const apply = (): void => {
    const width = stage.clientWidth;
    overlay.style.transform = `scale(${width / designWidth})`;
    // width 0 = เวทีถูกซ่อน (จอแนวตั้งบนมือถือ) แจ้งให้ loop หยุดเดินเกม
    const nowHidden = width === 0;
    if (nowHidden !== hidden) {
      hidden = nowHidden;
      onHiddenChange?.(nowHidden);
    }
  };
  apply();
  const observer = new ResizeObserver(apply);
  observer.observe(stage);
  return () => observer.disconnect();
}
