/**
 * Particle System
 * Object-pooled visual effects: sparks, dust trails, crystal splinters, shockwaves, and floating indicators.
 */

import { Particle, ParticleShape } from '../types.ts';

export class ParticleSystem {
  private pool: Particle[] = [];
  private activeCount: number = 0;
  private readonly maxParticles: number = 600;

  constructor() {
    // Pre-allocate pool to eliminate mid-game garbage collection pauses
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        size: 2,
        color: '#ffffff',
        alpha: 1,
        shape: 'circle',
      });
    }
  }

  public emit(
    x: number,
    y: number,
    vx: number,
    vy: number,
    maxLife: number,
    size: number,
    color: string,
    shape: ParticleShape = 'circle',
    text?: string
  ): void {
    if (this.activeCount >= this.maxParticles) return;

    const p = this.pool[this.activeCount];
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = maxLife;
    p.maxLife = maxLife;
    p.size = size;
    p.color = color;
    p.alpha = 1;
    p.shape = shape;
    p.text = text;

    this.activeCount++;
  }

  /**
   * Spawn burst of sparks / crystal chips
   */
  public burst(
    x: number,
    y: number,
    count: number,
    color: string,
    speed: number = 160,
    size: number = 3
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (0.3 + Math.random() * 0.7) * speed;
      const vx = Math.cos(angle) * spd;
      const vy = Math.sin(angle) * spd;
      const life = 0.2 + Math.random() * 0.35;
      this.emit(x, y, vx, vy, life, size * (0.6 + Math.random() * 0.8), color, 'spark');
    }
  }

  /**
   * Expanding shockwave ring (used for explosions and Base Core pulses)
   */
  public shockwave(x: number, y: number, color: string, radius: number = 80): void {
    this.emit(x, y, 0, 0, 0.45, radius, color, 'ring');
  }

  /**
   * Floating text indicator (damage taken, resources gained)
   */
  public floatingText(x: number, y: number, text: string, color: string): void {
    const vx = (Math.random() - 0.5) * 20;
    const vy = -60 - Math.random() * 20;
    this.emit(x, y, vx, vy, 0.8, 14, color, 'text', text);
  }

  public update(dt: number): void {
    for (let i = 0; i < this.activeCount; i++) {
      const p = this.pool[i];
      p.life -= dt;

      if (p.life <= 0) {
        // Swap with last active particle to remove in O(1) time
        this.activeCount--;
        const temp = this.pool[i];
        this.pool[i] = this.pool[this.activeCount];
        this.pool[this.activeCount] = temp;
        i--;
        continue;
      }

      // Physics update
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Friction / drag
      if (p.shape === 'spark') {
        p.vx *= Math.pow(0.1, dt);
        p.vy *= Math.pow(0.1, dt);
      }

      // Fade alpha over lifespan
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  public render(ctx: CanvasRenderingContext2D, screenToWorldOffset: { x: number; y: number }): void {
    ctx.save();
    for (let i = 0; i < this.activeCount; i++) {
      const p = this.pool[i];
      const sx = p.x - screenToWorldOffset.x;
      const sy = p.y - screenToWorldOffset.y;

      ctx.globalAlpha = p.alpha;

      if (p.shape === 'circle') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'spark') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * p.alpha, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'ring') {
        const progress = 1 - p.life / p.maxLife;
        const currentRadius = p.size * progress;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3 * (1 - progress);
        ctx.beginPath();
        ctx.arc(sx, sy, currentRadius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'text' && p.text) {
        ctx.fillStyle = p.color;
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.text, sx, sy);
      }
    }
    ctx.restore();
  }

  public clear(): void {
    this.activeCount = 0;
  }
}
