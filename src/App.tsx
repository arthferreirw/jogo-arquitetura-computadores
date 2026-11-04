/**
 * Main Application Shell: Aetheria - Outpost 7
 * 2D Sci-Fi Roguelite Survival Engine
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GameManager } from './game/systems/GameManager.ts';
import { GameCanvas } from './components/GameCanvas.tsx';
import { HUD } from './components/HUD.tsx';
import { TitleScreen } from './components/TitleScreen.tsx';
import { UpgradesModal } from './components/UpgradesModal.tsx';
import { PauseModal } from './components/PauseModal.tsx';
import { GameOverModal } from './components/GameOverModal.tsx';
import { GameState, GameTelemetrySnapshot } from './game/types.ts';
import { audioSynth } from './game/engine/AudioSynth.ts';

export default function App() {
  const gameManagerRef = useRef<GameManager | null>(null);
  if (!gameManagerRef.current) {
    gameManagerRef.current = new GameManager();
  }
  const gameManager = gameManagerRef.current;

  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [telemetry, setTelemetry] = useState<GameTelemetrySnapshot | null>(null);

  useEffect(() => {
    gameManager.onStateChange = (nextState) => {
      setGameState(nextState);
    };

    gameManager.onTelemetryUpdate = (snap) => {
      setTelemetry(snap);
    };

    return () => {
      gameManager.onStateChange = undefined;
      gameManager.onTelemetryUpdate = undefined;
    };
  }, [gameManager]);

  const handleStartGame = useCallback(() => {
    gameManager.startGame();
  }, [gameManager]);

  const handleResumeGame = useCallback(() => {
    gameManager.setState('PLAYING');
  }, [gameManager]);

  const handlePauseGame = useCallback(() => {
    gameManager.setState('PAUSED');
  }, [gameManager]);

  const handleOpenUpgrades = useCallback(() => {
    gameManager.setState('UPGRADE_STATION');
  }, [gameManager]);

  const handleCloseUpgrades = useCallback(() => {
    gameManager.setState('PLAYING');
  }, [gameManager]);

  const handleToggleMute = useCallback(() => {
    audioSynth.toggleMute();
    setTelemetry((prev) =>
      prev ? { ...prev, soundMuted: audioSynth.getIsMuted() } : null
    );
  }, []);

  const handleQuitToTitle = useCallback(() => {
    gameManager.setState('TITLE');
  }, [gameManager]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#041b11] select-none text-emerald-50 font-sans">
      {/* Isolated Canvas Game Viewport */}
      <GameCanvas gameManager={gameManager} />

      {/* Atmospheric Subtle Scanlines (Zero obstruction, pointer-events none) */}
      <div className="absolute inset-0 pointer-events-none scanline-overlay opacity-30 z-5" />

      {/* Low-Occlusion In-Game HUD (<10% screen space) */}
      {(gameState === 'PLAYING' || gameState === 'UPGRADE_STATION') && (
        <HUD
          telemetry={telemetry}
          onOpenUpgrades={handleOpenUpgrades}
          onToggleMute={handleToggleMute}
          onPause={handlePauseGame}
        />
      )}

      {/* Title Screen View */}
      {gameState === 'TITLE' && <TitleScreen onStartGame={handleStartGame} />}

      {/* Outpost Base Core Terminal Upgrades */}
      {gameState === 'UPGRADE_STATION' && (
        <UpgradesModal
          gameManager={gameManager}
          onClose={handleCloseUpgrades}
        />
      )}

      {/* Tactical Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResumeGame}
          onRestart={handleStartGame}
          onQuitToTitle={handleQuitToTitle}
        />
      )}

      {/* Mission Debrief (Game Over / Extraction Victory) */}
      {(gameState === 'GAME_OVER' || gameState === 'VICTORY') && (
        <GameOverModal
          gameManager={gameManager}
          isVictory={gameState === 'VICTORY'}
          onRestart={handleStartGame}
          onQuitToTitle={handleQuitToTitle}
        />
      )}
    </div>
  );
}
