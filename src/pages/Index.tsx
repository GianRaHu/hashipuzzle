
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, Settings, HelpCircle, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { difficultySettings, difficultyRewards } from '../utils/difficultySettings';
import { getStats, isFirstTimeUser } from '../utils/storage';
import FirstTimeTutorial from '@/components/tutorial/FirstTimeTutorial';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const [stats, setStats] = useState(getStats());
  
  useEffect(() => {
    if (isFirstTimeUser()) {
      setShowTutorial(true);
    }
    setStats(getStats());
  }, []);

  const handleDifficultySelect = (difficulty: string) => {
    navigate(`/game/${difficulty}`);
  };

  const getDifficultyProgress = (difficulty: string) => {
    const gamesPlayed = stats.difficultyGamesPlayed?.[difficulty] || 0;
    const bestTime = stats.bestTime[difficulty];
    return { gamesPlayed, bestTime };
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="content-container max-w-lg mx-auto animate-fade-in page-transition">
      {/* Hero Section */}
      <div className="text-center mb-8 px-4">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
          Hashi
        </h1>
        <p className="text-lg text-muted-foreground mb-2">The Bridge Puzzle Game</p>
        <p className="text-sm text-muted-foreground/80">
          Connect islands with bridges using logic and strategy
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button 
          variant="default" 
          className="h-14 flex flex-col gap-1"
          onClick={() => navigate('/custom')}
        >
          <Play className="h-5 w-5" />
          <span className="text-sm">Quick Play</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-14 flex flex-col gap-1"
          onClick={() => setShowTutorial(true)}
        >
          <HelpCircle className="h-5 w-5" />
          <span className="text-sm">Tutorial</span>
        </Button>
      </div>

      {/* Difficulty Selection */}
      <div className="space-y-3 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Choose Difficulty
        </h2>
        
        {Object.entries(difficultySettings).map(([difficulty, settings]) => {
          const progress = getDifficultyProgress(difficulty);
          const rewards = difficultyRewards[difficulty as keyof typeof difficultyRewards];
          
          return (
            <Card 
              key={difficulty}
              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => handleDifficultySelect(difficulty)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      difficulty === 'easy' ? 'bg-green-500' :
                      difficulty === 'medium' ? 'bg-yellow-500' :
                      difficulty === 'hard' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`} />
                    <h3 className="font-semibold capitalize text-lg">{difficulty}</h3>
                  </div>
                  {progress.gamesPlayed > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {progress.gamesPlayed} played
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {settings.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {settings.estimatedTime}
                    </span>
                    <span>{settings.size.rows}×{settings.size.cols}</span>
                  </div>
                  
                  {progress.bestTime && (
                    <div className="flex items-center gap-1 text-primary">
                      <Star className="h-3 w-3" />
                      <span>{formatTime(progress.bestTime)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Overview */}
      {stats.gamesPlayed > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{stats.gamesPlayed}</div>
                <div className="text-xs text-muted-foreground">Games Played</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.gamesWon}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((stats.gamesWon / Math.max(stats.gamesPlayed, 1)) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Navigation Hints */}
      <div className="flex justify-center gap-6 text-xs text-muted-foreground mb-4">
        <button onClick={() => navigate('/stats')} className="flex flex-col items-center gap-1 hover:text-foreground transition-colors">
          <Trophy className="h-4 w-4" />
          <span>Stats</span>
        </button>
        <button onClick={() => navigate('/settings')} className="flex flex-col items-center gap-1 hover:text-foreground transition-colors">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* Tutorial Modal */}
      <FirstTimeTutorial
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
};

export default Index;
