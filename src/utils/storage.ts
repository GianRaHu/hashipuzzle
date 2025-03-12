import { Puzzle } from './gameLogic';
import { format } from 'date-fns';

// Define the GameStats type with the new metrics
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

// Game history type
export interface GameHistoryEntry {
  seed: number;
  difficulty: string;
  date: string;
}

// Save puzzle to local storage
export const savePuzzle = (puzzle: Puzzle): void => {
  localStorage.setItem(`puzzle_${puzzle.id}`, JSON.stringify(puzzle));
  
  // Save to game history if it has a seed
  if (puzzle.seed) {
    const historyEntry: GameHistoryEntry = {
      seed: puzzle.seed,
      difficulty: puzzle.difficulty,
      date: new Date().toLocaleString()
    };
    
    const history = localStorage.getItem('hashi_game_history');
    const gameHistory: GameHistoryEntry[] = history ? JSON.parse(history) : [];
    
    // Add to history and limit to last 50 games
    gameHistory.unshift(historyEntry);
    if (gameHistory.length > 50) {
      gameHistory.pop();
    }
    
    localStorage.setItem('hashi_game_history', JSON.stringify(gameHistory));
  }
};

// Get saved puzzle from local storage
export const getSavedPuzzle = (id: string): Puzzle | null => {
  const savedPuzzle = localStorage.getItem(`puzzle_${id}`);
  return savedPuzzle ? JSON.parse(savedPuzzle) : null;
};

// Get game statistics from local storage
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
    // Calculate thinking time per move
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

    // Update best time if this solve is faster or if there's no previous best time
    if (totalTime > 0 && (!stats.bestTime[puzzle.difficulty] || totalTime < stats.bestTime[puzzle.difficulty]!)) {
      stats.bestTime[puzzle.difficulty] = totalTime;
    }
  }
  
  localStorage.setItem('hashi_stats', JSON.stringify(stats));
};

// Format time in a readable way
export const formatTime = (time: number): string => {
  const seconds = Math.floor((time / 1000) % 60);
  const minutes = Math.floor((time / (1000 * 60)) % 60);
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
  return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
};

// Format a date to a readable string
export const formatDate = (date: Date): string => {
  return format(date, 'MMMM do, yyyy');
};

// Get game history
export const getGameHistory = (): GameHistoryEntry[] => {
  const history = localStorage.getItem('hashi_game_history');
  return history ? JSON.parse(history) : [];
};
