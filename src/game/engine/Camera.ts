/**
 * Camera System
 * Smooth target following with bounds clamping and decaying trauma camera shake.
 */

export class Camera {
  public x: number = 0;
  public y: number = 0;
  public viewportWidth: number = 1200;
  public viewportHeight: number = 800;

  // Camera Shake Trauma (0 to 1)
  private trauma: number = 0;
  public shakeOffsetX: number = 0;
  public shakeOffsetY: number = 0;
  private maxShakeOffset: number = 6; // Subtle maximum pixel displacement

  // World bounds
  public worldWidth: number = 3200;
  public worldHeight: number = 3200;

  constructor(worldWidth: number = 3200, worldHeight: number = 3200) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.x = worldWidth / 2;
    this.y = worldHeight / 2;
  }

  public setViewportSize(w: number, h: number): void {
    this.viewportWidth = w;
    this.viewportHeight = h;
  }

  /**
   * Adds trauma for camera shake (capped at 0.55 to prevent excessive shaking in swarms)
   */
  public addTrauma(amount: number): void {
    this.trauma = Math.min(0.55, this.trauma + amount);
  }

  /**
   * Updates camera position towards target with lerp and decays camera shake
   */
  public update(targetX: number, targetY: number, dt: number): void {
    // Smooth lerp follow (0.12 factor adjusted for delta time)
    const lerpFactor = 1 - Math.exp(-8 * dt);
    this.x += (targetX - this.x) * lerpFactor;
    this.y += (targetY - this.y) * lerpFactor;

    // Clamp to world bounds so camera doesn't reveal blank space
    const halfW = this.viewportWidth / 2;
    const halfH = this.viewportHeight / 2;
    this.x = Math.max(halfW, Math.min(this.worldWidth - halfW, this.x));
    this.y = Math.max(halfH, Math.min(this.worldHeight - halfH, this.y));

    // Process trauma decay and shake offset
    if (this.trauma > 0) {
      // Fast decay so multiple hits don't sustain screen shake
      this.trauma = Math.max(0, this.trauma - 2.8 * dt);

      // Nonlinear shake intensity (trauma^2) produces subtle feedback
      const shakeIntensity = this.trauma * this.trauma;
      const angle = Math.random() * Math.PI * 2;
      const distance = shakeIntensity * this.maxShakeOffset;

      this.shakeOffsetX = Math.cos(angle) * distance;
      this.shakeOffsetY = Math.sin(angle) * distance;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  /**
   * Converts screen (canvas) coordinates to in-game world coordinates
   * Excludes shakeOffset so camera shake never disturbs player mouse aim.
   */
  public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const originX = this.x - this.viewportWidth / 2;
    const originY = this.y - this.viewportHeight / 2;
    return {
      x: screenX + originX,
      y: screenY + originY,
    };
  }

  /**
   * Converts in-game world coordinates to screen (canvas) coordinates
   */
  public worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const originX = this.x - this.viewportWidth / 2 + this.shakeOffsetX;
    const originY = this.y - this.viewportHeight / 2 + this.shakeOffsetY;
    return {
      x: worldX - originX,
      y: worldY - originY,
    };
  }
}
