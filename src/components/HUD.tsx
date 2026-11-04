/**
 * Low-Occlusion Perimeter HUD — Edição Arquitetura de Computadores (PCB)
 * Leituras tabulares de Tensão VDD, Buffer de Clock, Recursos (Clock, SRAM, Opcodes)
 * e integridade da Unidade de Controle (UC).
 */

import React from 'react';
import { GameTelemetrySnapshot } from '../game/types.ts';
import { Volume2, VolumeX, Cpu, Zap, Terminal } from 'lucide-react';

interface HUDProps {
  telemetry: GameTelemetrySnapshot | null;
  onOpenUpgrades: () => void;
  onToggleMute: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  telemetry,
  onOpenUpgrades,
  onToggleMute,
  onPause,
}) => {
  if (!telemetry || telemetry.state !== 'PLAYING') return null;

  const hpPercent = Math.max(0, Math.min(100, (telemetry.hp / telemetry.maxHp) * 100));
  const energyPercent = Math.max(0, Math.min(100, (telemetry.energy / telemetry.maxEnergy) * 100));
  const corePercent = Math.max(0, Math.min(100, (telemetry.coreHp / telemetry.coreMaxHp) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar Perimeter Cluster */}
      <div className="flex items-start justify-between w-full gap-4">
        {/* Left: ULA Voltage (VDD) & Clock Buffer */}
        <div className="flex flex-col gap-2 min-w-[215px]">
          {/* ULA Voltage Bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-1 text-emerald-100">
              <span className="flex items-center gap-1.5 font-bold tracking-wider text-emerald-400">
                <Cpu className="w-3.5 h-3.5" />
                TENSÃO ULA (VDD)
              </span>
              <span className="tabular-nums font-semibold">
                {telemetry.hp} / {telemetry.maxHp} mV
              </span>
            </div>
            <div className="h-2 w-52 bg-[#03120b]/90 border border-emerald-800/80 rounded-sm overflow-hidden p-0.5">
              <div
                className={`h-full transition-all duration-150 ${
                  hpPercent > 35 ? 'bg-emerald-400' : 'bg-red-500 animate-pulse'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Clock Energy Buffer Bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-1 text-amber-200/80">
              <span className="flex items-center gap-1.5 font-bold tracking-wider text-amber-400">
                <Zap className="w-3.5 h-3.5" />
                BUFFER DE CLOCK
              </span>
              <span className="tabular-nums font-semibold">
                {telemetry.energy} / {telemetry.maxEnergy}
              </span>
            </div>
            <div className="h-1.5 w-52 bg-[#03120b]/90 border border-amber-900/70 rounded-sm overflow-hidden p-0.5">
              <div
                className="h-full bg-amber-400 transition-all duration-100"
                style={{ width: `${energyPercent}%` }}
              />
            </div>
          </div>

          {/* Unconditional Jump (Dash) Status */}
          <div className="text-[11px] font-mono flex items-center gap-2 text-emerald-300/70 mt-0.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                telemetry.dashReady ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-emerald-950'
              }`}
            />
            <span>SALTO JMP [SHIFT / RMB]: {telemetry.dashReady ? 'PRONTO' : 'EM LATÊNCIA'}</span>
          </div>
        </div>

        {/* Center: Benchmark Cycle & Pipeline Status */}
        <div className="flex flex-col items-center">
          <div className="bg-[#051f14]/90 border border-amber-500/40 px-4 py-1.5 rounded text-center shadow-lg">
            <div className="text-[11px] font-mono text-amber-300/80 uppercase tracking-widest">
              CICLO DE BENCHMARK {telemetry.wave} / 6
            </div>
            <div className="text-lg sm:text-xl font-mono font-bold text-emerald-400 tabular-nums">
              {telemetry.waveTimer > 0 ? (
                <>PRÓXIMO FETCH EM {telemetry.waveTimer}s</>
              ) : (
                <span className="text-rose-400">DEPURAR HAZARDS ({telemetry.activeEnemies})</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Computer Architecture Resource Counters */}
        <div className="flex flex-col items-end gap-2.5">
          {/* Resource Counters */}
          <div className="flex items-center gap-3 bg-[#051f14]/90 border border-emerald-800/80 px-3 py-1.5 rounded">
            {/* Ciclos de Clock (Hz) */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
              <span className="text-emerald-300/70 text-[10px]">CLOCK</span>
              <span className="font-bold text-amber-300 tabular-nums">{telemetry.inventory.aether}</span>
            </div>

            <span className="text-emerald-800">|</span>

            {/* Cache SRAM (KB) */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 shadow-[0_0_6px_#e2e8f0]" />
              <span className="text-emerald-300/70 text-[10px]">CACHE SRAM</span>
              <span className="font-bold text-slate-100 tabular-nums">{telemetry.inventory.titanium}</span>
            </div>

            <span className="text-emerald-800">|</span>

            {/* Instruções / Opcodes (ISA) */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              <span className="text-emerald-300/70 text-[10px]">OPCODES</span>
              <span className="font-bold text-emerald-300 tabular-nums">{telemetry.inventory.plasma}</span>
            </div>
          </div>

          {/* Score & Utility Buttons */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="text-xs font-mono text-emerald-200/80 bg-[#051f14]/85 px-2.5 py-1 rounded border border-emerald-800/80 tabular-nums">
              THROUGHPUT: <span className="text-amber-300 font-bold">{telemetry.score} IPC</span>
            </div>

            <button
              onClick={onToggleMute}
              className="p-1.5 bg-[#051f14]/90 hover:bg-emerald-900/70 text-emerald-200 hover:text-white border border-emerald-800/80 rounded transition-colors cursor-pointer"
              title={telemetry.soundMuted ? 'Ativar Áudio (M)' : 'Silenciar Áudio (M)'}
            >
              {telemetry.soundMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400" />
              )}
            </button>

            <button
              onClick={onPause}
              className="px-2.5 py-1 bg-[#051f14]/90 hover:bg-emerald-900/70 text-emerald-200 hover:text-white border border-emerald-800/80 rounded text-xs font-mono transition-colors cursor-pointer"
              title="Interrupção de Pausa (Esc)"
            >
              PAUSA
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Center: Control Unit Integrity & Microarchitecture Terminal Prompt */}
      <div className="flex flex-col items-center gap-2 mb-2">
        {telemetry.isNearCore && (
          <button
            onClick={onOpenUpgrades}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono rounded shadow-[0_0_16px_rgba(251,191,36,0.5)] transition-all animate-bounce cursor-pointer"
          >
            <Terminal className="w-4 h-4" />
            PRESSIONE [E] OU CLIQUE: TERMINAL DA UNIDADE DE CONTROLE (UPGRADES)
          </button>
        )}

        {/* Control Unit Status Bar */}
        <div className="bg-[#051f14]/90 border border-amber-500/40 px-4 py-2 rounded flex items-center gap-4">
          <div className="text-xs font-mono text-emerald-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            <span className="font-bold">UNIDADE DE CONTROLE + REGISTRADORES (v{telemetry.coreLevel}.0)</span>
          </div>

          <div className="h-2 w-44 bg-[#020d08] border border-emerald-800 rounded-sm overflow-hidden p-0.5">
            <div
              className={`h-full transition-all duration-150 ${
                corePercent > 30 ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'
              }`}
              style={{ width: `${corePercent}%` }}
            />
          </div>

          <span className="text-xs font-mono text-amber-300 tabular-nums">
            {telemetry.coreHp} / {telemetry.coreMaxHp} HP
          </span>
        </div>
      </div>
    </div>
  );
};
