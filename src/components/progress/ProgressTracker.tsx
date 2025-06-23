
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Clock, Target, Zap, Award } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface ProgressTrackerProps {
  stats: any;
  achievements: Achievement[];
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ stats, achievements }) => {
  const totalXP = Object.values(stats.difficultyGamesPlayed || {}).reduce((acc: number, curr: any) => acc + (curr * 10), 0);
  const currentLevel = Math.floor(totalXP / 100) + 1;
  const xpToNextLevel = 100 - (totalXP % 100);
  const levelProgress = (totalXP % 100);

  const recentAchievements = achievements.filter(a => a.unlocked).slice(-3);

  return (
    <div className="space-y-4">
      {/* Level Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Level {currentLevel}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP: {totalXP}</span>
              <span>{xpToNextLevel} to next level</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="text-amber-500">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">New!</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{stats.gamesWon || 0}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%
              </div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Achievements ({achievements.filter(a => a.unlocked).length}/{achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress 
            value={(achievements.filter(a => a.unlocked).length / achievements.length) * 100} 
            className="h-2"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracker;
