
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Clock, 
  Target, 
  RotateCcw, 
  Home,
  Share2
} from 'lucide-react';
import { formatTime } from '@/utils/storage';

interface GameCompletionCardProps {
  time: number;
  bestTime?: number;
  difficulty: string;
  onRestart: () => void;
  onHome: () => void;
  seed?: number;
  achievements?: Array<{
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
  }>;
}

const GameCompletionCard: React.FC<GameCompletionCardProps> = ({
  time,
  bestTime,
  difficulty,
  onRestart,
  onHome,
  seed,
  achievements = []
}) => {
  const isNewBestTime = bestTime ? time < bestTime : true;
  const newlyUnlockedAchievements = achievements.filter(a => a.unlocked);
  
  const handleShare = async () => {
    const shareText = `I just completed a ${difficulty} Hashi puzzle in ${formatTime(time)}! ${seed ? `Seed: ${seed}` : ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hashi Puzzle Completed!',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback for browsers without native sharing
      navigator.clipboard?.writeText(shareText);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-background to-muted/50 border-2 border-primary/20 shadow-xl">
      <div className="p-6 text-center space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex justify-center">
            <Trophy className="h-12 w-12 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-primary">Puzzle Solved!</h2>
          <Badge variant="secondary" className="capitalize text-lg px-3 py-1">
            {difficulty}
          </Badge>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            <span className="font-mono font-bold">{formatTime(time)}</span>
            {isNewBestTime && (
              <Badge variant="destructive" className="text-xs">
                New Best!
              </Badge>
            )}
          </div>

          {bestTime && !isNewBestTime && (
            <div className="text-sm text-muted-foreground">
              Best: {formatTime(bestTime)}
            </div>
          )}

          {seed && (
            <div className="text-xs text-muted-foreground">
              Seed: {seed}
            </div>
          )}
        </div>

        {/* Achievements */}
        {newlyUnlockedAchievements.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              New Achievements
            </h3>
            <div className="space-y-2">
              {newlyUnlockedAchievements.slice(0, 3).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                >
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div className="text-left">
                    <div className="text-sm font-medium">{achievement.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {achievement.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={onRestart}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Play Again
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
          
          <Button
            onClick={onHome}
            className="w-full flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GameCompletionCard;
