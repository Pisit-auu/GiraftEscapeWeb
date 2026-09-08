export type Rect = { x: number; y: number; w: number; h: number };

/** ตรงกับพฤติกรรม java.awt.Rectangle.intersects: ขอบชนขอบพอดีไม่นับว่าชน */
export function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
