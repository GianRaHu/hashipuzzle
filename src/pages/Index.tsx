
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, Settings, HelpCircle, Clock, Star, Zap, Target, Award } from 'lucide-react';
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
        <div className="relative mb-4">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-br from-primary to-primaryGlow bg-clip-text text-transparent animate-pulse-soft">
            Hashi
          </h1>
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 blur-xl -z-10 animate-pulse-subtle" />
        </div>
        <p className="text-lg text-foreground mb-2 font-medium">The Bridge Puzzle Game</p>
        <p className="text-sm text-muted-foreground/80 max-w-xs mx-auto">
          Connect islands with bridges using logic and strategy
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button 
          variant="premium" 
          size="xl"
          className="h-16 flex flex-col gap-1 shadow-elegant"
          onClick={() => navigate('/custom')}
        >
          <Zap className="h-6 w-6" />
          <span className="text-sm font-medium">Quick Play</span>
        </Button>
        <Button 
          variant="outline" 
          size="xl"
          className="h-16 flex flex-col gap-1 hover:shadow-elegant transition-all duration-300"
          onClick={() => setShowTutorial(true)}
        >
          <Target className="h-6 w-6" />
          <span className="text-sm font-medium">Tutorial</span>
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
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:border-primary/50 group relative overflow-hidden"
              onClick={() => handleDifficultySelect(difficulty)}
            >
              <CardContent className="p-4 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
        <Card className="mb-6 bg-gradient-to-br from-card to-accent/30 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center p-3 rounded-lg bg-primary/5">
                <div className="text-2xl font-bold text-primary animate-bounce-subtle">{stats.gamesPlayed}</div>
                <div className="text-xs text-muted-foreground">Games Played</div>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-success/5">
                <div className="text-2xl font-bold text-success animate-bounce-subtle">{stats.gamesWon}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-info/5">
                <div className="text-2xl font-bold text-info animate-bounce-subtle">
                  {Math.round((stats.gamesWon / Math.max(stats.gamesPlayed, 1)) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Tutorial Modal */}
      <FirstTimeTutorial
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
};

export default Index;
