/**
 * Upgrade Definitions & Microarchitecture Economics
 * Inspirado nos elementos da disciplina de Arquitetura de Computadores (Von Neumann)
 */

import { UpgradeDefinition } from '../types.ts';

export const INITIAL_UPGRADES: UpgradeDefinition[] = [
  {
    id: 'MINING_DRILL',
    name: 'Barramento de Dados 64-Bit',
    category: 'BARRAMENTO',
    description: 'Coleta recursos 40% mais rápido (aumenta a largura de banda do Ciclo de Busca).',
    level: 1,
    maxLevel: 5,
    cost: { aether: 25, titanium: 15, plasma: 0 },
  },
  {
    id: 'PLASMA_CANNON',
    name: 'ULA Superescalar (ALU)',
    category: 'EXECUÇÃO',
    description: 'Aumenta o dano dos tiros em +30% (unidades funcionais paralelas na ULA).',
    level: 1,
    maxLevel: 5,
    cost: { aether: 30, titanium: 20, plasma: 5 },
  },
  {
    id: 'RAPID_DISCHARGE',
    name: 'Multiplicador de Clock (Overclock)',
    category: 'EXECUÇÃO',
    description: 'Atira 25% mais rápido (eleva a frequência de operação da ULA).',
    level: 1,
    maxLevel: 5,
    cost: { aether: 20, titanium: 25, plasma: 5 },
  },
  {
    id: 'TITANIUM_PLATING',
    name: 'Registradores & Memória Cache L1',
    category: 'MEMÓRIA',
    description: 'Aumenta a Vida máxima da sua nave em +35 HP e recupera 35 HP na hora.',
    level: 1,
    maxLevel: 5,
    cost: { aether: 15, titanium: 35, plasma: 0 },
  },
  {
    id: 'THRUSTER_INJECTOR',
    name: 'Predição de Desvio (Branch Predictor)',
    category: 'PIPELINE',
    description: 'Aumenta a velocidade de movimento em +18% (antecipa desvios nas trilhas).',
    level: 1,
    maxLevel: 4,
    cost: { aether: 30, titanium: 15, plasma: 5 },
  },
  {
    id: 'OUTPOST_REACTOR',
    name: 'Expansão da Unidade de Controle (Base)',
    category: 'NÚCLEO CPU',
    description: 'Aumenta a Vida da Base (+150 HP), amplia o escudo e acelera o pulso de defesa (IRQ).',
    level: 1,
    maxLevel: 4,
    cost: { aether: 45, titanium: 45, plasma: 12 },
  },
  {
    id: 'REPAIR_CORE',
    name: 'Correção de Erros (Reparo ECC)',
    category: 'NÚCLEO CPU',
    description: 'Conserta a Base Central imediatamente, recuperando 180 HP da Unidade de Controle.',
    level: 1,
    maxLevel: 99,
    cost: { aether: 15, titanium: 25, plasma: 0 },
  },
];
