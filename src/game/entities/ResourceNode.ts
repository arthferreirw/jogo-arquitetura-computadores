/**
 * Resource Node Entity
 * Mineable environmental deposits with distinct yields, visual facets, and respawn cycles.
 */

import { ResourceNode, ResourceType } from '../types.ts';

export class ResourceManager {
  public nodes: ResourceNode[] = [];

  constructor(worldWidth: number, worldHeight: number, count: number = 45) {
    this.generateNodes(worldWidth, worldHeight, count);
  }

  /**
   * Procedurally generates resource nodes distributed across the sector,
   * avoiding spawning right on top of the central Outpost Base.
   */
  public generateNodes(worldWidth: number, worldHeight: number, count: number): void {
    this.nodes = [];
    const centerX = worldWidth / 2;
    const centerY = worldHeight / 2;
    const baseSafeZone = 240; // Keep space around central base clean

    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      let valid = false;
      let attempts = 0;

      while (!valid && attempts < 50) {
        x = 120 + Math.random() * (worldWidth - 240);
        y = 120 + Math.random() * (worldHeight - 240);
        const distToBase = Math.hypot(x - centerX, y - centerY);

        if (distToBase > baseSafeZone) {
          valid = true;
          // Check collision with other nodes
          for (const other of this.nodes) {
            if (Math.hypot(x - other.x, y - other.y) < 70) {
              valid = false;
              break;
            }
          }
        }
        attempts++;
      }

      if (!valid) continue;

      // Distribuição de recursos de Arquitetura: 50% Clock (Hz), 35% Cache SRAM (KB), 15% Opcodes (ISA)
      const roll = Math.random();
      let type: ResourceType = 'aether';
      let hp = 100;
      let radius = 22;
      let baseYield = 10;
      let glowColor = '#fbbf24'; // Gold Clock Oscillator
      let fillColor = '#92400e';

      if (roll > 0.85) {
        type = 'plasma';
        hp = 180;
        radius = 26;
        baseYield = 6;
        glowColor = '#10b981'; // Phosphor Emerald Opcode ROM
        fillColor = '#065f46';
      } else if (roll > 0.5) {
        type = 'titanium';
        hp = 140;
        radius = 24;
        baseYield = 8;
        glowColor = '#e2e8f0'; // Silver Silicon SRAM Chip
        fillColor = '#334155';
      }

      this.nodes.push({
        id: `node_${i}_${Date.now()}`,
        type,
        x,
        y,
        radius,
        hp,
        maxHp: hp,
        baseYield,
        glowColor,
        fillColor,
        respawnTime: 0,
      });
    }
  }

  public update(dt: number): void {
    // Regenerate depleted nodes after respawn time expires
    for (const node of this.nodes) {
      if (node.respawnTime > 0) {
        node.respawnTime -= dt;
        if (node.respawnTime <= 0) {
          node.hp = node.maxHp;
          node.respawnTime = 0;
        }
      }
    }
  }

  /**
   * Applies mining damage to a target node. Returns harvested amount if depleted.
   */
  public mineNode(nodeId: string, damage: number): { minedAmount: number; isDepleted: boolean; type: ResourceType } | null {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node || node.respawnTime > 0) return null;

    node.hp -= damage;

    if (node.hp <= 0) {
      node.hp = 0;
      node.respawnTime = 22; // 22 seconds regeneration cycle
      return {
        minedAmount: node.baseYield,
        isDepleted: true,
        type: node.type,
      };
    }

    return {
      minedAmount: 0,
      isDepleted: false,
      type: node.type,
    };
  }

  public findNearestNode(
    x: number,
    y: number,
    maxRange: number = 220
  ): ResourceNode | null {
    let nearest: ResourceNode | null = null;
    let minDist = maxRange;

    for (const node of this.nodes) {
      if (node.respawnTime > 0) continue;
      const d = Math.hypot(node.x - x, node.y - y);
      if (d < minDist) {
        minDist = d;
        nearest = node;
      }
    }

    return nearest;
  }
}
