/**
 * Types & Interfaces for Aetheria: Outpost 7
 * Scalable 2D Game Architecture
 */

export type GameState =
  | 'TITLE'
  | 'PLAYING'
  | 'PAUSED'
  | 'UPGRADE_STATION'
  | 'GAME_OVER'
  | 'VICTORY';

export type ResourceType = 'aether' | 'titanium' | 'plasma';

export interface ResourceInventory {
  aether: number;
  titanium: number;
  plasma: number;
}

export interface PlayerStats {
  maxHp: number;
  hp: number;
  maxEnergy: number;
  energy: number;
  moveSpeed: number;
  miningPower: number; // Damage per second to mineral nodes
  blasterDamage: number;
  blasterFireRate: number; // Shots per second
  dashSpeed: number;
  dashCooldownTime: number; // Seconds
}

export interface UpgradeDefinition {
  id: string;
  name: string;
  category: 'BARRAMENTO' | 'EXECUÇÃO' | 'MEMÓRIA' | 'PIPELINE' | 'NÚCLEO CPU';
  description: string;
  level: number;
  maxLevel: number;
  cost: {
    aether: number;   // Ciclos de Clock (Hz)
    titanium: number; // Cache SRAM (KB)
    plasma: number;   // Instruções / Opcodes (ISA)
  };
}

export interface BaseCore {
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  level: number;
  shieldRadius: number;
  pulseCooldown: number;
  pulseTimer: number;
}

export interface ResourceNode {
  id: string;
  type: ResourceType;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  baseYield: number;
  glowColor: string;
  fillColor: string;
  respawnTime: number; // 0 if active, > 0 if depleted and regenerating
}

export type EnemyType = 'SWARMER' | 'WARDEN' | 'SENTINEL';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  contactDamage: number;
  color: string;
  attackCooldown: number;
  attackTimer: number;
  // Telegraph windup: provides clear visual warning before dashing or shooting
  telegraphTimer: number;
  telegraphDuration: number;
  isTelegraphing: boolean;
  telegraphTargetAngle?: number;
  scoreValue: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isPlayer: boolean;
  lifetime: number;
  maxLifetime: number;
  color: string;
}

export type ParticleShape = 'circle' | 'spark' | 'ring' | 'text';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  shape: ParticleShape;
  text?: string;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  shakeTrauma: number; // 0 to 1, decayed quadratically
  shakeOffsetX: number;
  shakeOffsetY: number;
}

export interface GameTelemetrySnapshot {
  state: GameState;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  coreHp: number;
  coreMaxHp: number;
  coreLevel: number;
  inventory: ResourceInventory;
  wave: number;
  waveTimer: number;
  waveDuration: number;
  activeEnemies: number;
  score: number;
  timeSurvived: number;
  isNearCore: boolean;
  dashReady: boolean;
  dashCooldownProgress: number;
  soundMuted: boolean;
}
