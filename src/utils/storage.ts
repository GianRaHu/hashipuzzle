
import { Puzzle } from './gameLogic';
import { format } from 'date-fns';

// Define the GameStats type
export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  dailyStreak: number;
  bestTime: {
    easy?: number;
    medium?: number;
    hard?: number;
    expert?: number;
    [key: string]: number | undefined;
  };
  // Track games played per difficulty
  difficultyGamesPlayed?: {
    [key: string]: number;
  };
  // Track total time spent per difficulty
  totalTime?: {
    [key: string]: number;
  };
}

// Game settings interface
export interface GameSettings {
  darkMode: boolean;
  soundEnabled: boolean;
  analyticsEnabled: boolean;
  showTimer: boolean;
}

// Game history type
export interface GameHistoryEntry {
  seed: number;
  difficulty: string;
  date: string;
  status: 'generated' | 'in-progress' | 'completed';
  time?: number;
}

// Save puzzle to local storage
export const savePuzzle = (puzzle: Puzzle): void => {
  localStorage.setItem(`puzzle_${puzzle.id}`, JSON.stringify(puzzle));
  
  // Save to game history if it has a seed
  if (puzzle.seed) {
    const historyEntry: GameHistoryEntry = {
      seed: puzzle.seed,
      difficulty: puzzle.difficulty,
      date: new Date().toLocaleString(),
      status: puzzle.solved ? 'completed' : puzzle.startTime ? 'in-progress' : 'generated',
      time: puzzle.endTime && puzzle.startTime ? puzzle.endTime - puzzle.startTime : undefined
    };
    
    const history = localStorage.getItem('hashi_game_history');
    const gameHistory: GameHistoryEntry[] = history ? JSON.parse(history) : [];
    
    // Only add to history if it's not already there with the same seed
    const existingEntryIndex = gameHistory.findIndex(entry => entry.seed === puzzle.seed);
    
    if (existingEntryIndex !== -1) {
      // Update existing entry
      gameHistory[existingEntryIndex] = historyEntry;
    } else {
      // Add new entry and limit to last 50 games
      gameHistory.unshift(historyEntry);
      if (gameHistory.length > 50) {
        gameHistory.pop();
      }
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
    gamesWon: 0, 
    dailyStreak: 0,
    bestTime: {
      easy: 0,
      medium: 0,
      hard: 0,
      expert: 0
    },
    difficultyGamesPlayed: {
      easy: 0,
      medium: 0,
      hard: 0,
      expert: 0
    },
    totalTime: {
      easy: 0,
      medium: 0,
      hard: 0,
      expert: 0
    }
  };
};

// Update game statistics
export const updateStats = (puzzle: Puzzle) => {
  const stats = getStats();
  stats.gamesPlayed += 1;
  
  // Initialize difficultyGamesPlayed and totalTime if they don't exist
  if (!stats.difficultyGamesPlayed) {
    stats.difficultyGamesPlayed = {};
  }
  if (!stats.totalTime) {
    stats.totalTime = {};
  }
  
  // Increment difficulty-specific game count
  if (puzzle.difficulty) {
    stats.difficultyGamesPlayed[puzzle.difficulty] = (stats.difficultyGamesPlayed[puzzle.difficulty] || 0) + 1;
  }
  
  // If puzzle is solved, increment wins and update best time
  if (puzzle.solved && puzzle.endTime && puzzle.startTime) {
    stats.gamesWon = (stats.gamesWon || 0) + 1;
    const solveTime = puzzle.endTime - puzzle.startTime;
    
    // Update best time if this solve is faster or if there's no previous best time
    if (puzzle.difficulty && (!stats.bestTime[puzzle.difficulty] || solveTime < stats.bestTime[puzzle.difficulty]!)) {
      stats.bestTime[puzzle.difficulty] = solveTime;
    }
    
    // Update total time spent on this difficulty
    if (puzzle.difficulty) {
      stats.totalTime[puzzle.difficulty] = (stats.totalTime[puzzle.difficulty] || 0) + solveTime;
    }
  }
  
  localStorage.setItem('hashi_stats', JSON.stringify(stats));
};

// Format time in a readable way
export const formatTime = (time: number): string => {
  if (!time || isNaN(time)) return "00h 00m 00s";
  
  const seconds = Math.floor((time / 1000) % 60);
  const minutes = Math.floor((time / (1000 * 60)) % 60);
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
  
  return `${hours > 0 ? hours + 'h ' : ''}${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
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

// Get game settings from local storage
export const getSettings = (): GameSettings => {
  const settings = localStorage.getItem('hashi_settings');
  return settings ? JSON.parse(settings) : {
    darkMode: false,
    soundEnabled: true,
    analyticsEnabled: true,
    showTimer: true
  };
};

// Save game settings to local storage
export const saveSettings = (settings: GameSettings): void => {
  localStorage.setItem('hashi_settings', JSON.stringify(settings));
  
  // Apply dark mode immediately
  document.documentElement.classList.toggle('dark', settings.darkMode);
};

// Check if this is the first time the user is playing
export const isFirstTimeUser = (): boolean => {
  const firstTimeFlag = localStorage.getItem('hashi_first_time');
  if (!firstTimeFlag) {
    localStorage.setItem('hashi_first_time', 'false');
    return true;
  }
  return false;
};

// Clear all local data
export const clearAllData = (): void => {
  const keys = [
    'hashi_stats',
    'hashi_game_history',
    'hashi_settings',
    'hashi_first_time'
  ];
  
  // Clear all game-specific items
  keys.forEach(key => localStorage.removeItem(key));
  
  // Clear all saved puzzles
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('puzzle_')) {
      localStorage.removeItem(key);
    }
  }
};

