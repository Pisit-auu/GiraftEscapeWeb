import type { AssetMap } from '../engine/assets';
import { createLoop } from '../engine/loop';
import { Renderer } from '../engine/renderer';
import { SPRITE_SIZE } from '../game/character';
import { LEVELS } from '../game/data';
import { FORTRESS_SIZE } from '../game/fortress';
import { Level } from '../game/level';

export type LevelScreenDeps = {
  levelId: 1 | 2 | 3;
  assets: AssetMap;
  canvas: HTMLCanvasElement;
  overlay: HTMLElement;
  isHidden: () => boolean;
  onExit: () => void;
  onWin: (unlocked: 2 | 3 | null) => void;
};

const STAGE_W = 1600;
const STAGE_H = 800;

export function mountLevel(deps: LevelScreenDeps): () => void {
  const config = LEVELS[deps.levelId];
  const level = new Level(config);

  const ctx = deps.canvas.getContext('2d');
  if (!ctx) throw new Error('เบราว์เซอร์นี้ไม่รองรับ canvas 2d');
  const renderer = new Renderer(ctx, deps.assets);

  deps.overlay.replaceChildren();

  // ---- ปุ่มเลือกยีราฟ ----
  const row = document.createElement('div');
  row.className = 'spawn-row';
  const buttons = config.buttons.map((button, index) => {
    const el = document.createElement('button');
    el.className = 'spawn-btn';
    el.style.backgroundImage = `url("${button.icon}")`;
    el.title = button.spec.id;
    el.setAttribute('aria-label', button.spec.id);
    const bar = document.createElement('span');
    bar.className = 'cd';
    el.append(bar);
    el.addEventListener('click', () => level.trySpawnGiraffe(index));
    row.append(el);
    return { el, bar };
  });
  deps.overlay.append(row);

  // ---- ปุ่ม Exit / Restart ----
  const exitBtn = document.createElement('button');
  exitBtn.className = 'game-btn btn-exit';
  exitBtn.textContent = 'Exit';
  exitBtn.addEventListener('click', () => deps.onExit());

  const restartBtn = document.createElement('button');
  restartBtn.className = 'game-btn btn-restart';
  restartBtn.textContent = 'restart';
  restartBtn.addEventListener('click', () => level.restart());
  deps.overlay.append(exitBtn, restartBtn);

  // ---- กล่องแพ้/ชนะ ----
  const panel = document.createElement('div');
  panel.className = 'result-panel';
  const title = document.createElement('h2');
  const rowBtns = document.createElement('div');
  rowBtns.className = 'row';
  const backBtn = document.createElement('button');
  backBtn.className = 'game-btn';
  backBtn.textContent = 'Back to Map';
  backBtn.addEventListener('click', () => deps.onExit());
  const tryAgainBtn = document.createElement('button');
  tryAgainBtn.className = 'game-btn';
  tryAgainBtn.textContent = 'Try Agian';
  tryAgainBtn.addEventListener('click', () => level.restart());
  rowBtns.append(backBtn, tryAgainBtn);
  panel.append(title, rowBtns);
  deps.overlay.append(panel);

  let announced = false;
  let focusedIndex: number | null = null;

  function update(dtMs: number): void {
    // มือถือหมุนเป็นแนวตั้ง: stage ถูกซ่อนด้วย display:none แต่ rAF ยังเดินต่อ
    // หยุดจำลองเกมไว้ตรงนี้ ไม่งั้นผู้เล่นจะพลิกกลับมาเจอเกมจบไปแล้วโดยไม่ได้กดอะไร
    if (deps.isHidden()) return;

    level.update(dtMs);

    const locked = level.cooldownRemainingMs > 0 || level.status !== 'playing';

    // จำปุ่มที่ถือ focus ไว้ "ก่อน" จะ disable ไม่ใช่หลัง
    // เบราว์เซอร์แต่ละตัวย้าย focus ออกจาก element ที่ถูก disable คนละจังหวะกัน
    // ถ้าเช็คหลัง disable บางเบราว์เซอร์จะเห็นเป็น body ไปแล้วและจำไม่ทัน
    if (locked && focusedIndex === null) {
      const i = buttons.findIndex((b) => b.el === document.activeElement);
      if (i >= 0) focusedIndex = i;
    }

    for (const { el, bar } of buttons) {
      el.disabled = locked;
      const ratio = level.cooldownTotalMs > 0
        ? Math.min(1, level.cooldownRemainingMs / level.cooldownTotalMs)
        : 0;
      bar.style.height = `${ratio * 100}%`;
    }

    if (!locked && focusedIndex !== null) {
      if (document.activeElement === document.body) buttons[focusedIndex].el.focus();
      focusedIndex = null;
    }

    if (level.status !== 'playing' && !announced) {
      announced = true;
      title.textContent = level.status === 'won' ? 'You win!' : 'You lose!';
      tryAgainBtn.style.display = level.status === 'lost' ? '' : 'none';
      panel.dataset.open = 'true';
      if (level.status === 'won') deps.onWin(config.unlocks);
    }
    if (level.status === 'playing' && announced) {
      announced = false;
      panel.dataset.open = 'false';
    }
  }

  function render(): void {
    // stage ซ่อนอยู่ (มือถือแนวตั้ง): display:none ไม่ได้หยุด canvas 2D
    // เคลียร์/วาดฉาก 1600x800 ทุกเฟรมทั้งที่มองไม่เห็น จึงข้ามไปเลย
    if (deps.isHidden()) return;

    renderer.clear();
    renderer.image(config.background, 0, 0, STAGE_W, STAGE_H);

    const gf = level.giraffeFortress;
    const ef = level.enemyFortress;
    renderer.image(ef.sprite, ef.x, ef.y, FORTRESS_SIZE, FORTRESS_SIZE);
    renderer.image(gf.sprite, gf.x, gf.y, FORTRESS_SIZE, FORTRESS_SIZE);

    for (const c of [...level.enemies, ...level.giraffes]) {
      renderer.image(c.sprite, c.x, c.y, SPRITE_SIZE, SPRITE_SIZE);
    }

    // แถบ HP ผูกกับป้อมของตัวเองโดยตรง — ต้นฉบับสลับข้างกันตอนสร้าง
    // (FortressGiraffe เรียก sethpenemy, FortressEnemy เรียก sethpgirafe)
    renderer.text(`HP Enemies: ${ef.hp}`, 20, 40, { color: '#fff', font: 'bold 32px system-ui, sans-serif' });
    renderer.text(`HP Giraffe: ${gf.hp}`, 1300, 40, { color: '#fff', font: 'bold 32px system-ui, sans-serif' });
  }

  const loop = createLoop(update, render);
  loop.start();

  return () => {
    loop.stop();
    deps.overlay.replaceChildren();
  };
}
