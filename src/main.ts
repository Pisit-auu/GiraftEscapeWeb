import '@fontsource/mitr/latin-500.css';
import '@fontsource/mitr/latin-600.css';
import '@fontsource/mitr/thai-500.css';
import '@fontsource/mitr/thai-600.css';
import './style.css';
import { browserImageLoader, loadAll, type AssetMap } from './engine/assets';
import { syncOverlayScale } from './engine/stage';
import { ALL_ASSET_PATHS } from './game/data';
import { unlock, type LevelId } from './game/progress';
import { mountLevel } from './screens/levelScreen';
import { mountMainPage } from './screens/mainPage';
import { mountMapPage } from './screens/mapPage';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
const overlay = document.querySelector<HTMLElement>('#overlay');
const stage = document.querySelector<HTMLElement>('#stage');
if (!canvas || !overlay || !stage) throw new Error('โครง HTML ไม่ครบ');

// ต้องเรียกก่อนวางปุ่ม ไม่งั้น overlay จะไม่ทับ canvas บนจอที่ไม่ใช่ 1600px
let stageHidden = false;
syncOverlayScale(stage, overlay, 1600, (hidden) => { stageHidden = hidden; });

const loading = document.createElement('div');
loading.id = 'loading';
const mascot = document.createElement('div');
mascot.className = 'mascot';
const label = document.createElement('div');
label.textContent = 'กำลังโหลด...';
const bar = document.createElement('div');
bar.className = 'bar';
const fill = document.createElement('i');
bar.append(fill);
loading.append(mascot, label, bar);
stage.append(loading);

let unmount: (() => void) | null = null;

function show(mount: (assets: AssetMap) => () => void, assets: AssetMap): void {
  unmount?.();
  unmount = mount(assets);
}

function showMain(assets: AssetMap): void {
  show((a) => mountMainPage({ assets: a, canvas: canvas!, overlay: overlay!, onStart: () => showMap(assets) }), assets);
}

function showMap(assets: AssetMap): void {
  show((a) => mountMapPage({ assets: a, canvas: canvas!, overlay: overlay!, onPlay: (id) => showLevel(assets, id) }), assets);
}

function showLevel(assets: AssetMap, levelId: LevelId): void {
  show(
    (a) =>
      mountLevel({
        levelId,
        assets: a,
        canvas: canvas!,
        overlay: overlay!,
        isHidden: () => stageHidden,
        onExit: () => showMap(assets),
        onWin: (next) => unlock(next),
      }),
    assets,
  );
}

// ปุ่มเต็มจอ: แสดงเฉพาะจอสัมผัสที่เบราว์เซอร์ยอม (iPhone Safari ไม่มี Fullscreen API จึงไม่แสดง)
// ซ่อนแถบที่อยู่ของเบราว์เซอร์ทำให้เวทีใหญ่ขึ้นมากบนมือถือแนวนอน
const fullscreenBtn = document.querySelector<HTMLButtonElement>('#fullscreen');
if (fullscreenBtn && document.fullscreenEnabled && matchMedia('(pointer: coarse)').matches) {
  const sync = (): void => { fullscreenBtn.hidden = document.fullscreenElement !== null; };
  fullscreenBtn.addEventListener('click', () => {
    document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  });
  document.addEventListener('fullscreenchange', sync);
  sync();
}

// HUD ในด่านวาดตัวหนังสือบน canvas ซึ่งไม่รอฟอนต์ให้เอง จึงสั่งโหลดพร้อมรูป
const fontsReady = Promise.all([
  document.fonts.load("600 30px 'Mitr'", 'HP Enemies 0123456789'),
  document.fonts.load("600 30px 'Mitr'", 'ด่าน'),
]).catch(() => []);

loadAll(ALL_ASSET_PATHS, browserImageLoader, (done, total) => {
  fill.style.width = `${(done / total) * 100}%`;
  label.textContent = `กำลังโหลด ${done}/${total}`;
})
  .then(async (assets) => {
    await fontsReady;
    loading.remove();
    showMain(assets);
  })
  .catch((error: unknown) => {
    bar.remove();
    label.textContent = 'เปิดเกมไม่ได้';
    const detail = document.createElement('div');
    detail.className = 'err';
    detail.textContent = error instanceof Error ? error.message : String(error);
    loading.append(detail);
  });
