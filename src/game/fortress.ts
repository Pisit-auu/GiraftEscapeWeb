import type { Rect } from '../engine/rect';
import type { Damageable, Side } from './character';

export const FORTRESS_SIZE = 400;

export class Fortress implements Damageable {
  hp: number;

  constructor(
    readonly side: Side,
    readonly sprite: string,
    readonly x: number,
    readonly y: number,
    readonly maxHp: number,
  ) {
    this.hp = maxHp;
  }

  get bounds(): Rect {
    return { x: this.x, y: this.y, w: FORTRESS_SIZE, h: FORTRESS_SIZE };
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }

  reset(): void {
    this.hp = this.maxHp;
  }
}
