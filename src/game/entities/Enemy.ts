/**
 * Enemy Entity & Wave Spawner System
 * Distinct behaviors with visual telegraphs (windup lines/aim beams) and smooth difficulty scaling.
 */

import { Enemy, EnemyType, Projectile } from '../types.ts';

export class EnemyManager {
  public enemies: Enemy[] = [];
  public wave: number = 1;
  public waveTimer: number = 0;
  public waveDuration: number = 40; // 40 seconds per wave
  public enemiesRemainingToSpawn: number = 0;
  private spawnInterval: number = 1.8;
  private spawnTimer: number = 0;

  constructor() {
    this.startWave(1);
  }

  public startWave(waveNumber: number): void {
    this.wave = waveNumber;
    this.waveTimer = this.waveDuration;
    // Scale count with wave: wave 1 = 8, wave 2 = 14, wave 3 = 22...
    this.enemiesRemainingToSpawn = 6 + waveNumber * 5;
    this.spawnInterval = Math.max(0.6, 2.0 - waveNumber * 0.15);
    this.spawnTimer = 0.5;
  }

  public update(
    dt: number,
    playerX: number,
    playerY: number,
    baseX: number,
    baseY: number,
    worldWidth: number,
    worldHeight: number,
    onTelegraphSound?: () => void,
    onEnemyFire?: (proj: Projectile) => void
  ): void {
    // Wave countdown
    if (this.waveTimer > 0) {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) {
        this.waveTimer = 0;
      }
    }

    // Spawn ticker
    if (this.enemiesRemainingToSpawn > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = this.spawnInterval;
        this.spawnEnemy(worldWidth, worldHeight, baseX, baseY);
        this.enemiesRemainingToSpawn--;
      }
    }

    // Update individual enemies
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];

      // Target selection: primarily player, or base core if player is far away
      const distToPlayer = Math.hypot(playerX - e.x, playerY - e.y);
      const distToBase = Math.hypot(baseX - e.x, baseY - e.y);
      const targetX = distToPlayer < 450 ? playerX : baseX;
      const targetY = distToPlayer < 450 ? playerY : baseY;

      const angleToTarget = Math.atan2(targetY - e.y, targetX - e.x);
      const currentDist = Math.hypot(targetX - e.x, targetY - e.y);

      // Decrement attack cooldown
      if (e.attackTimer > 0) {
        e.attackTimer -= dt;
      }

      // Behavior per enemy archetype
      if (e.type === 'SWARMER') {
        // Aggressive direct pursuit with subtle flocking
        e.vx = Math.cos(angleToTarget) * e.speed;
        e.vy = Math.sin(angleToTarget) * e.speed;
      } else if (e.type === 'WARDEN') {
        // Heavy bruiser: winds up a powerful charge dash when in range
        if (e.isTelegraphing) {
          e.telegraphTimer -= dt;
          // Stand still or slow down during windup
          e.vx *= 0.8;
          e.vy *= 0.8;

          if (e.telegraphTimer <= 0) {
            // Execute the charge dash!
            e.isTelegraphing = false;
            const chargeAngle = e.telegraphTargetAngle ?? angleToTarget;
            e.vx = Math.cos(chargeAngle) * (e.speed * 3.4);
            e.vy = Math.sin(chargeAngle) * (e.speed * 3.4);
            e.attackTimer = 2.5; // Cooldown before next charge
          }
        } else {
          // If in range and cooldown ready, initiate telegraph windup
          if (currentDist < 260 && e.attackTimer <= 0) {
            e.isTelegraphing = true;
            e.telegraphTimer = e.telegraphDuration;
            e.telegraphTargetAngle = angleToTarget;
            if (onTelegraphSound) onTelegraphSound();
          } else {
            // Normal steady advance
            e.vx = Math.cos(angleToTarget) * e.speed;
            e.vy = Math.sin(angleToTarget) * e.speed;
          }
        }
      } else if (e.type === 'SENTINEL') {
        // Ranged sniper: maintains safe stand-off distance and fires telegraph lasers
        const idealDistance = 320;
        if (e.isTelegraphing) {
          e.telegraphTimer -= dt;
          e.telegraphTargetAngle = angleToTarget; // Track target during lock-on
          e.vx *= 0.7;
          e.vy *= 0.7;

          if (e.telegraphTimer <= 0) {
            e.isTelegraphing = false;
            e.attackTimer = 2.8;

            // Fire projectile towards player
            if (onEnemyFire) {
              const projSpeed = 380;
              const fireAngle = e.telegraphTargetAngle;
              onEnemyFire({
                id: `en_proj_${Date.now()}_${Math.random()}`,
                x: e.x + Math.cos(fireAngle) * e.radius,
                y: e.y + Math.sin(fireAngle) * e.radius,
                vx: Math.cos(fireAngle) * projSpeed,
                vy: Math.sin(fireAngle) * projSpeed,
                radius: 6,
                damage: 18,
                isPlayer: false,
                lifetime: 1.6,
                maxLifetime: 1.6,
                color: '#f43f5e',
              });
            }
          }
        } else {
          // Reposition to maintain comfortable sniper range
          if (currentDist < idealDistance - 60) {
            // Back away
            e.vx = -Math.cos(angleToTarget) * (e.speed * 0.9);
            e.vy = -Math.sin(angleToTarget) * (e.speed * 0.9);
          } else if (currentDist > idealDistance + 80) {
            // Move closer
            e.vx = Math.cos(angleToTarget) * e.speed;
            e.vy = Math.sin(angleToTarget) * e.speed;
          } else {
            // Orbit / strafe
            const strafeAngle = angleToTarget + Math.PI / 2;
            e.vx = Math.cos(strafeAngle) * (e.speed * 0.7);
            e.vy = Math.sin(strafeAngle) * (e.speed * 0.7);
          }

          if (currentDist < 420 && e.attackTimer <= 0) {
            e.isTelegraphing = true;
            e.telegraphTimer = e.telegraphDuration;
            e.telegraphTargetAngle = angleToTarget;
            if (onTelegraphSound) onTelegraphSound();
          }
        }
      }

      // Soft separation repulsion between enemies so they don't stack on top of each other
      for (let j = i + 1; j < this.enemies.length; j++) {
        const other = this.enemies[j];
        const dx = other.x - e.x;
        const dy = other.y - e.y;
        const dist = Math.hypot(dx, dy);
        const minDist = e.radius + other.radius;
        if (dist < minDist && dist > 0.001) {
          const overlap = (minDist - dist) / 2;
          const nx = (dx / dist) * overlap * 3.5;
          const ny = (dy / dist) * overlap * 3.5;
          e.x -= nx * dt;
          e.y -= ny * dt;
          other.x += nx * dt;
          other.y += ny * dt;
        }
      }

      // Integrate motion
      e.x += e.vx * dt;
      e.y += e.vy * dt;

      // Keep inside bounds
      e.x = Math.max(e.radius, Math.min(worldWidth - e.radius, e.x));
      e.y = Math.max(e.radius, Math.min(worldHeight - e.radius, e.y));
    }
  }

  private spawnEnemy(
    worldWidth: number,
    worldHeight: number,
    baseX: number,
    baseY: number
  ): void {
    // Spawn from sector perimeter edge
    let x = 0;
    let y = 0;
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) {
      // Top
      x = Math.random() * worldWidth;
      y = 40;
    } else if (edge === 1) {
      // Right
      x = worldWidth - 40;
      y = Math.random() * worldHeight;
    } else if (edge === 2) {
      // Bottom
      x = Math.random() * worldWidth;
      y = worldHeight - 40;
    } else {
      // Left
      x = 40;
      y = Math.random() * worldHeight;
    }

    // Determine type by wave progression
    const roll = Math.random();
    let type: EnemyType = 'SWARMER';
    let hp = 45 + this.wave * 8;
    let speed = 145 + Math.min(60, this.wave * 6);
    let radius = 14;
    let damage = 12 + this.wave * 2;
    let color = '#ef4444'; // Red
    let telegraphDuration = 0.6;
    let score = 50;

    if (this.wave >= 2 && roll > 0.7) {
      type = 'WARDEN';
      hp = 160 + this.wave * 25;
      speed = 75;
      radius = 24;
      damage = 28;
      color = '#f97316'; // Orange
      telegraphDuration = 0.8;
      score = 140;
    } else if (this.wave >= 3 && roll > 0.45) {
      type = 'SENTINEL';
      hp = 80 + this.wave * 12;
      speed = 110;
      radius = 16;
      damage = 16;
      color = '#e11d48'; // Crimson
      telegraphDuration = 0.95;
      score = 110;
    }

    this.enemies.push({
      id: `enemy_${Date.now()}_${Math.random()}`,
      type,
      x,
      y,
      vx: 0,
      vy: 0,
      radius,
      hp,
      maxHp: hp,
      speed,
      contactDamage: damage,
      color,
      attackCooldown: 2.0,
      attackTimer: 1.0,
      telegraphTimer: 0,
      telegraphDuration,
      isTelegraphing: false,
      scoreValue: score,
    });
  }

  public damageEnemy(
    enemyId: string,
    damage: number
  ): { defeated: boolean; score: number; x: number; y: number; type: EnemyType } | null {
    const idx = this.enemies.findIndex((e) => e.id === enemyId);
    if (idx === -1) return null;

    const e = this.enemies[idx];
    e.hp -= damage;

    if (e.hp <= 0) {
      const result = {
        defeated: true,
        score: e.scoreValue,
        x: e.x,
        y: e.y,
        type: e.type,
      };
      this.enemies.splice(idx, 1);
      return result;
    }

    return {
      defeated: false,
      score: 0,
      x: e.x,
      y: e.y,
      type: e.type,
    };
  }

  public clear(): void {
    this.enemies = [];
    this.enemiesRemainingToSpawn = 0;
  }
}
