import { Puzzle } from './gameLogic';
import { format } from 'date-fns';

// Interface for saved game state
interface SavedGameState {
  puzzle: Puzzle;
  lastPlayed: string; // ISO date string
}

// Interface for game states by difficulty
interface GameStates {
  [key: string]: SavedGameState; // key is difficulty level
}

// Interface for game stats
export interface GameStats {
  gamesPlayed: number;
  averageThinkingTime: {
    easy?: number;
    medium?: number;
    hard?: number;
    expert?: number;
    master?: number;
    [key: string]: number | undefined;
  };
  movesPerGame: {
    easy?: number;
    medium?: number;
    hard?: number;
    expert?: number;
    master?: number;
    [key: string]: number | undefined;
  };
  averageTime: {
    easy?: number;
    medium?: number;
    hard?: number;
    expert?: number;
    master?: number;
    [key: string]: number | undefined;
  };
  bestTime: {
    easy?: number;
    medium?: number;
    hard?: number;
    expert?: number;
    master?: number;
    [key: string]: number | undefined;
  };
}

// Save current game state
export const saveCurrentGame = (puzzle: Puzzle) => {
  if (!puzzle.difficulty) return;

  const gameStates: GameStates = JSON.parse(localStorage.getItem('hashi_current_games') || '{}');
  
  gameStates[puzzle.difficulty] = {
    puzzle,
    lastPlayed: new Date().toISOString()
  };

  localStorage.setItem('hashi_current_games', JSON.stringify(gameStates));
};

// Get current game state for a difficulty
export const getCurrentGame = (difficulty: string): Puzzle | null => {
  const gameStates: GameStates = JSON.parse(localStorage.getItem('hashi_current_games') || '{}');
  return gameStates[difficulty]?.puzzle || null;
};

// Clear current game state for a difficulty
export const clearCurrentGame = (difficulty: string) => {
  const gameStates: GameStates = JSON.parse(localStorage.getItem('hashi_current_games') || '{}');
  delete gameStates[difficulty];
  localStorage.setItem('hashi_current_games', JSON.stringify(gameStates));
};

// Get game statistics
export const getStats = (): GameStats => {
  const stats = localStorage.getItem('hashi_stats');
  return stats ? JSON.parse(stats) : {
    gamesPlayed: 0,
    averageThinkingTime: {},
    movesPerGame: {},
    averageTime: {},
    bestTime: {}
  };
};

// Update game statistics
export const updateStats = (puzzle: Puzzle) => {
  const stats = getStats();
  stats.gamesPlayed += 1;
  
  if (puzzle.difficulty) {
    const totalTime = puzzle.endTime && puzzle.startTime 
      ? puzzle.endTime - puzzle.startTime 
      : 0;
    const movesCount = puzzle.moveHistory.length;
    const thinkingTimePerMove = movesCount > 0 ? totalTime / movesCount : 0;

    // Update average thinking time
    const prevThinkingTime = stats.averageThinkingTime[puzzle.difficulty] || 0;
    const prevGamesPlayed = stats.gamesPlayed > 1 ? stats.gamesPlayed - 1 : 1;
    stats.averageThinkingTime[puzzle.difficulty] = 
      (prevThinkingTime * prevGamesPlayed + thinkingTimePerMove) / stats.gamesPlayed;

    // Update moves per game
    const prevMovesPerGame = stats.movesPerGame[puzzle.difficulty] || 0;
    stats.movesPerGame[puzzle.difficulty] = 
      (prevMovesPerGame * prevGamesPlayed + movesCount) / stats.gamesPlayed;

    // Update average completion time
    const prevAverageTime = stats.averageTime[puzzle.difficulty] || 0;
    stats.averageTime[puzzle.difficulty] = 
      (prevAverageTime * prevGamesPlayed + totalTime) / stats.gamesPlayed;

    // Update best time
    if (totalTime > 0 && (!stats.bestTime[puzzle.difficulty] || totalTime < stats.bestTime[puzzle.difficulty]!)) {
      stats.bestTime[puzzle.difficulty] = totalTime;
    }
  }
  
  localStorage.setItem('hashi_stats', JSON.stringify(stats));
};

// Format time for display
export const formatTime = (time: number): string => {
  const seconds = Math.floor((time / 1000) % 60);
  const minutes = Math.floor((time / (1000 * 60)) % 60);
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
  return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
};

// Format date for display
export const formatDate = (date: Date): string => {
  return format(date, 'MMMM do, yyyy');
};
