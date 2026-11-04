/**
 * Game Over & Victory Modal
 * Placar acessível com termos diretos de jogos, conceitos de Arquitetura de Computadores
 * entre parênteses e indicação clara da causa da derrota.
 */

import React, { useEffect } from 'react';
import { GameManager } from '../game/systems/GameManager.ts';
import { SaveSystem } from '../game/systems/SaveSystem.ts';
import { RotateCcw, Home, Trophy, AlertTriangle } from 'lucide-react';

interface GameOverModalProps {
  gameManager: GameManager;
  isVictory: boolean;
  onRestart: () => void;
  onQuitToTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  gameManager,
  isVictory,
  onRestart,
  onQuitToTitle,
}) => {
  const saved = SaveSystem.load();
  const minutes = Math.floor(gameManager.timeSurvived / 60);
  const seconds = Math.floor(gameManager.timeSurvived % 60);
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const defeatReason =
    gameManager.gameOverReason ||
    'A vida da sua nave (ULA) ou da Base Central chegou a zero.';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-[#020d08]/90 pointer-events-auto">
      <div className="w-full max-w-lg bg-[#051f14] border border-amber-500/40 rounded-lg shadow-2xl p-6 sm:p-8 flex flex-col gap-5 text-center">
        {/* Header Icon & Title */}
        <div>
          <div className="flex justify-center mb-3">
            {isVictory ? (
              <div className="p-3 bg-emerald-950/90 border border-amber-400/60 rounded-full text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                <Trophy className="w-8 h-8" />
              </div>
            ) : (
              <div className="p-3 bg-rose-950/90 border border-rose-500/50 rounded-full text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                <AlertTriangle className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="text-xs font-mono tracking-widest uppercase text-emerald-300/80 mb-1">
            {isVictory
              ? 'MISSÃO CONCLUÍDA · TODAS AS ONDAS SUPERADAS'
              : 'FIM DE JOGO · PARTIDA ENCERRADA'}
          </div>

          <h2
            className={`text-2xl sm:text-3xl font-mono font-bold tracking-wider ${
              isVictory ? 'text-amber-300' : 'text-rose-400'
            }`}
          >
            {isVictory ? 'PROCESSADOR PROTEGIDO!' : 'PROCESSADOR SOBRECARREGADO'}
          </h2>

          {/* Direct Cause of Defeat */}
          {!isVictory && (
            <div className="mt-3 px-3.5 py-2 bg-rose-950/60 border border-rose-500/40 rounded text-xs font-mono text-rose-200">
              <strong className="text-rose-400">Motivo da derrota:</strong> {defeatReason}
            </div>
          )}
        </div>

        {/* Accessible Performance Breakdown (Simple Term + Concept in Parentheses) */}
        <div className="grid grid-cols-2 gap-3 bg-[#03120b]/90 p-4 rounded border border-emerald-900 text-left text-xs font-mono">
          <div>
            <div className="text-emerald-300/75">PONTUAÇÃO (Desempenho)</div>
            <div className="text-lg font-bold text-amber-300 tabular-nums">
              {gameManager.score} pts
            </div>
          </div>

          <div>
            <div className="text-emerald-300/75">ONDA ALCANÇADA (Ciclo)</div>
            <div className="text-lg font-bold text-emerald-300 tabular-nums">
              Onda {gameManager.enemyManager.wave} / 6
            </div>
          </div>

          <div>
            <div className="text-emerald-300/75">RECURSOS COLETADOS (Dados)</div>
            <div className="text-base font-semibold text-emerald-100 tabular-nums">
              {gameManager.totalMineralsMined} itens
            </div>
          </div>

          <div>
            <div className="text-emerald-300/75">INIMIGOS DERROTADOS (Bugs)</div>
            <div className="text-base font-semibold text-emerald-100 tabular-nums">
              {gameManager.totalEnemiesDefeated} inimigos
            </div>
          </div>

          <div className="col-span-2 pt-1.5 border-t border-emerald-900 flex justify-between items-center text-emerald-300/75">
            <span>TEMPO DE SOBREVIVÊNCIA:</span>
            <span className="text-emerald-100 font-bold tabular-nums">{formattedTime}</span>
          </div>

          <div className="col-span-2 flex justify-between items-center text-emerald-300/75">
            <span>RECORDE DE PONTOS:</span>
            <span className="text-amber-400 font-bold tabular-nums">{saved.highScore} pts</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2.5 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-xs rounded transition-all shadow-[0_0_16px_rgba(251,191,36,0.4)] active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            JOGAR NOVAMENTE [ESPAÇO / ENTER]
          </button>

          <button
            onClick={onQuitToTitle}
            className="flex items-center justify-center gap-2 py-2.5 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-100 font-mono text-xs rounded border border-emerald-800 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            VOLTAR AO MENU INICIAL
          </button>
        </div>
      </div>
    </div>
  );
};
