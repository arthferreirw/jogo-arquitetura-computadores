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
    description: 'Amplia a largura de banda de leitura (Ciclo de Busca / Fetch) em +40%.',
    level: 1,
    maxLevel: 5,
    cost: { aether: 25, titanium: 15, plasma: 0 },
  },
  {
    id: 'PLASMA_CANNON',
    name: 'ULA Superescalar (ALU)',
    category: 'EXECUÇÃO',
    description: 'Adiciona unidades funcionais paralelas, elevando o poder lógico de disparo em +30%.',
    level: 1,
    maxLevel: 5,
    cost: { aether: 30, titanium: 20, plasma: 5 },
  },
  {
    id: 'RAPID_DISCHARGE',
    name: 'Multiplicador de Clock (Overclock PLL)',
    category: 'EXECUÇÃO',
    description: 'Eleva a frequência de operação da ULA, acelerando a cadência de instruções em +25%.',
    level: 1,
    maxLevel: 5,
    cost: { aether: 20, titanium: 25, plasma: 5 },
  },
  {
    id: 'TITANIUM_PLATING',
    name: 'Registradores & Memória Cache L1',
    category: 'MEMÓRIA',
    description: 'Expande a tolerância de tensão da ULA (+35 VDD Max) e restaura integridade imediata.',
    level: 1,
    maxLevel: 5,
    cost: { aether: 15, titanium: 35, plasma: 0 },
  },
  {
    id: 'THRUSTER_INJECTOR',
    name: 'Predição de Desvio (Branch Predictor)',
    category: 'PIPELINE',
    description: 'Antecipa saltos condicionais nas trilhas PCB, aumentando a velocidade de tráfego em +18%.',
    level: 1,
    maxLevel: 4,
    cost: { aether: 30, titanium: 15, plasma: 5 },
  },
  {
    id: 'OUTPOST_REACTOR',
    name: 'Expansão da Unidade de Controle (UC)',
    category: 'NÚCLEO CPU',
    description: 'Reforça a UC (+150 HP), amplia o Barramento Local e acelera o pulso de Interrupção (IRQ).',
    level: 1,
    maxLevel: 4,
    cost: { aether: 45, titanium: 45, plasma: 12 },
  },
  {
    id: 'REPAIR_CORE',
    name: 'Rotina de Correção de Erros (ECC)',
    category: 'NÚCLEO CPU',
    description: 'Executa verificação de bits de paridade Hamming para restaurar 180 HP da Unidade de Controle.',
    level: 1,
    maxLevel: 99,
    cost: { aether: 15, titanium: 25, plasma: 0 },
  },
];
