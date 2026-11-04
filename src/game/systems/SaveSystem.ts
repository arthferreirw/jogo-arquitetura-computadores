/**
 * Save System
 * LocalStorage persistence for stats, high score, and unlocked records.
 */

export interface SavedGameData {
  highScore: number;
  highestWave: number;
  totalMineralsMined: number;
  totalEnemiesDefeated: number;
  bestSurvivalSeconds: number;
}

const STORAGE_KEY = 'aetheria_outpost7_save_v1';

const DEFAULT_SAVE: SavedGameData = {
  highScore: 0,
  highestWave: 1,
  totalMineralsMined: 0,
  totalEnemiesDefeated: 0,
  bestSurvivalSeconds: 0,
};

export class SaveSystem {
  public static load(): SavedGameData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SAVE };
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SAVE,
        ...parsed,
      };
    } catch {
      return { ...DEFAULT_SAVE };
    }
  }

  public static save(data: Partial<SavedGameData>): SavedGameData {
    try {
      const current = this.load();
      const updated: SavedGameData = {
        highScore: Math.max(current.highScore, data.highScore ?? 0),
        highestWave: Math.max(current.highestWave, data.highestWave ?? 1),
        totalMineralsMined: current.totalMineralsMined + (data.totalMineralsMined ?? 0),
        totalEnemiesDefeated: current.totalEnemiesDefeated + (data.totalEnemiesDefeated ?? 0),
        bestSurvivalSeconds: Math.max(current.bestSurvivalSeconds, data.bestSurvivalSeconds ?? 0),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return { ...DEFAULT_SAVE, ...data };
    }
  }

  public static reset(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
  }
}
