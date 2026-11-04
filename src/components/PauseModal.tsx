/**
 * Pause Modal — Interrupção de Hardware (HLT / PAUSE)
 * Menu de pausa com resumo do barramento de controles, áudio e reinício.
 */

import React, { useEffect } from 'react';
import { Volume2, VolumeX, Play, RotateCcw, Home } from 'lucide-react';
import { audioSynth } from '../game/engine/AudioSynth.ts';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onQuitToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onQuitToTitle,
}) => {
  const [isMuted, setIsMuted] = React.useState(audioSynth.getIsMuted());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onResume();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResume]);

  const handleToggleMute = () => {
    const muted = audioSynth.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-[#020d08]/85 pointer-events-auto">
      <div className="w-full max-w-md bg-[#051f14] border border-amber-500/40 rounded-lg shadow-2xl p-6 flex flex-col gap-6">
        <div className="text-center">
          <div className="text-xs font-mono text-amber-400 tracking-widest uppercase mb-1">
            CLOCK SUSPENSO · INSTRUÇÃO HLT
          </div>
          <h2 className="text-2xl font-mono font-bold text-emerald-50 tracking-wider">
            INTERRUPÇÃO DE SISTEMA
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2.5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-xs rounded transition-all shadow-[0_0_12px_rgba(251,191,36,0.4)] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            RETOMAR CICLO DE CLOCK [ESC]
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2.5 py-2.5 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-100 font-mono text-xs rounded border border-emerald-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            REINICIAR BENCHMARK (RESET)
          </button>

          <button
            onClick={handleToggleMute}
            className="flex items-center justify-center gap-2.5 py-2.5 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-100 font-mono text-xs rounded border border-emerald-800 transition-colors cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
            {isMuted ? 'ATIVAR SINTETIZADOR DE ÁUDIO (M)' : 'SILENCIAR ÁUDIO (M)'}
          </button>

          <button
            onClick={onQuitToTitle}
            className="flex items-center justify-center gap-2.5 py-2.5 bg-[#03120b] hover:bg-emerald-950 text-emerald-300/80 hover:text-emerald-100 font-mono text-xs rounded border border-emerald-900 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            RETORNAR AO BOOTLOADER (TÍTULO)
          </button>
        </div>

        {/* Controls Quick Reference */}
        <div className="bg-[#03120b]/90 p-3.5 rounded border border-emerald-900 text-[11px] font-mono text-emerald-300/75 space-y-1">
          <div className="text-amber-300 font-semibold mb-1">CONJUNTO DE INSTRUÇÕES (ISA):</div>
          <div className="flex justify-between">
            <span>Tráfego nas Trilhas PCB</span>
            <span className="text-emerald-100">W, A, S, D</span>
          </div>
          <div className="flex justify-between">
            <span>Ciclo de Busca (Data Fetch)</span>
            <span className="text-emerald-100">Segurar Espaço / LMB</span>
          </div>
          <div className="flex justify-between">
            <span>Disparo Lógico da ULA</span>
            <span className="text-emerald-100">Clique LMB / Segurar F</span>
          </div>
          <div className="flex justify-between">
            <span>Salto Incondicional (JMP)</span>
            <span className="text-emerald-100">Shift / RMB</span>
          </div>
          <div className="flex justify-between">
            <span>Engenharia da UC (Upgrades)</span>
            <span className="text-emerald-100">Tecla E</span>
          </div>
        </div>
      </div>
    </div>
  );
};
