import React, { useEffect, useState } from 'react';
import { Trophy, Star, Zap, Target, Award, Medal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
}

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);
    
    // Auto-close after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-slate-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  const IconComponent = achievement.icon;

  return (
    <div 
      className={`
        fixed top-20 right-4 z-[60] 
        bg-card border border-primary/20 rounded-lg shadow-elegant p-4 max-w-sm
        transform transition-all duration-500 ease-out
        ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`${getRarityColor(achievement.rarity)} p-2 rounded-full`}>
          <IconComponent className="h-5 w-5 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm">Achievement Unlocked!</h3>
            <Badge variant="secondary" className="text-xs">
              {achievement.rarity}
            </Badge>
          </div>
          
          <h4 className="font-medium text-primary mb-1">{achievement.title}</h4>
          <p className="text-xs text-muted-foreground">{achievement.description}</p>
        </div>
      </div>
      
      {/* Sparkle animation */}
      <div className="absolute -top-1 -right-1">
        <Star className="h-4 w-4 text-warning animate-pulse" />
      </div>
    </div>
  );
};

export default AchievementToast;

// Achievement definitions
export const achievements: Achievement[] = [
  {
    id: 'first_completion',
    title: 'First Success',
    description: 'Complete your first puzzle',
    icon: Trophy,
    rarity: 'common',
    unlocked: false,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a puzzle in under 30 seconds',
    icon: Zap,
    rarity: 'rare',
    unlocked: false,
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete 10 puzzles without using undo',
    icon: Target,
    rarity: 'epic',
    unlocked: false,
  },
  {
    id: 'marathon_runner',
    title: 'Marathon Runner',
    description: 'Complete 50 puzzles',
    icon: Medal,
    rarity: 'epic',
    unlocked: false,
  },
  {
    id: 'master_solver',
    title: 'Master Solver',
    description: 'Complete all difficulty levels',
    icon: Award,
    rarity: 'legendary',
    unlocked: false,
  },
];

// Achievement checking functions
export const checkAchievements = (stats: any, gameData: any): Achievement[] => {
  const newAchievements: Achievement[] = [];
  
  // Check first completion
  if (stats.gamesWon >= 1 && !achievements.find(a => a.id === 'first_completion')?.unlocked) {
    newAchievements.push({
      ...achievements.find(a => a.id === 'first_completion')!,
      unlocked: true,
      unlockedAt: new Date(),
    });
  }
  
  // Check speed demon (30 seconds)
  if (gameData.completionTime && gameData.completionTime < 30000) {
    const speedAchievement = achievements.find(a => a.id === 'speed_demon');
    if (speedAchievement && !speedAchievement.unlocked) {
      newAchievements.push({
        ...speedAchievement,
        unlocked: true,
        unlockedAt: new Date(),
      });
    }
  }
  
  // Check marathon runner
  if (stats.gamesWon >= 50) {
    const marathonAchievement = achievements.find(a => a.id === 'marathon_runner');
    if (marathonAchievement && !marathonAchievement.unlocked) {
      newAchievements.push({
        ...marathonAchievement,
        unlocked: true,
        unlockedAt: new Date(),
      });
    }
  }
  
  return newAchievements;
};