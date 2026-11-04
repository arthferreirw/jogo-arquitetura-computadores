/**
 * Physics & Collision System
 * Circle-Circle, Raycast intersection, and AABB boundary resolution.
 */

export class Physics {
  /**
   * Circle-Circle overlap test
   */
  public static checkCircleCollision(
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distSq = dx * dx + dy * dy;
    const radiusSum = r1 + r2;
    return distSq <= radiusSum * radiusSum;
  }

  /**
   * Resolves elastic separation pushback between two circular bodies
   */
  public static resolveCircleOverlap(
    c1: { x: number; y: number; radius: number },
    c2: { x: number; y: number; radius: number },
    weight1: number = 0.5,
    weight2: number = 0.5
  ): boolean {
    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const dist = Math.hypot(dx, dy);
    const minDist = c1.radius + c2.radius;

    if (dist < minDist && dist > 0.0001) {
      const overlap = minDist - dist;
      const nx = dx / dist;
      const ny = dy / dist;

      c1.x -= nx * overlap * weight1;
      c1.y -= ny * overlap * weight1;
      c2.x += nx * overlap * weight2;
      c2.y += ny * overlap * weight2;
      return true;
    }
    return false;
  }

  /**
   * Point in circle check
   */
  public static isPointInCircle(
    px: number,
    py: number,
    cx: number,
    cy: number,
    radius: number
  ): boolean {
    const dx = px - cx;
    const dy = py - cy;
    return dx * dx + dy * dy <= radius * radius;
  }

  /**
   * Raycast distance from origin (x0, y0) towards target (x1, y1)
   */
  public static getRayDistance(
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): number {
    return Math.hypot(x1 - x0, y1 - y0);
  }
}
