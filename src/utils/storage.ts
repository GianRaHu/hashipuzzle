import { Puzzle } from './gameLogic';

// Save puzzle to local storage
export const savePuzzle = (puzzle: Puzzle): void => {
  localStorage.setItem(`puzzle_${puzzle.id}`, JSON.stringify(puzzle));
};

// Get saved puzzle from local storage
export const getSavedPuzzle = (id: string): Puzzle | null => {
  const savedPuzzle = localStorage.getItem(`puzzle_${id}`);
  return savedPuzzle ? JSON.parse(savedPuzzle) : null;
};

// Get game statistics from local storage
export const getStats = () => {
  const stats = localStorage.getItem('hashi_stats');
  return stats ? JSON.parse(stats) : { gamesPlayed: 0, dailyStreak: 0 };
};

// Update game statistics
export const updateStats = (puzzle: Puzzle) => {
  const stats = getStats();
  stats.gamesPlayed += 1;
  localStorage.setItem('hashi_stats', JSON.stringify(stats));
};

// Format time in a readable way
export const formatTime = (time: number): string => {
  const seconds = Math.floor((time / 1000) % 60);
  const minutes = Math.floor((time / (1000 * 60)) % 60);
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
  return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
};

// Check if the daily challenge is completed
export const isDailyCompleted = (): boolean => {
  const today = new Date().toISOString().split('T')[0];
  const lastCompleted = localStorage.getItem('daily_completed_date');
  return lastCompleted === today;
};

// Set the daily challenge as completed
export const setDailyCompleted = (): void => {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('daily_completed_date', today);
  
  // Update streak
  const stats = getStats();
  const lastStreakDate = localStorage.getItem('last_streak_date');
  const todayDate = new Date();
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (lastStreakDate === yesterday.toISOString().split('T')[0]) {
    // Continuing streak
    stats.dailyStreak += 1;
  } else if (lastStreakDate !== todayDate.toISOString().split('T')[0]) {
    // Broken streak, start new
    stats.dailyStreak = 1;
  }
  
  localStorage.setItem('last_streak_date', todayDate.toISOString().split('T')[0]);
  localStorage.setItem('hashi_stats', JSON.stringify(stats));
};
