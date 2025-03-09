
import { Puzzle } from './gameLogic';

// Keys for localStorage
const KEYS = {
  PUZZLES: 'hashi-puzzles',
  STATS: 'hashi-stats',
  DAILY_COMPLETED: 'hashi-daily-completed',
  THEME: 'theme'
};

// Stats interface
export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTime: { [key: string]: number }; // Key is difficulty
  averageTime: { [key: string]: number }; // Key is difficulty
  dailyStreak: number;
  lastDailyCompleted: string | null;
}

// Initialize stats
export const initStats = (): GameStats => {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    bestTime: {
      easy: 0,
      medium: 0,
      hard: 0,
      expert: 0,
      master: 0
    },
    averageTime: {
      easy: 0,
      medium: 0,
      hard: 0,
      expert: 0,
      master: 0
    },
    dailyStreak: 0,
    lastDailyCompleted: null
  };
};

// Get stats from localStorage
export const getStats = (): GameStats => {
  const stats = localStorage.getItem(KEYS.STATS);
  return stats ? JSON.parse(stats) : initStats();
};

// Save stats to localStorage
export const saveStats = (stats: GameStats): void => {
  localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
};

// Update stats with completed game
export const updateStats = (puzzle: Puzzle): void => {
  const stats = getStats();
  
  stats.gamesPlayed++;
  
  if (puzzle.solved) {
    stats.gamesWon++;
    
    const gameTime = puzzle.endTime! - puzzle.startTime!;
    const difficulty = puzzle.difficulty;
    
    // Update best time
    if (stats.bestTime[difficulty] === 0 || gameTime < stats.bestTime[difficulty]) {
      stats.bestTime[difficulty] = gameTime;
    }
    
    // Update average time
    if (stats.averageTime[difficulty] === 0) {
      stats.averageTime[difficulty] = gameTime;
    } else {
      stats.averageTime[difficulty] = (stats.averageTime[difficulty] + gameTime) / 2;
    }
    
    // Check if this is a daily challenge
    if (puzzle.id.startsWith('daily-')) {
      const today = new Date().toISOString().split('T')[0];
      
      if (stats.lastDailyCompleted !== today) {
        // Check if streak continues
        if (stats.lastDailyCompleted) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().split('T')[0];
          
          if (stats.lastDailyCompleted === yesterdayString) {
            stats.dailyStreak++;
          } else {
            stats.dailyStreak = 1;
          }
        } else {
          stats.dailyStreak = 1;
        }
        
        stats.lastDailyCompleted = today;
      }
    }
  }
  
  saveStats(stats);
};

// Save puzzle to localStorage
export const savePuzzle = (puzzle: Puzzle): void => {
  const puzzles = getPuzzles();
  const existingIndex = puzzles.findIndex(p => p.id === puzzle.id);
  
  if (existingIndex !== -1) {
    puzzles[existingIndex] = puzzle;
  } else {
    puzzles.push(puzzle);
  }
  
  localStorage.setItem(KEYS.PUZZLES, JSON.stringify(puzzles));
};

// Get all saved puzzles
export const getPuzzles = (): Puzzle[] => {
  const puzzles = localStorage.getItem(KEYS.PUZZLES);
  return puzzles ? JSON.parse(puzzles) : [];
};

// Get a specific puzzle by ID
export const getPuzzle = (id: string): Puzzle | null => {
  const puzzles = getPuzzles();
  return puzzles.find(p => p.id === id) || null;
};

// Check if daily challenge has been completed
export const isDailyCompleted = (): boolean => {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];
  return stats.lastDailyCompleted === today;
};

// Format time in mm:ss
export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
