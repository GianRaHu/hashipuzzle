import { Puzzle } from './gameLogic';
import { format, differenceInDays } from 'date-fns';

// Type for game statistics
export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  dailyStreak: number;
  lastPlayed: string;
  bestTime: {
    easy?: number;
    medium?: number;
    hard?: number;
    expert?: number;
  };
  averageTime: {
    easy?: number;
    medium?: number;
    hard?: number;
    expert?: number;
  };
  movesPerGame: {
    easy?: number;
    medium?: number;
    hard?: number;
    expert?: number;
  };
  averageThinkingTime: {
    easy?: number;
    medium?: number;
    hard?: number;
    expert?: number;
  };
}

// Format time in mm:ss format
export const formatTime = (ms: number): string => {
  if (!ms) return '00:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Format time in relative format (e.g., "2 hours ago")
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
};

// Save current game progress
export const saveCurrentGame = (puzzle: Puzzle): void => {
  const gameKey = `hashi_current_game_${puzzle.difficulty}`;
  localStorage.setItem(gameKey, JSON.stringify({
    ...puzzle,
    lastPlayed: Date.now()
  }));
};

// Get current game if it exists
export const getCurrentGame = (difficulty: string): Puzzle | null => {
  const gameKey = `hashi_current_game_${difficulty}`;
  const savedGame = localStorage.getItem(gameKey);
  
  if (savedGame) {
    return JSON.parse(savedGame);
  }
  
  return null;
};

// Clear current game when completed
export const clearCurrentGame = (difficulty: string): void => {
  const gameKey = `hashi_current_game_${difficulty}`;
  localStorage.removeItem(gameKey);
};

// Update game statistics
export const updateStats = (puzzle: Puzzle): void => {
  if (!puzzle.startTime || !puzzle.endTime) return;
  
  const playTime = puzzle.endTime - puzzle.startTime;
  const statsKey = 'hashi_stats';
  
  // Get existing stats or create new
  const existingStats = localStorage.getItem(statsKey);
  const stats: GameStats = existingStats ? JSON.parse(existingStats) : {
    gamesPlayed: 0,
    gamesWon: 0,
    dailyStreak: 0,
    lastPlayed: '',
    bestTime: {},
    averageTime: {},
    movesPerGame: {},
    averageThinkingTime: {}
  };
  
  // Update stats
  stats.gamesPlayed++;
  stats.gamesWon++;
  stats.lastPlayed = new Date().toISOString();
  
  // Update best time if this is better
  const difficulty = puzzle.difficulty as keyof GameStats['bestTime'];
  const currentBest = stats.bestTime[difficulty];
  if (!currentBest || playTime < currentBest) {
    stats.bestTime[difficulty] = playTime;
  }
  
  // Update average time
  const currentAverage = stats.averageTime[difficulty];
  if (currentAverage) {
    stats.averageTime[difficulty] = Math.round((currentAverage + playTime) / 2);
  } else {
    stats.averageTime[difficulty] = playTime;
  }
  
  // Update moves per game
  const currentMoves = stats.movesPerGame[difficulty];
  const movesMade = puzzle.moveHistory ? puzzle.moveHistory.length : 0;
  if (currentMoves) {
    stats.movesPerGame[difficulty] = ((currentMoves + movesMade) / 2);
  } else {
    stats.movesPerGame[difficulty] = movesMade;
  }
  
  // Save updated stats
  localStorage.setItem(statsKey, JSON.stringify(stats));
  
  // Save to game history
  saveToGameHistory(puzzle);
};

// Save completed game to history
const saveToGameHistory = (puzzle: Puzzle): void => {
  const historyKey = 'hashi_game_history';
  const existingHistory = localStorage.getItem(historyKey);
  const history = existingHistory ? JSON.parse(existingHistory) : [];
  
  history.unshift({
    seed: puzzle.seed,
    difficulty: puzzle.difficulty,
    date: new Date().toISOString()
  });
  
  // Keep history limited to last 20 games
  const limitedHistory = history.slice(0, 20);
  localStorage.setItem(historyKey, JSON.stringify(limitedHistory));
};

// Get all stats
export const getStats = (): GameStats => {
  const statsKey = 'hashi_stats';
  const stats = localStorage.getItem(statsKey);
  
  return stats ? JSON.parse(stats) : {
    gamesPlayed: 0,
    gamesWon: 0,
    dailyStreak: 0,
    lastPlayed: '',
    bestTime: {},
    averageTime: {},
    movesPerGame: {},
    averageThinkingTime: {}
  };
};

// Check if daily challenge is completed
export const isDailyCompleted = (date: Date): boolean => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const completedKey = `hashi_daily_completed_${dateStr}`;
  return localStorage.getItem(completedKey) === 'true';
};

// Mark daily challenge as completed
export const setDailyCompleted = (date: Date): void => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const completedKey = `hashi_daily_completed_${dateStr}`;
  localStorage.setItem(completedKey, 'true');
  
  // Update daily streak
  updateDailyStreak();
};

// Update daily streak
const updateDailyStreak = (): void => {
  const statsKey = 'hashi_stats';
  const existingStats = localStorage.getItem(statsKey);
  
  if (!existingStats) return;
  
  const stats: GameStats = JSON.parse(existingStats);
  const lastPlayedDate = stats.lastPlayed ? new Date(stats.lastPlayed) : null;
  const today = new Date();
  
  if (!lastPlayedDate) {
    // First time playing
    stats.dailyStreak = 1;
  } else {
    // Check if played yesterday to maintain streak
    const dayDifference = differenceInDays(today, lastPlayedDate);
    
    if (dayDifference === 1) {
      // Played yesterday, increment streak
      stats.dailyStreak++;
    } else if (dayDifference > 1) {
      // Missed a day, reset streak
      stats.dailyStreak = 1;
    }
    // if dayDifference === 0, played today already, don't change streak
  }
  
  stats.lastPlayed = today.toISOString();
  localStorage.setItem(statsKey, JSON.stringify(stats));
};
