/**
 * Main Game Coordinator & Game Loop Engine
 * Manages simulation updates, hitstop freezing, audio dispatch, and entity lifecycles.
 */

import { GameState, Projectile, GameTelemetrySnapshot, UpgradeDefinition } from '../types.ts';
import { Camera } from '../engine/Camera.ts';
import { InputManager } from '../engine/InputManager.ts';
import { ParticleSystem } from '../engine/ParticleSystem.ts';
import { audioSynth } from '../engine/AudioSynth.ts';
import { Player } from '../entities/Player.ts';
import { BaseCoreManager } from '../entities/BaseCore.ts';
import { ResourceManager } from '../entities/ResourceNode.ts';
import { EnemyManager } from '../entities/Enemy.ts';
import { Physics } from './Physics.ts';
import { CanvasRenderer } from '../renderer/CanvasRenderer.ts';
import { SaveSystem } from './SaveSystem.ts';
import { INITIAL_UPGRADES } from './Upgrades.ts';

export class GameManager {
  public state: GameState = 'TITLE';
  public worldWidth: number = 3200;
  public worldHeight: number = 3200;

  // Subsystems
  public camera: Camera;
  public input: InputManager;
  public particles: ParticleSystem;
  public player: Player;
  public baseManager: BaseCoreManager;
  public resourceManager: ResourceManager;
  public enemyManager: EnemyManager;
  public projectiles: Projectile[] = [];
  public upgrades: UpgradeDefinition[] = JSON.parse(JSON.stringify(INITIAL_UPGRADES));

  private renderer: CanvasRenderer | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private animationFrameId: number | null = null;

  // Game stats
  public score: number = 0;
  public timeSurvived: number = 0;
  public totalMineralsMined: number = 0;
  public totalEnemiesDefeated: number = 0;
  public gameOverReason: string = '';

  // Timing & Hitstop (freeze-frame simulation pause for heavy impact feel)
  private lastTimestamp: number = 0;
  private hitstopTimer: number = 0;

  // Telemetry callback for React HUD (called at throttled rate or state change)
  public onTelemetryUpdate?: (snapshot: GameTelemetrySnapshot) => void;
  public onStateChange?: (newState: GameState) => void;

  private telemetryThrottleTimer: number = 0;

  constructor() {
    this.camera = new Camera(this.worldWidth, this.worldHeight);
    this.input = new InputManager();
    this.particles = new ParticleSystem();

    const centerX = this.worldWidth / 2;
    const centerY = this.worldHeight / 2;
    this.player = new Player(centerX, centerY + 80);
    this.baseManager = new BaseCoreManager(centerX, centerY);
    this.resourceManager = new ResourceManager(this.worldWidth, this.worldHeight, 48);
    this.enemyManager = new EnemyManager();

    this.tick = this.tick.bind(this);
  }

  public init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.input.attachCanvas(canvas);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.renderer = new CanvasRenderer(ctx, this.camera, this.particles);
    }

    this.handleResize();
    window.addEventListener('resize', this.handleResize.bind(this));

    // Start tick loop
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  public handleResize(): void {
    if (!this.canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    this.camera.setViewportSize(w, h);
  }

  public setState(nextState: GameState): void {
    const prevState = this.state;
    this.state = nextState;

    if (prevState === 'PLAYING' && nextState !== 'PLAYING') {
      // Stop mining audio if leaving playing state
      audioSynth.setMiningSound(false);
    }

    if (this.onStateChange) {
      this.onStateChange(nextState);
    }
    this.broadcastTelemetry();
  }

  public startGame(): void {
    audioSynth.init();
    this.resetMatch();
    this.setState('PLAYING');
  }

  public resetMatch(): void {
    const centerX = this.worldWidth / 2;
    const centerY = this.worldHeight / 2;
    this.player.reset(centerX, centerY + 80);
    this.baseManager.reset(centerX, centerY);
    this.resourceManager.generateNodes(this.worldWidth, this.worldHeight, 48);
    this.enemyManager.clear();
    this.enemyManager.startWave(1);
    this.projectiles = [];
    this.particles.clear();
    this.upgrades = JSON.parse(JSON.stringify(INITIAL_UPGRADES));
    this.score = 0;
    this.timeSurvived = 0;
    this.totalMineralsMined = 0;
    this.totalEnemiesDefeated = 0;
    this.gameOverReason = '';
    this.hitstopTimer = 0;
  }

  /**
   * Main 60fps Game Loop
   */
  private tick(timestamp: number): void {
    // Calculate and CLAMP delta time to prevent physics tunneling or spiral of death
    const rawDt = (timestamp - this.lastTimestamp) / 1000;
    const dt = Math.min(rawDt, 0.05); // Never simulate more than 50ms in one step
    this.lastTimestamp = timestamp;

    if (this.state === 'PLAYING') {
      this.timeSurvived += dt;

      // Hitstop logic: freezes simulation physics during heavy impacts while rendering continues
      if (this.hitstopTimer > 0) {
        this.hitstopTimer -= dt;
      } else {
        this.updateSimulation(dt);
      }
    } else if (this.state === 'TITLE') {
      // Atmospheric slow camera pan around Base Core on Title Screen
      const centerX = this.worldWidth / 2;
      const centerY = this.worldHeight / 2;
      const panRadius = 140;
      const panSpeed = timestamp * 0.0004;
      const panX = centerX + Math.cos(panSpeed) * panRadius;
      const panY = centerY + Math.sin(panSpeed) * panRadius;
      this.camera.update(panX, panY, dt);
      this.particles.update(dt);
    }

    // Always render canvas
    if (this.renderer) {
      this.renderer.render(
        this.player,
        this.baseManager,
        this.resourceManager,
        this.enemyManager,
        this.projectiles,
        timestamp / 1000
      );
    }

    // Throttled HUD telemetry sync (approx 12 times per sec to prevent React overhead)
    this.telemetryThrottleTimer += dt;
    if (this.telemetryThrottleTimer >= 0.08) {
      this.telemetryThrottleTimer = 0;
      this.broadcastTelemetry();
    }

    // Reset edge-triggered inputs for next frame
    this.input.endFrame();

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  /**
   * Core Game Simulation Step
   */
  private updateSimulation(dt: number): void {
    // 1. Process Global Hotkeys
    if (this.input.wasJustPressed('escape')) {
      this.setState('PAUSED');
      return;
    }

    if (this.input.wasJustPressed('m')) {
      audioSynth.toggleMute();
      this.broadcastTelemetry();
    }

    const mouseWorld = this.camera.screenToWorld(this.input.mouseX, this.input.mouseY);

    // 2. Base Core Terminal Interaction check ('E' or clicking near core)
    const isNearCore = this.baseManager.isNearTerminal(this.player.x, this.player.y);
    if (isNearCore && this.input.wasJustPressed('e')) {
      this.setState('UPGRADE_STATION');
      return;
    }

    // 3. Player Movement & Aiming
    const moveVector = this.input.getMovementVector();
    this.player.update(
      dt,
      moveVector,
      mouseWorld.x,
      mouseWorld.y,
      { width: this.worldWidth, height: this.worldHeight }
    );

    // Dash Action (Shift key or Right Mouse Button -> JMP Instruction)
    if (this.input.wasJustPressed('shift') || this.input.justRightClicked) {
      if (this.player.triggerDash(moveVector.x, moveVector.y)) {
        audioSynth.playDash();
        this.particles.burst(this.player.x, this.player.y, 12, '#fbbf24', 140, 2);
        this.camera.addTrauma(0.06);
      }
    }

    // 4. Local Bus Shield Energy & Voltage Regen
    if (this.baseManager.isInsideShield(this.player.x, this.player.y)) {
      this.player.heal(3.5 * dt);
      this.player.stats.energy = Math.min(
        this.player.stats.maxEnergy,
        this.player.stats.energy + 18 * dt
      );
    }

    // 5. Data Bus Fetch Handling (Hold Space or hold LMB)
    const wantsToMine = this.input.isHeld(' ') || (this.input.isMouseDown && !this.input.isHeld('f'));
    const nearestNode = this.resourceManager.findNearestNode(this.player.x, this.player.y, 220);

    if (wantsToMine && nearestNode) {
      this.player.isMining = true;
      this.player.miningTargetId = nearestNode.id;
      audioSynth.setMiningSound(true);

      // Apply fetch bandwidth tick
      const harvestDamage = this.player.stats.miningPower * dt;
      const result = this.resourceManager.mineNode(nearestNode.id, harvestDamage);

      // Emit bus read sparks at node
      this.particles.burst(nearestNode.x, nearestNode.y, 2, nearestNode.glowColor, 80, 2);

      if (result && result.isDepleted) {
        // Node fetched! Award Computer Architecture resources
        this.player.inventory[result.type] += result.minedAmount;
        this.totalMineralsMined += result.minedAmount;
        this.score += result.minedAmount * 10;
        audioSynth.playCollect(result.type);
        this.particles.burst(nearestNode.x, nearestNode.y, 24, nearestNode.glowColor, 180, 3.5);

        const labelMap = {
          aether: 'CLOCK Hz',
          titanium: 'SRAM KB',
          plasma: 'OPCODE',
        };
        this.particles.floatingText(
          nearestNode.x,
          nearestNode.y,
          `+${result.minedAmount} ${labelMap[result.type]}`,
          nearestNode.glowColor
        );
      }
    } else {
      this.player.isMining = false;
      this.player.miningTargetId = null;
      audioSynth.setMiningSound(false);
    }

    // 6. ULA Logic Pulse Attack (Click or hold 'F' or left click when not fetching)
    const wantsToShoot = this.input.isHeld('f') || (!this.player.isMining && this.input.isMouseDown);
    if (wantsToShoot && this.player.canFireBlaster()) {
      this.player.recordBlasterShot();
      audioSynth.playLaser();

      const angle = this.player.angle;
      const speed = 640;
      const spawnX = this.player.x + Math.cos(angle) * (this.player.radius + 6);
      const spawnY = this.player.y + Math.sin(angle) * (this.player.radius + 6);

      this.projectiles.push({
        id: `pl_proj_${Date.now()}_${Math.random()}`,
        x: spawnX,
        y: spawnY,
        vx: Math.cos(angle) * speed + this.player.vx * 0.2,
        vy: Math.sin(angle) * speed + this.player.vy * 0.2,
        radius: 4,
        damage: this.player.stats.blasterDamage,
        isPlayer: true,
        lifetime: 1.4,
        maxLifetime: 1.4,
        color: '#10b981',
      });

      this.particles.burst(spawnX, spawnY, 4, '#fbbf24', 90, 2);
    }

    // 7. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.lifetime -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.lifetime <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with enemies if player projectile
      if (p.isPlayer) {
        let hit = false;
        for (const enemy of this.enemyManager.enemies) {
          if (Physics.checkCircleCollision(p.x, p.y, p.radius, enemy.x, enemy.y, enemy.radius)) {
            hit = true;
            const res = this.enemyManager.damageEnemy(enemy.id, p.damage);
            audioSynth.playHit();
            this.particles.burst(p.x, p.y, 8, '#10b981', 120, 2);
            this.particles.floatingText(enemy.x, enemy.y, `-${Math.round(p.damage)}`, '#fde68a');

            if (res && res.defeated) {
              this.score += res.score;
              this.totalEnemiesDefeated++;
              audioSynth.playExplosion();
              this.particles.burst(res.x, res.y, 28, '#ef4444', 220, 4);
              this.particles.shockwave(res.x, res.y, '#fbbf24', 65);
              // Subtle hitstop & screen trauma on kill
              this.hitstopTimer = 0.02;
              this.camera.addTrauma(0.12);

              // Chance of rare Opcode drop
              if (Math.random() > 0.65) {
                this.player.inventory.plasma += 1;
                audioSynth.playCollect('plasma');
                this.particles.floatingText(res.x, res.y - 20, '+1 OPCODE', '#10b981');
              }
            }
            break;
          }
        }
        if (hit) {
          this.projectiles.splice(i, 1);
          continue;
        }
      } else {
        // Enemy projectile hitting Player
        if (
          Physics.checkCircleCollision(
            p.x,
            p.y,
            p.radius,
            this.player.x,
            this.player.y,
            this.player.radius
          )
        ) {
          if (this.player.takeDamage(p.damage)) {
            audioSynth.playHit();
            this.camera.addTrauma(0.12);
            this.hitstopTimer = 0.015;
            this.particles.burst(this.player.x, this.player.y, 14, '#ef4444', 160, 3);
            this.particles.floatingText(this.player.x, this.player.y, `-${p.damage} HP`, '#ef4444');
          }
          this.projectiles.splice(i, 1);
          continue;
        }
      }
    }

    // 8. Update Enemies & Spawner
    this.enemyManager.update(
      dt,
      this.player.x,
      this.player.y,
      this.baseManager.core.x,
      this.baseManager.core.y,
      this.worldWidth,
      this.worldHeight,
      () => audioSynth.playTelegraphWarning(),
      (enProj) => this.projectiles.push(enProj)
    );

    // Enemy collision with Player (contact damage)
    for (const enemy of this.enemyManager.enemies) {
      if (
        Physics.checkCircleCollision(
          this.player.x,
          this.player.y,
          this.player.radius,
          enemy.x,
          enemy.y,
          enemy.radius
        )
      ) {
        if (this.player.takeDamage(enemy.contactDamage)) {
          audioSynth.playHit();
          this.camera.addTrauma(0.14);
          this.hitstopTimer = 0.015;
          this.particles.burst(this.player.x, this.player.y, 16, '#ef4444', 160, 3);
          this.particles.floatingText(
            this.player.x,
            this.player.y,
            `-${enemy.contactDamage} HP`,
            '#ef4444'
          );
        }
      }

      // Enemy collision with Control Unit (UC)
      if (
        Physics.checkCircleCollision(
          this.baseManager.core.x,
          this.baseManager.core.y,
          this.baseManager.core.radius,
          enemy.x,
          enemy.y,
          enemy.radius
        )
      ) {
        const destroyed = this.baseManager.damageCore(enemy.contactDamage * dt * 2.5);
        if (destroyed) {
          this.triggerGameOver('A Base Central (Unidade de Controle) foi destruída pelos inimigos.');
          return;
        }
      }
    }

    // 9. Control Unit Hardware Interrupt (IRQ) Pulse
    this.baseManager.update(dt, (px, py, pulseRadius) => {
      audioSynth.playCorePulse();
      this.particles.shockwave(px, py, '#fbbf24', pulseRadius);
      this.particles.floatingText(px, py - 55, 'PULSO DE DEFESA (IRQ)!', '#fbbf24');
      this.camera.addTrauma(0.15);

      // Damage and push back all enemies within IRQ pulse
      for (const enemy of this.enemyManager.enemies) {
        const dist = Math.hypot(enemy.x - px, enemy.y - py);
        if (dist <= pulseRadius) {
          const res = this.enemyManager.damageEnemy(enemy.id, 65);
          // Push away
          const angle = Math.atan2(enemy.y - py, enemy.x - px);
          enemy.vx += Math.cos(angle) * 350;
          enemy.vy += Math.sin(angle) * 350;

          if (res && res.defeated) {
            this.score += res.score;
            this.totalEnemiesDefeated++;
          }
        }
      }
    });

    // 10. Check Next Benchmark Wave
    if (
      this.enemyManager.waveTimer <= 0 &&
      this.enemyManager.enemiesRemainingToSpawn <= 0 &&
      this.enemyManager.enemies.length === 0
    ) {
      // Wave Cleared!
      const nextWave = this.enemyManager.wave + 1;
      this.score += 500 * this.enemyManager.wave;
      audioSynth.playUpgrade();
      this.particles.floatingText(
        this.player.x,
        this.player.y - 40,
        `ONDA ${this.enemyManager.wave} CONCLUÍDA!`,
        '#10b981'
      );

      if (nextWave > 6) {
        // Victory!
        this.setState('VICTORY');
        SaveSystem.save({
          highScore: this.score,
          highestWave: 6,
          totalMineralsMined: this.totalMineralsMined,
          totalEnemiesDefeated: this.totalEnemiesDefeated,
          bestSurvivalSeconds: Math.floor(this.timeSurvived),
        });
        return;
      } else {
        this.enemyManager.startWave(nextWave);
      }
    }

    // 11. Check Player Death
    if (this.player.stats.hp <= 0) {
      this.triggerGameOver('A vida da sua nave (ULA) chegou a zero.');
      return;
    }

    // 12. Update Resource Manager, Particles, and Camera
    this.resourceManager.update(dt);
    this.particles.update(dt);
    this.camera.update(this.player.x, this.player.y, dt);
  }

  public purchaseUpgrade(upgradeId: string): boolean {
    const upgrade = this.upgrades.find((u) => u.id === upgradeId);
    if (!upgrade || upgrade.level >= upgrade.maxLevel) return false;

    // Verify inventory cost
    if (
      this.player.inventory.aether < upgrade.cost.aether ||
      this.player.inventory.titanium < upgrade.cost.titanium ||
      this.player.inventory.plasma < upgrade.cost.plasma
    ) {
      return false;
    }

    // Deduct resources
    this.player.inventory.aether -= upgrade.cost.aether;
    this.player.inventory.titanium -= upgrade.cost.titanium;
    this.player.inventory.plasma -= upgrade.cost.plasma;

    upgrade.level++;

    // Scale cost for next tier
    upgrade.cost.aether = Math.round(upgrade.cost.aether * 1.5);
    upgrade.cost.titanium = Math.round(upgrade.cost.titanium * 1.5);
    if (upgrade.cost.plasma > 0) {
      upgrade.cost.plasma = Math.round(upgrade.cost.plasma * 1.6);
    }

    // Apply stat bonus
    if (upgrade.id === 'MINING_DRILL') {
      this.player.stats.miningPower *= 1.4;
    } else if (upgrade.id === 'PLASMA_CANNON') {
      this.player.stats.blasterDamage *= 1.3;
    } else if (upgrade.id === 'RAPID_DISCHARGE') {
      this.player.stats.blasterFireRate *= 1.25;
    } else if (upgrade.id === 'TITANIUM_PLATING') {
      this.player.stats.maxHp += 35;
      this.player.heal(35);
    } else if (upgrade.id === 'THRUSTER_INJECTOR') {
      this.player.stats.moveSpeed *= 1.18;
    } else if (upgrade.id === 'OUTPOST_REACTOR') {
      this.baseManager.upgrade();
    } else if (upgrade.id === 'REPAIR_CORE') {
      this.baseManager.repair(180);
    }

    audioSynth.playUpgrade();
    this.particles.burst(this.player.x, this.player.y, 25, '#fbbf24', 160, 3);
    this.broadcastTelemetry();
    return true;
  }

  private triggerGameOver(reason: string): void {
    this.gameOverReason = reason;
    audioSynth.setMiningSound(false);
    audioSynth.playExplosion();
    this.camera.addTrauma(0.8);
    this.particles.shockwave(this.player.x, this.player.y, '#ef4444', 120);

    SaveSystem.save({
      highScore: this.score,
      highestWave: this.enemyManager.wave,
      totalMineralsMined: this.totalMineralsMined,
      totalEnemiesDefeated: this.totalEnemiesDefeated,
      bestSurvivalSeconds: Math.floor(this.timeSurvived),
    });

    this.setState('GAME_OVER');
  }

  private broadcastTelemetry(): void {
    if (!this.onTelemetryUpdate) return;
    this.onTelemetryUpdate({
      state: this.state,
      hp: Math.round(this.player.stats.hp),
      maxHp: this.player.stats.maxHp,
      energy: Math.round(this.player.stats.energy),
      maxEnergy: this.player.stats.maxEnergy,
      coreHp: Math.round(this.baseManager.core.hp),
      coreMaxHp: this.baseManager.core.maxHp,
      coreLevel: this.baseManager.core.level,
      inventory: { ...this.player.inventory },
      wave: this.enemyManager.wave,
      waveTimer: Math.ceil(this.enemyManager.waveTimer),
      waveDuration: this.enemyManager.waveDuration,
      activeEnemies: this.enemyManager.enemies.length,
      score: this.score,
      timeSurvived: Math.floor(this.timeSurvived),
      isNearCore: this.baseManager.isNearTerminal(this.player.x, this.player.y),
      dashReady: this.player.dashTimer <= 0 && this.player.stats.energy >= 20,
      dashCooldownProgress: Math.max(0, this.player.dashTimer / this.player.stats.dashCooldownTime),
      soundMuted: audioSynth.getIsMuted(),
    });
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.input.destroy();
    audioSynth.setMiningSound(false);
  }
}
