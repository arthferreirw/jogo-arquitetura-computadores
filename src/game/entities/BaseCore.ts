/**
 * Base Core Entity (Outpost 7 Reactor Hub)
 * Defensive shelter, shield perimeter, automated EMP shockwave defense, and upgrade terminal.
 */

import { BaseCore } from '../types.ts';

export class BaseCoreManager {
  public core: BaseCore;

  constructor(x: number, y: number) {
    this.core = {
      x,
      y,
      radius: 46,
      hp: 500,
      maxHp: 500,
      level: 1,
      shieldRadius: 180,
      pulseCooldown: 12, // Pulse every 12s at level 1, decreases with upgrades
      pulseTimer: 12,
    };
  }

  public update(dt: number, onPulseTrigger?: (x: number, y: number, radius: number) => void): void {
    // Pulse cooldown
    this.core.pulseTimer -= dt;
    if (this.core.pulseTimer <= 0) {
      this.core.pulseTimer = this.core.pulseCooldown;
      if (onPulseTrigger) {
        onPulseTrigger(this.core.x, this.core.y, this.core.shieldRadius * 1.25);
      }
    }
  }

  public isInsideShield(x: number, y: number): boolean {
    return Math.hypot(x - this.core.x, y - this.core.y) <= this.core.shieldRadius;
  }

  public isNearTerminal(x: number, y: number): boolean {
    return Math.hypot(x - this.core.x, y - this.core.y) <= this.core.radius + 80;
  }

  public damageCore(amount: number): boolean {
    this.core.hp = Math.max(0, this.core.hp - amount);
    return this.core.hp <= 0;
  }

  public repair(amount: number): void {
    this.core.hp = Math.min(this.core.maxHp, this.core.hp + amount);
  }

  public upgrade(): void {
    this.core.level++;
    this.core.maxHp += 150;
    this.core.hp = Math.min(this.core.maxHp, this.core.hp + 150);
    this.core.shieldRadius += 25;
    this.core.pulseCooldown = Math.max(5, 12 - this.core.level * 1.5);
  }

  public reset(x: number, y: number): void {
    this.core.x = x;
    this.core.y = y;
    this.core.hp = 500;
    this.core.maxHp = 500;
    this.core.level = 1;
    this.core.shieldRadius = 180;
    this.core.pulseCooldown = 12;
    this.core.pulseTimer = 12;
  }
}
