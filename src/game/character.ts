import type { Rect } from '../engine/rect';

export const SPEED_FACTOR = 0.1;
export const FRAME_MS = 300;
export const SPRITE_SIZE = 80;

export type Side = 'giraffe' | 'enemy';
export type CharacterState = 'walking' | 'attacking';

export interface Damageable {
  readonly hp: number;
  readonly bounds: Rect;
  takeDamage(amount: number): void;
}

export type CharacterSpec = {
  id: string;
  walk: readonly string[];
  attack: readonly string[];
  hp: number;
  damage: number;
  attackSpeedMs: number;
  velocity: number;
};

export class Character implements Damageable {
  hp: number;
  state: CharacterState = 'walking';
  /** ตำแหน่ง x เก็บเป็นทศนิยม ไม่ปัดจนกว่าจะวาด ไม่งั้นเศษถูกตัดทุก tick */
  x: number;

  private frameIndex = 0;
  private frameTimer = 0;
  private attackTimer = 0;
  private target: Damageable | null = null;

  constructor(
    readonly spec: CharacterSpec,
    readonly side: Side,
    x: number,
    readonly y: number,
  ) {
    this.x = x;
    this.hp = spec.hp;
  }

  get isAlive(): boolean {
    return this.hp > 0;
  }

  get bounds(): Rect {
    return { x: Math.round(this.x), y: this.y, w: SPRITE_SIZE, h: SPRITE_SIZE };
  }

  get sprite(): string {
    const frames = this.state === 'attacking' ? this.spec.attack : this.spec.walk;
    return frames[this.frameIndex % frames.length];
  }

  update(dtMs: number): void {
    this.frameTimer += dtMs;
    while (this.frameTimer >= FRAME_MS) {
      this.frameTimer -= FRAME_MS;
      this.frameIndex += 1;
    }

    if (this.state === 'walking') {
      this.x += this.spec.velocity * SPEED_FACTOR;
      return;
    }

    if (!this.target || this.target.hp <= 0) {
      this.stopAttacking();
      return;
    }

    this.attackTimer += dtMs;
    while (this.attackTimer >= this.spec.attackSpeedMs) {
      this.attackTimer -= this.spec.attackSpeedMs;
      this.target.takeDamage(this.spec.damage);
      if (this.target.hp <= 0) {
        this.stopAttacking();
        return;
      }
    }
  }

  /** ต้นฉบับตีทันทีก่อน sleep จึงตั้ง timer ให้เต็มเพื่อให้หมัดแรกออกทันที */
  startAttacking(target: Damageable): void {
    if (this.state === 'attacking') return;
    this.state = 'attacking';
    this.target = target;
    this.attackTimer = this.spec.attackSpeedMs;
    this.frameIndex = 0;
    this.frameTimer = 0;
  }

  stopAttacking(): void {
    this.state = 'walking';
    this.target = null;
    this.attackTimer = 0;
    this.frameIndex = 0;
    this.frameTimer = 0;
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }
}
