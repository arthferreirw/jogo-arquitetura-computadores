/**
 * Title Screen Game Shell Component — Edição Arquitetura de Computadores (Von Neumann)
 * Logotipo vetorial SVG com chip QFP de pinos dourados sobre a câmera ao vivo do circuito PCB.
 */

import React, { useEffect } from 'react';
import { SaveSystem } from '../game/systems/SaveSystem.ts';
import { Play, Cpu } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame }) => {
  const savedData = SaveSystem.load();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 sm:p-14 bg-gradient-to-b from-[#03120b]/85 via-transparent to-[#03120b]/95 pointer-events-auto">
      {/* Top Header Row with System Architecture Classification */}
      <div className="flex items-center justify-between text-xs font-mono text-emerald-300/80">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-amber-400" />
          <span className="tracking-widest">ARQUITETURA DE VON NEUMANN · SUBSTRATO PCB REV 4.2</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="tabular-nums">
            RECORDE DE PONTOS: <strong className="text-amber-300">{savedData.highScore} pts</strong>
          </span>
          <span className="text-emerald-700">·</span>
          <span className="tabular-nums">
            ONDA MÁXIMA: <strong className="text-emerald-300">ONDA {savedData.highestWave}</strong>
          </span>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup with 35% Negative Space */}
      <div className="max-w-2xl flex flex-col gap-6">
        {/* Inline SVG Title Lockup */}
        <div className="relative">
          <svg
            viewBox="0 0 600 105"
            className="w-full max-w-2xl h-auto drop-shadow-[0_0_24px_rgba(16,185,129,0.35)]"
          >
            <defs>
              <linearGradient id="pcbTitleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="45%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="pcbSubGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>

            {/* QFP Processor Package Icon with Gold Pins */}
            <g stroke="#fbbf24" strokeWidth="2">
              {/* Top & Bottom Gold Pins */}
              <line x1="28" y1="10" x2="28" y2="18" />
              <line x1="38" y1="10" x2="38" y2="18" />
              <line x1="48" y1="10" x2="48" y2="18" />
              <line x1="28" y1="54" x2="28" y2="62" />
              <line x1="38" y1="54" x2="38" y2="62" />
              <line x1="48" y1="54" x2="48" y2="62" />
              {/* Left & Right Gold Pins */}
              <line x1="12" y1="26" x2="20" y2="26" />
              <line x1="12" y1="36" x2="20" y2="36" />
              <line x1="12" y1="46" x2="20" y2="46" />
              <line x1="56" y1="26" x2="64" y2="26" />
              <line x1="56" y1="36" x2="64" y2="36" />
              <line x1="56" y1="46" x2="64" y2="46" />
            </g>
            <rect
              x="20"
              y="18"
              width="36"
              height="36"
              rx="4"
              fill="#052e1c"
              stroke="#10b981"
              strokeWidth="2.5"
            />
            {/* ULA V-Shape inside IC */}
            <polygon
              points="30,26 46,32 46,40 30,46 30,39 36,36 30,33"
              fill="#fbbf24"
            />

            {/* Title Text */}
            <text
              x="82"
              y="46"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="38"
              fontWeight="900"
              letterSpacing="0.06em"
              fill="url(#pcbTitleGrad)"
            >
              VON NEUMANN
            </text>
            <text
              x="84"
              y="74"
              fontFamily="monospace"
              fontSize="13.5"
              fontWeight="700"
              letterSpacing="0.24em"
              fill="url(#pcbSubGrad)"
            >
              ARQUITETURA DE COMPUTADORES · PCB DEFENDER
            </text>
          </svg>
        </div>

        {/* Tactical Educational Prose */}
        <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-sans max-w-xl">
          Assuma o controle da <strong className="text-amber-300">Unidade Lógica e Aritmética (ULA)</strong> no interior do chip. Percorra os barramentos buscando <strong className="text-amber-300">Ciclos de Clock</strong>, <strong className="text-slate-200">Cache SRAM</strong> e <strong className="text-emerald-300">Instruções (Opcodes)</strong> para expandir a <strong className="text-amber-300">Unidade de Controle</strong> e depurar <em>Pipeline Hazards</em>, <em>Deadlocks</em> e <em>Page Faults</em>.
        </p>

        {/* Start Game CTA Button */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={onStartGame}
            className="flex items-center gap-3 px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-sm tracking-wider rounded transition-all shadow-[0_0_24px_rgba(251,191,36,0.45)] active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            INICIAR CICLO DE INSTRUÇÃO [SPACE / ENTER]
          </button>
        </div>
      </div>

      {/* Footer: Single-Line Control Hint */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-emerald-300/70 border-t border-emerald-900/80 pt-4 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-amber-300 font-semibold">BARRAMENTO DE CONTROLE:</span>
          <span>WASD Trafegar</span>
          <span className="text-emerald-700">·</span>
          <span>Espaço Ciclo de Busca (Fetch)</span>
          <span className="text-emerald-700">·</span>
          <span>LMB / F Disparo Lógico ULA</span>
          <span className="text-emerald-700">·</span>
          <span>Shift / RMB Salto JMP</span>
          <span className="text-emerald-700">·</span>
          <span>E Terminal da UC</span>
          <span className="text-emerald-700">·</span>
          <span>Esc Pausa</span>
        </div>
        <div className="text-emerald-500/80 text-[11px]">
          CLOCK 60HZ · SINTETIZADOR WEB AUDIO · MEMÓRIA NÃO-VOLÁTIL
        </div>
      </div>
    </div>
  );
};
