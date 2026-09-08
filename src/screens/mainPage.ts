import type { AssetMap } from '../engine/assets';
import { Renderer } from '../engine/renderer';
import { BG_MAIN } from '../game/data';

export type MainPageDeps = {
  assets: AssetMap;
  canvas: HTMLCanvasElement;
  overlay: HTMLElement;
  onStart: () => void;
};

export function mountMainPage(deps: MainPageDeps): () => void {
  const ctx = deps.canvas.getContext('2d');
  if (!ctx) throw new Error('เบราว์เซอร์นี้ไม่รองรับ canvas 2d');
  const renderer = new Renderer(ctx, deps.assets);

  renderer.clear();
  renderer.image(BG_MAIN, 0, 0, 1600, 800);

  deps.overlay.replaceChildren();
  const start = document.createElement('button');
  start.className = 'menu-btn';
  start.style.left = '700px';
  start.style.top = '560px';
  start.textContent = 'Start';
  start.addEventListener('click', () => deps.onStart());
  deps.overlay.append(start);

  return () => deps.overlay.replaceChildren();
}
