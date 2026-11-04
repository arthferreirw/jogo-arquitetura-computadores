/**
 * Player Entity
 * Handles ship kinematics, mining laser beam, plasma blaster attacks,
 * and high-speed directional dash with cooldown.
 */

import { PlayerStats, ResourceInventory } from '../types.ts';

export class Player {
  public x: number = 1600;
  public y: number = 1600;
  public vx: number = 0;
  public vy: number = 0;
  public angle: number = 0; // In radians
  public radius: number = 18;

  public stats: PlayerStats = {
    maxHp: 100,
    hp: 100,
    maxEnergy: 100,
    energy: 100,
    moveSpeed: 230,
    miningPower: 45, // Damage per second to mineral nodes
    blasterDamage: 32,
    blasterFireRate: 3.5, // 3.5 shots/sec
    dashSpeed: 620,
    dashCooldownTime: 1.8,
  };

  public inventory: ResourceInventory = {
    aether: 20, // Start with a small reserve for first upgrade
    titanium: 15,
    plasma: 5,
  };

  public blasterTimer: number = 0;
  public dashTimer: number = 0;
  public isDashing: boolean = false;
  public dashDurationTimer: number = 0;
  public dashDirectionX: number = 0;
  public dashDirectionY: number = 0;

  public isMining: boolean = false;
  public miningTargetId: string | null = null;
  public miningBeamProgress: number = 0;

  // Invulnerability window after taking heavy hit
  public invulnTimer: number = 0;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
  }

  public update(
    dt: number,
    moveInput: { x: number; y: number },
    targetAimX: number,
    targetAimY: number,
    worldBounds: { width: number; height: number }
  ): void {
    // Face towards crosshair / aim point
    this.angle = Math.atan2(targetAimY - this.y, targetAimX - this.x);

    // Update timers
    if (this.blasterTimer > 0) this.blasterTimer -= dt;
    if (this.dashTimer > 0) this.dashTimer -= dt;
    if (this.invulnTimer > 0) this.invulnTimer -= dt;

    // Process Dash
    if (this.isDashing) {
      this.dashDurationTimer -= dt;
      this.vx = this.dashDirectionX * this.stats.dashSpeed;
      this.vy = this.dashDirectionY * this.stats.dashSpeed;

      if (this.dashDurationTimer <= 0) {
        this.isDashing = false;
      }
    } else {
      // Normal acceleration and deceleration kinematics
      const targetVx = moveInput.x * this.stats.moveSpeed;
      const targetVy = moveInput.y * this.stats.moveSpeed;

      // Smooth acceleration with inertia
      const accel = 12;
      this.vx += (targetVx - this.vx) * Math.min(1, accel * dt);
      this.vy += (targetVy - this.vy) * Math.min(1, accel * dt);
    }

    // Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Clamp inside world boundaries
    const padding = this.radius + 10;
    this.x = Math.max(padding, Math.min(worldBounds.width - padding, this.x));
    this.y = Math.max(padding, Math.min(worldBounds.height - padding, this.y));

    // Passive energy recharge (slower when mining)
    const energyRechargeRate = this.isMining ? 4 : 14;
    this.stats.energy = Math.min(
      this.stats.maxEnergy,
      this.stats.energy + energyRechargeRate * dt
    );
  }

  public triggerDash(dirX: number, dirY: number): boolean {
    if (this.dashTimer > 0 || this.stats.energy < 20) return false;

    // Use current movement direction or facing angle if idle
    let dx = dirX;
    let dy = dirY;
    if (dx === 0 && dy === 0) {
      dx = Math.cos(this.angle);
      dy = Math.sin(this.angle);
    }

    const len = Math.hypot(dx, dy);
    this.dashDirectionX = len > 0 ? dx / len : 1;
    this.dashDirectionY = len > 0 ? dy / len : 0;

    this.isDashing = true;
    this.dashDurationTimer = 0.18; // 180ms dash duration
    this.dashTimer = this.stats.dashCooldownTime;
    this.invulnTimer = 0.22; // Invulnerable during dash
    this.stats.energy -= 20;

    return true;
  }

  public canFireBlaster(): boolean {
    return this.blasterTimer <= 0;
  }

  public recordBlasterShot(): void {
    this.blasterTimer = 1 / this.stats.blasterFireRate;
  }

  public takeDamage(amount: number): boolean {
    if (this.invulnTimer > 0) return false;
    this.stats.hp = Math.max(0, this.stats.hp - amount);
    this.invulnTimer = 0.35; // 350ms mercy invulnerability window
    return true;
  }

  public heal(amount: number): void {
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
  }

  public reset(startX: number, startY: number): void {
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
    this.stats.hp = this.stats.maxHp;
    this.stats.energy = this.stats.maxEnergy;
    this.isDashing = false;
    this.dashTimer = 0;
    this.blasterTimer = 0;
    this.invulnTimer = 0;
    this.isMining = false;
    this.miningTargetId = null;
  }
}
