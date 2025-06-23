
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Clock, RotateCcw, Home, Play, Share2, Award } from 'lucide-react';
import { formatTime } from '@/utils/storage';
import { Achievement } from '@/utils/achievements';
import ProgressTracker from '@/components/progress/ProgressTracker';

interface GameCompletionCardProps {
  difficulty: string;
  solveTime: number;
  isNewBestTime: boolean;
  newlyUnlockedAchievements: Achievement[];
  stats: any;
  achievements: Achievement[];
  onPlayAgain: () => void;
  onGoHome: () => void;
  onNewPuzzle: () => void;
}

const GameCompletionCard: React.FC<GameCompletionCardProps> = ({
  difficulty,
  solveTime,
  isNewBestTime,
  newlyUnlockedAchievements,
  stats,
  achievements,
  onPlayAgain,
  onGoHome,
  onNewPuzzle
}) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    const shareText = `I just completed a ${difficulty} Hashi puzzle in ${formatTime(solveTime)}! 🧩✨`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Hashi Puzzle Completed!',
          text: shareText,
          url: window.location.origin
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        // Could show a toast here
      }
    } catch (error) {
      console.log('Sharing failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Simple confetti animation with CSS */}
          <div className="confetti-animation">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="confetti-piece" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)]
              }} />
            ))}
          </div>
        </div>
      )}

      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in">
        <CardHeader className="text-center pb-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-3">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-xl">Puzzle Completed! 🎉</CardTitle>
          <div className="space-y-2">
            <Badge variant="secondary" className="capitalize font-medium">
              {difficulty}
            </Badge>
            <div className="flex items-center justify-center gap-2 text-lg font-mono">
              <Clock className="h-5 w-5" />
              {formatTime(solveTime)}
              {isNewBestTime && (
                <Badge variant="default" className="ml-2">
                  <Star className="h-3 w-3 mr-1" />
                  New Best!
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
              <TabsTrigger value="achievements" className="text-xs">
                Rewards
                {newlyUnlockedAchievements.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                    {newlyUnlockedAchievements.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="progress" className="text-xs">Progress</TabsTrigger>
            </TabsList>

            <div className="max-h-60 overflow-y-auto">
              <TabsContent value="summary" className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{stats.gamesWon || 0}</div>
                    <div className="text-xs text-muted-foreground">Total Wins</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">Success Rate</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Experience Gained</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>+{difficulty === 'easy' ? 10 : difficulty === 'medium' ? 25 : difficulty === 'hard' ? 50 : 100} XP</span>
                        <span>Level {Math.floor(((stats.difficultyGamesPlayed ? Object.values(stats.difficultyGamesPlayed).reduce((a: number, b: any) => a + (Number(b) * 10), 0) : 0)) / 100) + 1}</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="achievements" className="p-4">
                {newlyUnlockedAchievements.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      New Achievements!
                    </h4>
                    {newlyUnlockedAchievements.map((achievement) => (
                      <div key={achievement.id} className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-3">
                          <div className="text-amber-600">
                            <achievement.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{achievement.name}</p>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No new achievements this time</p>
                    <p className="text-xs">Keep playing to unlock more!</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="progress" className="p-4">
                <ProgressTracker stats={stats} achievements={achievements} />
              </TabsContent>
            </div>
          </Tabs>

          {/* Action Buttons */}
          <div className="p-4 border-t space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={onPlayAgain} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Play Again
              </Button>
              <Button variant="outline" onClick={onNewPuzzle} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                New Puzzle
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="ghost" onClick={onGoHome} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s linear infinite;
        }

        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default GameCompletionCard;
