import type { AssetMap } from '../engine/assets';
import { Renderer } from '../engine/renderer';
import { BG_MAP, MAP_MARKER, MAP_MARKER_POS } from '../game/data';
import { loadUnlocked, type LevelId } from '../game/progress';
import { icon } from './icons';

export type MapPageDeps = {
  assets: AssetMap;
  canvas: HTMLCanvasElement;
  overlay: HTMLElement;
  onPlay: (level: LevelId) => void;
};

/** แผนที่ต้นฉบับวาดบนพื้นที่ 1000x800 จึงจัดกึ่งกลางบนเวที 1600x800 */
const MAP_OFFSET_X = 300;
/** สีพื้นของรูปแผนที่ ใช้ทาขอบซ้าย/ขวาที่รูปไม่ครอบ แทนแถบดำ */
const MAP_PAPER = '#f5f5e1';

export function mountMapPage(deps: MapPageDeps): () => void {
  const ctx = deps.canvas.getContext('2d');
  if (!ctx) throw new Error('เบราว์เซอร์นี้ไม่รองรับ canvas 2d');
  const renderer = new Renderer(ctx, deps.assets);
  const unlocked = loadUnlocked();
  let selected: LevelId = 1;

  function draw(): void {
    renderer.fill(MAP_PAPER);
    renderer.image(BG_MAP, MAP_OFFSET_X, 0, 1000, 800);
    const pos = MAP_MARKER_POS[selected];
    renderer.image(MAP_MARKER, MAP_OFFSET_X + pos.x, pos.y, 150, 150);
  }

  deps.overlay.replaceChildren();

  const picker = document.createElement('div');
  picker.className = 'level-picker';
  // เก็บปุ่มไว้ใน array ตอนสร้าง แทนการวน picker.children ตอนคลิก
  // (HTMLCollection วนด้วย for...of ไม่ได้ถ้าไม่เปิด lib DOM.Iterable และเราไม่จำเป็นต้องเปิด)
  const pickButtons: HTMLButtonElement[] = [];
  for (const id of [1, 2, 3] as const) {
    const b = document.createElement('button');
    b.className = 'btn level-pick';
    b.disabled = !unlocked.has(id);
    if (b.disabled) {
      b.title = 'ยังไม่ปลดล็อก ผ่านด่านก่อนหน้าก่อน';
      b.append(icon('lock'));
    }
    b.append(`ด่าน ${id}`);
    b.setAttribute('aria-pressed', String(id === 1));
    b.addEventListener('click', () => {
      selected = id;
      for (const other of pickButtons) {
        other.removeAttribute('data-selected');
        other.setAttribute('aria-pressed', 'false');
      }
      b.dataset.selected = 'true';
      b.setAttribute('aria-pressed', 'true');
      draw();
    });
    if (id === 1) b.dataset.selected = 'true';
    pickButtons.push(b);
    picker.append(b);
  }

  const play = document.createElement('button');
  play.className = 'btn btn-go btn-play';
  play.append(icon('play'), 'Start');
  play.addEventListener('click', () => deps.onPlay(selected));

  deps.overlay.append(picker, play);
  draw();

  return () => deps.overlay.replaceChildren();
}
