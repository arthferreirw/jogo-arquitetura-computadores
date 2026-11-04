/**
 * Canvas 2D Game Renderer — Edição Arquitetura de Computadores (Von Neumann & PCB)
 * Renderiza substrato de Placa de Circuito Impresso (PCB Verde/Dourado), trilhas em 45°,
 * Unidade de Controle QFP com pinos dourados, ULA (ALU) trapezoidal em V,
 * Osciladores de Clock, Chips Cache SRAM, ROMs de Opcodes e Anomalias de Pipeline.
 */

import { Camera } from '../engine/Camera.ts';
import { ParticleSystem } from '../engine/ParticleSystem.ts';
import { Player } from '../entities/Player.ts';
import { BaseCoreManager } from '../entities/BaseCore.ts';
import { ResourceManager } from '../entities/ResourceNode.ts';
import { EnemyManager } from '../entities/Enemy.ts';
import { Projectile } from '../types.ts';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private particleSystem: ParticleSystem;

  constructor(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    particleSystem: ParticleSystem
  ) {
    this.ctx = ctx;
    this.camera = camera;
    this.particleSystem = particleSystem;
  }

  public render(
    player: Player,
    baseManager: BaseCoreManager,
    resourceManager: ResourceManager,
    enemyManager: EnemyManager,
    projectiles: Projectile[],
    time: number
  ): void {
    const ctx = this.ctx;
    const w = this.camera.viewportWidth;
    const h = this.camera.viewportHeight;

    // 0. Substrato de Fibra de Vidro PCB Verde Escuro
    ctx.fillStyle = '#041b11';
    ctx.fillRect(0, 0, w, h);

    // Salva transformação da câmera
    ctx.save();
    const originX = this.camera.x - w / 2 + this.camera.shakeOffsetX;
    const originY = this.camera.y - h / 2 + this.camera.shakeOffsetY;
    ctx.translate(-originX, -originY);

    // 1. Grade PCB, Trilhas de Cobre em 45° e Vias Douradas
    this.renderPCBSubstrate(originX, originY, w, h, baseManager.core.x, baseManager.core.y, time);

    // 2. Limite Físico do Die de Silício (Borda do Chip)
    this.renderChipBounds();

    // 3. Unidade de Controle (UC) + Barramento Local (Antigo Base Core)
    this.renderControlUnit(baseManager, time);

    // 4. Nós de Recursos (Osciladores de Clock, Chips SRAM e Opcodes ROM)
    this.renderArchitectureNodes(resourceManager, time);

    // 5. Telegraphs de Exceções de Hardware (Deadlock & Page Fault)
    this.renderEnemyTelegraphs(enemyManager);

    // 6. Pulsos Lógicos e Projéteis
    this.renderProjectiles(projectiles);

    // 7. Ameaças (Pipeline Hazards, Deadlocks, Page Faults)
    this.renderEnemies(enemyManager, time);

    // 8. Jogador: Unidade Lógica e Aritmética (ULA / ALU) & Barramento de Leitura
    this.renderPlayerALU(player, resourceManager, time);

    // 9. Partículas e Indicadores Flutuantes
    this.particleSystem.render(ctx, { x: 0, y: 0 });

    ctx.restore();

    // 10. Vinheta de Osciloscópio / Analisador Lógico
    this.renderVignette(w, h);

    // 11. Mapa de Endereçamento de Memória (Radar PCB)
    this.renderMemoryMapRadar(player, baseManager, enemyManager, resourceManager, w, h);
  }

  /**
   * Renderiza a placa de circuito impresso (PCB), trilhas ortogonais/45°,
   * barramentos principais (Data, Address, Control Bus) e vias metalizadas douradas.
   */
  private renderPCBSubstrate(
    viewX: number,
    viewY: number,
    w: number,
    h: number,
    coreX: number,
    coreY: number,
    time: number
  ): void {
    const ctx = this.ctx;
    const gridSize = 100;
    const startX = Math.floor(viewX / gridSize) * gridSize;
    const startY = Math.floor(viewY / gridSize) * gridSize;
    const endX = viewX + w + gridSize;
    const endY = viewY + h + gridSize;

    // Grade base fina de roteamento PCB
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // Trilhas de circuito impresso determinísticas com curvas de 45° e vias douradas
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.24)';
    ctx.lineWidth = 2.5;
    for (let x = startX; x <= endX; x += gridSize * 2) {
      for (let y = startY; y <= endY; y += gridSize * 2) {
        const hash = Math.abs(Math.sin(x * 12.9898 + y * 78.233));
        ctx.beginPath();
        if (hash > 0.5) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + 40, y);
          ctx.lineTo(x + 70, y + 30);
          ctx.lineTo(x + 120, y + 30);
        } else {
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 40);
          ctx.lineTo(x + 35, y + 75);
          ctx.lineTo(x + 35, y + 130);
        }
        ctx.stroke();

        // Via metalizada (Pad dourado com furo escuro)
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#041b11';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Barramentos Principais Von Neumann irradiando da Unidade de Controle (Data / Address / Control Bus)
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.22)';
    ctx.lineWidth = 2;
    const busLines = [-18, -6, 6, 18];
    for (const offset of busLines) {
      // Barramento Horizontal (Data Bus)
      ctx.beginPath();
      ctx.moveTo(0, coreY + offset);
      ctx.lineTo(this.camera.worldWidth, coreY + offset);
      ctx.stroke();

      // Barramento Vertical (Address & Control Bus)
      ctx.beginPath();
      ctx.moveTo(coreX + offset, 0);
      ctx.lineTo(coreX + offset, this.camera.worldHeight);
      ctx.stroke();
    }

    // Pulsos de sinal trafegando pelos barramentos
    const signalOffset = (time * 260) % 400;
    ctx.fillStyle = 'rgba(251, 191, 36, 0.55)';
    for (let d = 200; d < 1500; d += 400) {
      const pos = d + signalOffset;
      ctx.fillRect(coreX + pos, coreY - 20, 14, 4);
      ctx.fillRect(coreX - pos, coreY + 16, 14, 4);
      ctx.fillRect(coreX - 20, coreY + pos, 4, 14);
      ctx.fillRect(coreX + 16, coreY - pos, 4, 14);
    }
    ctx.restore();
  }

  /**
   * Borda física do Die do Processador (Trilha de Alimentação VDD/GND)
   */
  private renderChipBounds(): void {
    const ctx = this.ctx;
    const ww = this.camera.worldWidth;
    const wh = this.camera.worldHeight;

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, ww - 12, wh - 12);

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.lineWidth = 16;
    ctx.strokeRect(14, 14, ww - 28, wh - 28);
  }

  /**
   * Unidade de Controle (UC) + Banco de Registradores (Encapsulamento QFP com Pinos Dourados)
   */
  private renderControlUnit(baseManager: BaseCoreManager, time: number): void {
    const ctx = this.ctx;
    const core = baseManager.core;

    // 1. Campo do Barramento Local de Alta Velocidade (Sanctuary Dome)
    ctx.save();
    const pulseFactor = Math.sin(time * 2.5) * 0.03 + 1;
    const shieldRad = core.shieldRadius * pulseFactor;

    const shieldGrad = ctx.createRadialGradient(
      core.x,
      core.y,
      core.radius,
      core.x,
      core.y,
      shieldRad
    );
    shieldGrad.addColorStop(0, 'rgba(16, 185, 129, 0.10)');
    shieldGrad.addColorStop(0.85, 'rgba(245, 158, 11, 0.05)');
    shieldGrad.addColorStop(1, 'rgba(16, 185, 129, 0.28)');

    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.arc(core.x, core.y, shieldRad, 0, Math.PI * 2);
    ctx.fill();

    // Contorno técnico serigrafado do Barramento Local
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.arc(core.x, core.y, shieldRad, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 2. Chip Central QFP (Unidade de Controle)
    ctx.save();
    const halfSize = core.radius * 0.95;

    // Pinos metálicos dourados nos 4 lados do pacote QFP
    ctx.fillStyle = '#fbbf24';
    const pinCount = 7;
    const pinSpan = halfSize * 1.5;
    for (let i = 0; i < pinCount; i++) {
      const offset = -pinSpan / 2 + (i / (pinCount - 1)) * pinSpan;
      // Pinos Superiores e Inferiores
      ctx.fillRect(core.x + offset - 2.5, core.y - halfSize - 9, 5, 9);
      ctx.fillRect(core.x + offset - 2.5, core.y + halfSize, 5, 9);
      // Pinos Esquerdos e Direitos
      ctx.fillRect(core.x - halfSize - 9, core.y + offset - 2.5, 9, 5);
      ctx.fillRect(core.x + halfSize, core.y + offset - 2.5, 9, 5);
    }

    // Corpo de epóxi escuro do processador central
    ctx.fillStyle = '#091912';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(
      core.x - halfSize,
      core.y - halfSize,
      halfSize * 2,
      halfSize * 2,
      6
    );
    ctx.fill();
    ctx.stroke();

    // Marcação de pino 1 (círculo dourado no canto superior esquerdo do chip)
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(core.x - halfSize + 10, core.y - halfSize + 10, 3, 0, Math.PI * 2);
    ctx.fill();

    // Die interno de silício (Núcleo de Execução & Registradores)
    const dieSize = halfSize * 0.58;
    ctx.fillStyle = '#064e3b';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(core.x - dieSize, core.y - dieSize, dieSize * 2, dieSize * 2);
    ctx.fillRect(core.x - dieSize, core.y - dieSize, dieSize * 2, dieSize * 2);

    // Brilho pulsante do Clock mestre dentro da UC
    const orbGlow = ctx.createRadialGradient(
      core.x,
      core.y,
      0,
      core.x,
      core.y,
      dieSize
    );
    orbGlow.addColorStop(0, '#fef3c7');
    orbGlow.addColorStop(0.5, '#10b981');
    orbGlow.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = orbGlow;
    ctx.beginPath();
    ctx.arc(core.x, core.y, dieSize * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Serigrafia no topo do chip
    ctx.fillStyle = '#ecfdf5';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('UC // REG', core.x, core.y + 3);

    // Barra de Integridade acima da Unidade de Controle
    const barWidth = 104;
    const barHeight = 8;
    const bx = core.x - barWidth / 2;
    const by = core.y - core.radius - 28;

    ctx.fillStyle = 'rgba(4, 27, 17, 0.9)';
    ctx.fillRect(bx, by, barWidth, barHeight);

    const hpPercent = Math.max(0, core.hp / core.maxHp);
    ctx.fillStyle = hpPercent > 0.3 ? '#10b981' : '#ef4444';
    ctx.fillRect(bx, by, barWidth * hpPercent, barHeight);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, barWidth, barHeight);

    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`UNIDADE DE CONTROLE v${core.level}.0`, core.x, by - 6);

    ctx.restore();
  }

  /**
   * Renderiza os 3 recursos de Arquitetura de Computadores:
   * - aether -> Ciclos de Clock (Cristal Oscilador Dourado com onda quadrada)
   * - titanium -> Cache SRAM (Chip DIP Prateado com pinos)
   * - plasma -> Instruções / Opcodes (Módulo Hexagonal ROM Verde/Âmbar)
   */
  private renderArchitectureNodes(
    resourceManager: ResourceManager,
    time: number
  ): void {
    const ctx = this.ctx;

    for (const node of resourceManager.nodes) {
      if (node.respawnTime > 0) {
        // Soquete vazio aguardando novo ciclo de busca
        ctx.save();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(
          node.x - node.radius * 0.7,
          node.y - node.radius * 0.7,
          node.radius * 1.4,
          node.radius * 1.4
        );
        ctx.restore();
        continue;
      }

      ctx.save();
      const floatOffset = Math.sin(time * 3 + node.x * 0.05) * 1.8;
      const ny = node.y + floatOffset;

      if (node.type === 'aether') {
        // 1. CICLOS DE CLOCK (Oscilador de Quartzo Dourado)
        const r = node.radius;
        // Pinos inferiores de solda
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(node.x - 7, ny + r * 0.6);
        ctx.lineTo(node.x - 7, ny + r + 5);
        ctx.moveTo(node.x + 7, ny + r * 0.6);
        ctx.lineTo(node.x + 7, ny + r + 5);
        ctx.stroke();

        // Cápsula metálica dourada do cristal
        ctx.fillStyle = node.fillColor;
        ctx.strokeStyle = node.glowColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(node.x - r * 0.85, ny - r * 0.65, r * 1.7, r * 1.3, 6);
        ctx.fill();
        ctx.stroke();

        // Símbolo de Onda Quadrada de Clock (_|¯|_)
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(node.x - 10, ny + 3);
        ctx.lineTo(node.x - 5, ny + 3);
        ctx.lineTo(node.x - 5, ny - 4);
        ctx.lineTo(node.x + 2, ny - 4);
        ctx.lineTo(node.x + 2, ny + 3);
        ctx.lineTo(node.x + 7, ny + 3);
        ctx.lineTo(node.x + 7, ny - 4);
        ctx.lineTo(node.x + 11, ny - 4);
        ctx.stroke();
      } else if (node.type === 'titanium') {
        // 2. CACHE SRAM (Circuito Integrado DIP de Silício/Prata)
        const r = node.radius;
        const w = r * 1.5;
        const h = r * 1.15;

        // Pinos DIP laterais
        ctx.fillStyle = '#cbd5e1';
        for (let p = -1; p <= 1; p++) {
          ctx.fillRect(node.x - w / 2 - 5, ny + p * 7 - 1.5, 5, 3);
          ctx.fillRect(node.x + w / 2, ny + p * 7 - 1.5, 5, 3);
        }

        // Corpo do CI SRAM
        ctx.fillStyle = node.fillColor;
        ctx.strokeStyle = node.glowColor;
        ctx.lineWidth = 2;
        ctx.fillRect(node.x - w / 2, ny - h / 2, w, h);
        ctx.strokeRect(node.x - w / 2, ny - h / 2, w, h);

        // Rótulo SRAM
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SRAM', node.x, ny + 3);
      } else {
        // 3. INSTRUÇÕES / OPCODES (Bloco ROM Hexagonal Verde-Fósforo & Ouro)
        ctx.fillStyle = node.fillColor;
        ctx.strokeStyle = node.glowColor;
        ctx.lineWidth = 2.2;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const hx = node.x + Math.cos(a) * node.radius;
          const hy = ny + Math.sin(a) * node.radius;
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Anel dourado interno e mnemônico de Opcode
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(node.x, ny, node.radius * 0.62, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#d1fae5';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OPCODE', node.x, ny + 3);
      }

      // Barra de progresso de leitura se parcialmente extraído
      if (node.hp < node.maxHp) {
        const barW = node.radius * 2;
        const bx = node.x - node.radius;
        const by = ny - node.radius - 9;
        ctx.fillStyle = 'rgba(4, 27, 17, 0.85)';
        ctx.fillRect(bx, by, barW, 4);
        ctx.fillStyle = node.glowColor;
        ctx.fillRect(bx, by, barW * (node.hp / node.maxHp), 4);
      }

      ctx.restore();
    }
  }

  /**
   * Telegraphs de Ataque das Ameaças (Deadlock Bus Lock & Page Fault Pointer)
   */
  private renderEnemyTelegraphs(enemyManager: EnemyManager): void {
    const ctx = this.ctx;

    for (const e of enemyManager.enemies) {
      if (!e.isTelegraphing || e.telegraphTargetAngle === undefined) continue;

      ctx.save();
      const progress = 1 - e.telegraphTimer / e.telegraphDuration;

      if (e.type === 'WARDEN') {
        // Deadlock Charge Telegraph: Trilha de bloqueio de barramento
        const angle = e.telegraphTargetAngle;
        const length = 280;
        const width = 36;

        ctx.translate(e.x, e.y);
        ctx.rotate(angle);

        ctx.fillStyle = `rgba(245, 158, 11, ${0.15 + progress * 0.25})`;
        ctx.fillRect(0, -width / 2, length, width);

        ctx.strokeStyle = `rgba(245, 158, 11, ${0.45 + progress * 0.55})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(0, -width / 2, length, width);

        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(0, -2, length * progress, 4);

        ctx.restore();
      } else if (e.type === 'SENTINEL') {
        // Page Fault Sniper Aim: Ponteiro de endereço inválido (0xERR)
        const angle = e.telegraphTargetAngle;
        const length = 460;
        const endX = e.x + Math.cos(angle) * length;
        const endY = e.y + Math.sin(angle) * length;

        ctx.strokeStyle = `rgba(244, 63, 94, ${0.35 + progress * 0.65})`;
        ctx.lineWidth = 1.5 + progress * 2;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(endX, endY, 8 * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }
    }
  }

  /**
   * Renderiza pulsos lógicos (projéteis da ULA e exceções inimigas)
   */
  private renderProjectiles(projectiles: Projectile[]): void {
    const ctx = this.ctx;

    for (const p of projectiles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      const speed = Math.hypot(p.vx, p.vy);
      if (speed > 0) {
        const nx = p.vx / speed;
        const ny = p.vy / speed;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.radius * 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - nx * 14, p.y - ny * 14);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  /**
   * Renderiza as Anomalias de Hardware / Baixo Nível:
   * - SWARMER -> Pipeline Hazard (Glitch triangular rápido)
   * - WARDEN -> Deadlock (Bloqueador octogonal pesado)
   * - SENTINEL -> Page Fault (Exceção de memória em losango)
   */
  private renderEnemies(enemyManager: EnemyManager, time: number): void {
    const ctx = this.ctx;

    for (const e of enemyManager.enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);

      if (e.type === 'SWARMER') {
        // Pipeline Hazard
        const angle = Math.atan2(e.vy, e.vx);
        ctx.rotate(angle);

        ctx.fillStyle = '#991b1b';
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        ctx.moveTo(e.radius * 1.25, 0);
        ctx.lineTo(-e.radius, -e.radius * 0.85);
        ctx.lineTo(-e.radius * 0.45, 0);
        ctx.lineTo(-e.radius, e.radius * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fef2f2';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'WARDEN') {
        // Deadlock (Octógono de Travamento Mútuo)
        ctx.rotate(time * 1.1);
        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;

        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          const hx = Math.cos(a) * e.radius;
          const hy = Math.sin(a) * e.radius;
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Núcleo de travamento
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(-e.radius * 0.35, -e.radius * 0.35, e.radius * 0.7, e.radius * 0.7);
      } else {
        // Page Fault / Stack Overflow (Losango de Exceção)
        ctx.rotate(time * 0.9);
        ctx.fillStyle = '#881337';
        ctx.strokeStyle = '#fb7185';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(0, -e.radius);
        ctx.lineTo(e.radius, 0);
        ctx.lineTo(0, e.radius);
        ctx.lineTo(-e.radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffe4e6';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Barra de integridade da anomalia
      const barW = e.radius * 2;
      const bx = e.x - e.radius;
      const by = e.y - e.radius - 8;
      ctx.fillStyle = 'rgba(4, 27, 17, 0.8)';
      ctx.fillRect(bx, by, barW, 3);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bx, by, barW * (e.hp / e.maxHp), 3);
    }
  }

  /**
   * Renderiza o Jogador como o símbolo clássico da ULA (Unidade Lógica e Aritmética / ALU)
   * com chanfro em "V" e feixe de Barramento de Dados (Data Bus Fetch).
   */
  private renderPlayerALU(
    player: Player,
    resourceManager: ResourceManager,
    time: number
  ): void {
    const ctx = this.ctx;

    // 1. Feixe de Leitura de Barramento (Data Bus Fetch) conectado ao nó alvo
    if (player.isMining && player.miningTargetId) {
      const targetNode = resourceManager.nodes.find((n) => n.id === player.miningTargetId);
      const targetPos = targetNode
        ? { x: targetNode.x, y: targetNode.y }
        : {
            x: player.x + Math.cos(player.angle) * 160,
            y: player.y + Math.sin(player.angle) * 160,
          };

      ctx.save();
      // Barramento paralelo de leitura (linhas tracejadas de bits trafegando)
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(targetPos.x, targetPos.y);
      ctx.stroke();

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = -time * 120;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(targetPos.x, targetPos.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 2. Corpo da ULA (Símbolo Trapezoidal Chanfrado em V da Arquitetura de Computadores)
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    if (player.invulnTimer > 0 && Math.floor(time * 30) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Pulso de Clock / Propulsão Traseira nas entradas da ULA
    const speed = Math.hypot(player.vx, player.vy);
    if (speed > 10 || player.isDashing) {
      const flameLength = player.isDashing ? 34 : 13 + Math.random() * 7;
      ctx.fillStyle = player.isDashing ? '#fbbf24' : '#10b981';
      ctx.beginPath();
      ctx.moveTo(-player.radius * 0.75, -8);
      ctx.lineTo(-player.radius * 0.75 - flameLength, 0);
      ctx.lineTo(-player.radius * 0.75, 8);
      ctx.closePath();
      ctx.fill();
    }

    const r = player.radius;
    // Geometria em "V" da ULA (ALU) apontando para a direita (direção do ângulo)
    ctx.fillStyle = '#062c1e';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.2;

    ctx.beginPath();
    // Topo frontal (Saída da ULA)
    ctx.moveTo(r * 1.25, -r * 0.48);
    ctx.lineTo(r * 1.25, r * 0.48);
    // Aba inferior traseira (Entrada B)
    ctx.lineTo(-r * 0.85, r * 1.05);
    ctx.lineTo(-r * 0.85, r * 0.35);
    // Entalhe em "V" central característico da ULA
    ctx.lineTo(-r * 0.35, 0);
    // Aba superior traseira (Entrada A)
    ctx.lineTo(-r * 0.85, -r * 0.35);
    ctx.lineTo(-r * 0.85, -r * 1.05);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Circuito interno verde-fósforo da ULA
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(r * 0.35, 0, 4.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Vinheta atmosférica escura nas bordas do visor
   */
  private renderVignette(w: number, h: number): void {
    const ctx = this.ctx;
    const maxRadius = Math.hypot(w, h) / 2;
    const vig = ctx.createRadialGradient(
      w / 2,
      h / 2,
      maxRadius * 0.55,
      w / 2,
      h / 2,
      maxRadius
    );
    vig.addColorStop(0, 'rgba(4, 27, 17, 0)');
    vig.addColorStop(1, 'rgba(2, 14, 9, 0.82)');

    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }

  /**
   * Mapa de Endereçamento de Memória (Radar PCB no canto inferior direito)
   */
  private renderMemoryMapRadar(
    player: Player,
    baseManager: BaseCoreManager,
    enemyManager: EnemyManager,
    resourceManager: ResourceManager,
    viewportW: number,
    viewportH: number
  ): void {
    const ctx = this.ctx;
    const size = 114;
    const padding = 16;
    const rx = viewportW - size - padding;
    const ry = viewportH - size - padding;

    ctx.save();
    ctx.fillStyle = 'rgba(4, 27, 17, 0.9)';
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(rx + size / 2, ry + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Anel interno de endereçamento
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.beginPath();
    ctx.arc(rx + size / 2, ry + size / 2, size / 4, 0, Math.PI * 2);
    ctx.stroke();

    const worldW = this.camera.worldWidth;
    const worldH = this.camera.worldHeight;
    const toRadar = (wx: number, wy: number) => ({
      x: rx + (wx / worldW) * size,
      y: ry + (wy / worldH) * size,
    });

    // Unidade de Controle Central (Quadrado Dourado)
    const baseR = toRadar(baseManager.core.x, baseManager.core.y);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(baseR.x - 3.5, baseR.y - 3.5, 7, 7);

    // Nós de Recursos (Clock, SRAM, Opcodes)
    for (const node of resourceManager.nodes) {
      if (node.respawnTime > 0) continue;
      const nr = toRadar(node.x, node.y);
      ctx.fillStyle = node.glowColor;
      ctx.fillRect(nr.x - 1, nr.y - 1, 2, 2);
    }

    // Anomalias / Bugs (Pontos Vermelhos)
    ctx.fillStyle = '#ef4444';
    for (const e of enemyManager.enemies) {
      const er = toRadar(e.x, e.y);
      ctx.fillRect(er.x - 1.5, er.y - 1.5, 3, 3);
    }

    // Jogador ULA (Ponto Verde Brilhante)
    const pr = toRadar(player.x, player.y);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(pr.x, pr.y, 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
