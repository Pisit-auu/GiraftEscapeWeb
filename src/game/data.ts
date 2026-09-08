import type { CharacterSpec } from './character';

const P = '/assets/projectgame';

/** ชุดเฟรมของแต่ละตัวละคร ถอดจาก constructor ของ subclass ใน Java */
const SPRITES = {
  DefaultGiraffe: {
    walk: [`${P}/default/defaultwalk0.png`, `${P}/default/defaultwalk1.png`, `${P}/default/defaultwalk2.png`, `${P}/default/defaultwalk3.png`],
    attack: [`${P}/default/defaultattack.png`, `${P}/default/defaultattack1.png`, `${P}/default/defaultattack2.png`],
  },
  TankGiraffe: {
    walk: [`${P}/tank/tankwalk0.png`, `${P}/tank/tankwalk1.png`, `${P}/tank/tankwalk2.png`, `${P}/tank/tankwalk3.png`],
    attack: [`${P}/tank/tankattack0.png`, `${P}/tank/tankattack1.png`, `${P}/tank/tankattack2.png`, `${P}/tank/tankwalk3.png`],
  },
  TitanGiraffe: {
    walk: [`${P}/titan/titanwalk0.png`, `${P}/titan/titanwalk1.png`, `${P}/titan/titanwalk2.png`],
    attack: [`${P}/titan/attack0.png`, `${P}/titan/attack1.png`, `${P}/titan/attack2.png`],
  },
  BirdGiraffe: {
    walk: [`${P}/birdgirafe/birdgiraftwalk0.png`, `${P}/birdgirafe/birdgiraftwalk1.png`, `${P}/birdgirafe/birdgiraftwalk2.png`],
    attack: [`${P}/birdgirafe/birdattack0.png`, `${P}/birdgirafe/birdattack1.png`, `${P}/birdgirafe/birdattack2.png`, `${P}/birdgirafe/birdattack3.png`],
  },
  LizardGiraffe: {
    walk: [`${P}/lizard/wa0.png`, `${P}/lizard/wa1.png`],
    attack: [`${P}/lizard/lizardattack0.png`, `${P}/lizard/lizardattack1.png`, `${P}/lizard/lizardattack2.png`],
  },
  Human: {
    walk: [`${P}/people/walk0.png`, `${P}/people/walk1.png`, `${P}/people/walk2.png`, `${P}/people/walk3.png`],
    attack: [`${P}/people/attackpeople0.png`, `${P}/people/attackpeople1.png`, `${P}/people/attackpeople2.png`],
  },
  RobotTank: {
    walk: [`${P}/robottank/robottank0.png`, `${P}/robottank/robottank1.png`, `${P}/robottank/robottank2.png`, `${P}/robottank/robottank3.png`],
    attack: [`${P}/robottank/robotankattack0.png`, `${P}/robottank/robotankattack1.png`, `${P}/robottank/robotankattack2.png`],
  },
  LizardRobot: {
    walk: [`${P}/lizardrobo/lizardwalk0.png`, `${P}/lizardrobo/lizardwalk1.png`],
    attack: [`${P}/lizardrobo/robolizardattack0.png`, `${P}/lizardrobo/robolizardattack1.png`, `${P}/lizardrobo/robolizardattack2.png`],
  },
  SpaceShip: {
    walk: [`${P}/spaceship/spaceshipwalk0.png`, `${P}/spaceship/spaceshipwalk1.png`, `${P}/spaceship/spaceshipwalk2.png`],
    attack: [`${P}/spaceship/spaceshipattack0.png`, `${P}/spaceship/spaceshipattack1.png`, `${P}/spaceship/spaceshipattack2.png`],
  },
  TitanRobot: {
    walk: [`${P}/titanrobo/titanrobowalk0.png`, `${P}/titanrobo/titanrobowalk1.png`, `${P}/titanrobo/titanrobowalk2.png`],
    attack: [`${P}/titanrobo/titanattack0.png`, `${P}/titanrobo/titanattack1.png`, `${P}/titanrobo/titanattack2.png`],
  },
} as const;

export type UnitId = keyof typeof SPRITES;

/** ค่าเรียงตามลำดับ argument ของ constructor ใน Java: velocity, hp, damage, attackSpeed */
function unit(id: UnitId, velocity: number, hp: number, damage: number, attackSpeedMs: number): CharacterSpec {
  return { id, walk: SPRITES[id].walk, attack: SPRITES[id].attack, hp, damage, attackSpeedMs, velocity };
}

const ICON = (name: string) => `${P}/icon/${name}.png`;

export type SpawnButton = {
  readonly icon: string;
  readonly cooldownMs: number;
  readonly spec: CharacterSpec;
};

export type LevelConfig = {
  readonly id: 1 | 2 | 3;
  readonly background: string;
  /** ช่วงสุ่มเวลาระหว่างศัตรูสองตัว [ต่ำสุด, สูงสุด] มิลลิวินาที — จูน balance ที่นี่ */
  readonly spawnIntervalMs: readonly [number, number];
  readonly buttons: readonly SpawnButton[];
  readonly enemies: readonly CharacterSpec[];
  readonly unlocks: 2 | 3 | null;
};

// Readonly ทั้งก้อน: ตารางนี้ถูกอ่านจากหลาย task การเผลอเขียนทับจะทำให้ค่าเกมเพี้ยนแบบหาต้นตอยาก
export const LEVELS: Readonly<Record<1 | 2 | 3, LevelConfig>> = {
  1: {
    id: 1,
    background: '/assets/bgmap1.png',
    spawnIntervalMs: [2000, 3000],
    buttons: [
      { icon: ICON('defaulticon'), cooldownMs: 1000, spec: unit('DefaultGiraffe', -5, 100, 15, 500) },
      { icon: ICON('tankicon'), cooldownMs: 1200, spec: unit('TankGiraffe', -3, 300, 20, 800) },
    ],
    enemies: [
      unit('Human', 15, 200, 20, 500),
      unit('RobotTank', 13, 500, 18, 800),
      unit('SpaceShip', 20, 100, 20, 400),
    ],
    unlocks: 2,
  },
  2: {
    id: 2,
    background: '/assets/bgmap2.png',
    spawnIntervalMs: [7500, 8500],
    buttons: [
      { icon: ICON('defaulticon'), cooldownMs: 1000, spec: unit('DefaultGiraffe', -5, 100, 10, 500) },
      { icon: ICON('tankicon'), cooldownMs: 1200, spec: unit('TankGiraffe', -3, 400, 25, 500) },
      { icon: ICON('titanicon'), cooldownMs: 2000, spec: unit('TitanGiraffe', -2, 400, 30, 1000) },
    ],
    enemies: [
      unit('Human', 15, 100, 15, 500),
      unit('RobotTank', 13, 300, 20, 800),
      unit('SpaceShip', 18, 80, 10, 400),
      unit('LizardRobot', 16, 120, 18, 600),
      unit('TitanRobot', 12, 700, 100, 1000),
    ],
    unlocks: 3,
  },
  3: {
    id: 3,
    background: '/assets/bgmap3.png',
    spawnIntervalMs: [7000, 7500],
    buttons: [
      { icon: ICON('defaulticon'), cooldownMs: 1000, spec: unit('DefaultGiraffe', -5, 100, 20, 300) },
      { icon: ICON('tankicon'), cooldownMs: 1200, spec: unit('TankGiraffe', -3, 300, 25, 500) },
      { icon: ICON('titanicon'), cooldownMs: 1300, spec: unit('TitanGiraffe', -2, 400, 35, 1000) },
      { icon: ICON('birdicon'), cooldownMs: 1500, spec: unit('BirdGiraffe', -8, 2500, 30, 400) },
      { icon: ICON('lizardicon'), cooldownMs: 2000, spec: unit('LizardGiraffe', -6, 300, 40, 200) },
    ],
    enemies: [
      unit('Human', 15, 100, 15, 500),
      unit('RobotTank', 13, 300, 20, 800),
      unit('SpaceShip', 18, 80, 10, 400),
      unit('LizardRobot', 15, 3000, 100, 500),
      unit('TitanRobot', 12, 1000, 100, 1200),
    ],
    unlocks: null,
  },
};

export const FORTRESS_GIRAFFE_SPRITE = `${P}/Giraffefortress.png`;
export const FORTRESS_ENEMY_SPRITE = `${P}/enemyfortress.png`;
export const BG_MAIN = '/assets/startpage.png';
export const BG_MAP = `${P}/map/map1.png`;
export const MAP_MARKER = `${P}/default/defaultwalk0.png`;

/** ตำแหน่งหมุดยีราฟบนหน้าแผนที่ ถอดจาก MapPage.updatePosition */
export const MAP_MARKER_POS: Record<1 | 2 | 3, { x: number; y: number }> = {
  1: { x: 420, y: 130 },
  2: { x: 300, y: 285 },
  3: { x: 540, y: 440 },
};

// ตัวละครหลายตัวโผล่ในหลายด่าน จึงต้อง dedupe ไม่งั้น manifest จะมีรายการซ้ำเกินครึ่ง
export const ALL_ASSET_PATHS: readonly string[] = [
  ...new Set([
    ...Object.values(LEVELS).flatMap((lv) => [
      lv.background,
      ...lv.buttons.flatMap((b) => [b.icon, ...b.spec.walk, ...b.spec.attack]),
      ...lv.enemies.flatMap((e) => [...e.walk, ...e.attack]),
    ]),
    FORTRESS_GIRAFFE_SPRITE, FORTRESS_ENEMY_SPRITE, BG_MAIN, BG_MAP, MAP_MARKER,
  ]),
];
