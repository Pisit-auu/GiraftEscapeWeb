import { intersects } from '../engine/rect';
import { Character } from './character';
import { Fortress } from './fortress';
import {
  FORTRESS_ENEMY_SPRITE,
  FORTRESS_GIRAFFE_SPRITE,
  type LevelConfig,
} from './data';

export type LevelStatus = 'playing' | 'won' | 'lost';
export type Rng = () => number;

export const GIRAFFE_SPAWN_X = 1300;
export const GIRAFFE_SPAWN_Y_BASE = 520;
export const GIRAFFE_SPAWN_Y_RANGE = 20;
export const ENEMY_SPAWN_X = 150;
export const ENEMY_SPAWN_Y_BASE = 530;
export const ENEMY_SPAWN_Y_RANGE = 30;
export const FORTRESS_HP = 1000;

export class Level {
  readonly giraffeFortress: Fortress;
  readonly enemyFortress: Fortress;

  giraffes: Character[] = [];
  enemies: Character[] = [];
  status: LevelStatus = 'playing';

  /** cooldown แบบรวมทุกปุ่ม ตรงกับ setButtonEnabled(false) ของต้นฉบับ */
  cooldownRemainingMs = 0;
  /** ระยะ cooldown ของปุ่มที่กดล่าสุด ใช้คำนวณสัดส่วนแถบบน UI */
  cooldownTotalMs = 0;

  private spawnTimerMs: number;

  constructor(
    readonly config: LevelConfig,
    private readonly rng: Rng = Math.random,
  ) {
    this.giraffeFortress = new Fortress('giraffe', FORTRESS_GIRAFFE_SPRITE, 1350, 300, FORTRESS_HP);
    this.enemyFortress = new Fortress('enemy', FORTRESS_ENEMY_SPRITE, -200, 250, FORTRESS_HP);
    this.spawnTimerMs = this.nextSpawnDelay();
  }

  private randInt(base: number, range: number): number {
    return base + Math.floor(this.rng() * range);
  }

  private nextSpawnDelay(): number {
    const [min, max] = this.config.spawnIntervalMs;
    return this.randInt(min, max - min);
  }

  trySpawnGiraffe(buttonIndex: number): boolean {
    if (this.status !== 'playing') return false;
    if (this.cooldownRemainingMs > 0) return false;
    const button = this.config.buttons[buttonIndex];
    if (!button) return false;

    const y = this.randInt(GIRAFFE_SPAWN_Y_BASE, GIRAFFE_SPAWN_Y_RANGE);
    this.giraffes.push(new Character(button.spec, 'giraffe', GIRAFFE_SPAWN_X, y));
    this.cooldownRemainingMs = button.cooldownMs;
    this.cooldownTotalMs = button.cooldownMs;
    return true;
  }

  private spawnEnemy(): void {
    const pool = this.config.enemies;
    const spec = pool[Math.floor(this.rng() * pool.length)] ?? pool[0];
    const y = this.randInt(ENEMY_SPAWN_Y_BASE, ENEMY_SPAWN_Y_RANGE);
    this.enemies.push(new Character(spec, 'enemy', ENEMY_SPAWN_X, y));
  }

  update(dtMs: number): void {
    if (this.cooldownRemainingMs > 0) {
      this.cooldownRemainingMs = Math.max(0, this.cooldownRemainingMs - dtMs);
    }
    if (this.status !== 'playing') return;

    for (const c of this.giraffes) c.update(dtMs);
    for (const c of this.enemies) c.update(dtMs);

    this.resolveCollisions();
    this.checkResult();

    // เกิดศัตรูท้ายเฟรม: ตัวที่เพิ่งเกิดจะยังไม่ขยับในเฟรมเดียวกับที่มันเกิด
    // ทำให้ตำแหน่งแรกที่มองเห็นคือจุดเกิดจริง และเกมที่เพิ่งจบในเฟรมนี้จะไม่เกิดศัตรูเพิ่ม
    if (this.status === 'playing') {
      this.spawnTimerMs -= dtMs;
      if (this.spawnTimerMs <= 0) {
        this.spawnEnemy();
        this.spawnTimerMs = this.nextSpawnDelay();
      }
    }
  }

  private resolveCollisions(): void {
    for (const giraffe of this.giraffes) {
      for (const enemy of this.enemies) {
        if (!intersects(giraffe.bounds, enemy.bounds)) continue;
        giraffe.startAttacking(enemy);
        enemy.startAttacking(giraffe);
      }
    }

    this.giraffes = this.giraffes.filter((c) => c.isAlive);
    this.enemies = this.enemies.filter((c) => c.isAlive);

    for (const giraffe of this.giraffes) {
      if (intersects(giraffe.bounds, this.enemyFortress.bounds)) {
        giraffe.startAttacking(this.enemyFortress);
      }
    }
    for (const enemy of this.enemies) {
      if (intersects(enemy.bounds, this.giraffeFortress.bounds)) {
        enemy.startAttacking(this.giraffeFortress);
      }
    }
  }

  private checkResult(): void {
    if (this.enemyFortress.hp <= 0) this.status = 'won';
    else if (this.giraffeFortress.hp <= 0) this.status = 'lost';
  }

  restart(): void {
    this.giraffes = [];
    this.enemies = [];
    this.giraffeFortress.reset();
    this.enemyFortress.reset();
    this.status = 'playing';
    this.cooldownRemainingMs = 0;
    this.cooldownTotalMs = 0;
    this.spawnTimerMs = this.nextSpawnDelay();
  }
}
