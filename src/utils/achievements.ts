
import { Trophy, Star, Clock, Target, Zap, Award, Medal, Crown } from 'lucide-react';
import { GameStats } from './storage';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  category: 'gameplay' | 'skill' | 'time' | 'dedication';
}

// Check if an achievement should be unlocked based on current stats
export const checkAchievements = (stats: GameStats): Achievement[] => {
  const achievements: Achievement[] = [
    // Gameplay achievements
    {
      id: 'first_win',
      name: 'First Victory',
      description: 'Complete your first puzzle',
      icon: Trophy,
      unlocked: (stats.gamesWon || 0) >= 1,
      category: 'gameplay'
    },
    {
      id: 'ten_wins',
      name: 'Puzzle Solver',
      description: 'Complete 10 puzzles',
      icon: Medal,
      unlocked: (stats.gamesWon || 0) >= 10,
      progress: Math.min(stats.gamesWon || 0, 10),
      maxProgress: 10,
      category: 'gameplay'
    },
    {
      id: 'fifty_wins',
      name: 'Bridge Master',
      description: 'Complete 50 puzzles',
      icon: Crown,
      unlocked: (stats.gamesWon || 0) >= 50,
      progress: Math.min(stats.gamesWon || 0, 50),
      maxProgress: 50,
      category: 'gameplay'
    },
    
    // Skill achievements
    {
      id: 'perfect_easy',
      name: 'Easy Mastery',
      description: 'Complete 5 easy puzzles',
      icon: Star,
      unlocked: (stats.difficultyGamesPlayed?.easy || 0) >= 5,
      progress: Math.min(stats.difficultyGamesPlayed?.easy || 0, 5),
      maxProgress: 5,
      category: 'skill'
    },
    {
      id: 'perfect_medium',
      name: 'Medium Mastery',
      description: 'Complete 5 medium puzzles',
      icon: Target,
      unlocked: (stats.difficultyGamesPlayed?.medium || 0) >= 5,
      progress: Math.min(stats.difficultyGamesPlayed?.medium || 0, 5),
      maxProgress: 5,
      category: 'skill'
    },
    {
      id: 'perfect_hard',
      name: 'Hard Mastery',
      description: 'Complete 5 hard puzzles',
      icon: Zap,
      unlocked: (stats.difficultyGamesPlayed?.hard || 0) >= 5,
      progress: Math.min(stats.difficultyGamesPlayed?.hard || 0, 5),
      maxProgress: 5,
      category: 'skill'
    },
    {
      id: 'expert_solver',
      name: 'Expert Solver',
      description: 'Complete an expert puzzle',
      icon: Award,
      unlocked: (stats.difficultyGamesPlayed?.expert || 0) >= 1,
      category: 'skill'
    },
    
    // Time achievements
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete an easy puzzle in under 2 minutes',
      icon: Clock,
      unlocked: (stats.bestTime?.easy || Infinity) < 120000, // 2 minutes in ms
      category: 'time'
    },
    
    // Dedication achievements
    {
      id: 'dedicated_player',
      name: 'Dedicated Player',
      description: 'Play 25 games',
      icon: Medal,
      unlocked: (stats.gamesPlayed || 0) >= 25,
      progress: Math.min(stats.gamesPlayed || 0, 25),
      maxProgress: 25,
      category: 'dedication'
    }
  ];

  return achievements;
};

// Get newly unlocked achievements by comparing with previous state
export const getNewlyUnlockedAchievements = (
  currentAchievements: Achievement[],
  previouslyUnlocked: string[]
): Achievement[] => {
  return currentAchievements.filter(
    achievement => achievement.unlocked && !previouslyUnlocked.includes(achievement.id)
  );
};

// Save unlocked achievements to localStorage
export const saveUnlockedAchievements = (achievements: Achievement[]): void => {
  const unlockedIds = achievements.filter(a => a.unlocked).map(a => a.id);
  localStorage.setItem('hashi_unlocked_achievements', JSON.stringify(unlockedIds));
};

// Get previously unlocked achievements from localStorage
export const getUnlockedAchievements = (): string[] => {
  const stored = localStorage.getItem('hashi_unlocked_achievements');
  return stored ? JSON.parse(stored) : [];
};
