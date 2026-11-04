/**
 * Control Unit Microarchitecture Upgrades Terminal Modal
 * Interface de engenharia de hardware para aprimorar Barramento, ULA, Cache e Unidade de Controle.
 */

import React, { useEffect } from 'react';
import { GameManager } from '../game/systems/GameManager.ts';
import { X, Cpu } from 'lucide-react';

interface UpgradesModalProps {
  gameManager: GameManager;
  onClose: () => void;
}

export const UpgradesModal: React.FC<UpgradesModalProps> = ({
  gameManager,
  onClose,
}) => {
  const [, setTick] = React.useState(0);
  const inventory = gameManager.player.inventory;
  const upgrades = gameManager.upgrades;
  const core = gameManager.baseManager.core;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'e') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePurchase = (id: string) => {
    if (gameManager.purchaseUpgrade(id)) {
      setTick((t) => t + 1);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-[#020d08]/85 pointer-events-auto">
      <div className="w-full max-w-2xl bg-[#051f14] border border-amber-500/40 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900 bg-[#03120b]">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-mono font-bold text-emerald-100 tracking-wide">
                ENGENHARIA DA UNIDADE DE CONTROLE (UC)
              </h2>
              <p className="text-xs font-mono text-emerald-400/80">
                Arquitetura v{core.level}.0 · Barramento Local Ativo
              </p>
            </div>
          </div>

          {/* Current Inventory Strip */}
          <div className="flex items-center gap-4 text-xs font-mono bg-[#051f14] px-3 py-1.5 rounded border border-emerald-800/80">
            <span className="text-amber-300 font-bold tabular-nums">
              {inventory.aether} Clock
            </span>
            <span className="text-slate-200 font-bold tabular-nums">
              {inventory.titanium} SRAM
            </span>
            <span className="text-emerald-300 font-bold tabular-nums">
              {inventory.plasma} Opcodes
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-emerald-300/70 hover:text-white rounded hover:bg-emerald-900/60 transition-colors cursor-pointer"
            title="Fechar [Esc / E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upgrade Cards List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {upgrades.map((upg) => {
            const isMaxed = upg.level >= upg.maxLevel;
            const canAfford =
              !isMaxed &&
              inventory.aether >= upg.cost.aether &&
              inventory.titanium >= upg.cost.titanium &&
              inventory.plasma >= upg.cost.plasma;

            return (
              <div
                key={upg.id}
                className="flex items-center justify-between p-3.5 bg-[#03120b]/80 border border-emerald-900/90 rounded hover:border-amber-500/40 transition-colors"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-amber-400">
                      {upg.category}
                    </span>
                    <span className="text-emerald-800">·</span>
                    <h3 className="text-sm font-semibold text-emerald-100">
                      {upg.name}
                    </h3>
                    <span className="text-emerald-800">·</span>
                    <span className="text-xs font-mono text-emerald-400">
                      {isMaxed ? 'REV MÁXIMA' : `REV ${upg.level} / ${upg.maxLevel}`}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/75">{upg.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Cost Readouts */}
                  {!isMaxed && (
                    <div className="text-[11px] font-mono text-right space-y-0.5 tabular-nums">
                      {upg.cost.aether > 0 && (
                        <div
                          className={
                            inventory.aether >= upg.cost.aether
                              ? 'text-amber-300'
                              : 'text-red-400'
                          }
                        >
                          {upg.cost.aether} Clock
                        </div>
                      )}
                      {upg.cost.titanium > 0 && (
                        <div
                          className={
                            inventory.titanium >= upg.cost.titanium
                              ? 'text-slate-200'
                              : 'text-red-400'
                          }
                        >
                          {upg.cost.titanium} SRAM
                        </div>
                      )}
                      {upg.cost.plasma > 0 && (
                        <div
                          className={
                            inventory.plasma >= upg.cost.plasma
                              ? 'text-emerald-300'
                              : 'text-red-400'
                          }
                        >
                          {upg.cost.plasma} Opcodes
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upgrade CTA */}
                  <button
                    disabled={!canAfford || isMaxed}
                    onClick={() => handlePurchase(upg.id)}
                    className={`px-4 py-2 rounded text-xs font-mono font-bold transition-all whitespace-nowrap shrink-0 ${
                      isMaxed
                        ? 'bg-emerald-950/60 text-emerald-700 cursor-not-allowed'
                        : canAfford
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.4)] cursor-pointer'
                        : 'bg-emerald-950/80 text-emerald-700 cursor-not-allowed'
                    }`}
                  >
                    {isMaxed ? 'INSTALADO' : 'INTEGRAR'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-emerald-900 bg-[#03120b] flex justify-between items-center text-xs font-mono text-emerald-300/70">
          <span>Pressione [Esc] ou [E] para retomar o ciclo de instrução</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 rounded transition-colors cursor-pointer"
          >
            FECHAR TERMINAL
          </button>
        </div>
      </div>
    </div>
  );
};
