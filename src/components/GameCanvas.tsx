/**
 * GameCanvas Component
 * Isolated canvas container that never re-renders during gameplay.
 */

import React, { useEffect, useRef } from 'react';
import { GameManager } from '../game/systems/GameManager.ts';

interface GameCanvasProps {
  gameManager: GameManager;
}

export const GameCanvas: React.FC<GameCanvasProps> = React.memo(({ gameManager }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    gameManager.init(canvasRef.current);

    return () => {
      gameManager.destroy();
    };
  }, [gameManager]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block w-full h-full cursor-crosshair z-0"
    />
  );
});

GameCanvas.displayName = 'GameCanvas';
