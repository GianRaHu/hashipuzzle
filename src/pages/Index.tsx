
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DifficultySelector from '../components/DifficultySelector';
import { isDailyCompleted, getStats } from '../utils/storage';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const stats = getStats();
  const dailyCompleted = isDailyCompleted();
  
  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master') => {
    navigate(`/game/${difficulty}`);
  };

  return (
    <div className="content-container max-w-4xl animate-fade-in page-transition">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-medium mb-2">Hashi Puzzle</h1>
        <p className="text-foreground/70">Connect the islands with bridges</p>
      </div>
      
      <div className="grid md:grid-cols-7 gap-4 mb-8">
        <div className="md:col-span-4">
          <div className="p-4 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-medium mb-6">Play a New Game</h2>
            <DifficultySelector onSelect={handleDifficultySelect} />
          </div>
        </div>
        
        <div className="md:col-span-3 space-y-4">
          <div className="p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-medium">Daily Challenge</h2>
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            
            <p className="text-sm text-foreground/70 mb-3">
              {dailyCompleted
                ? "You've completed today's challenge!"
                : "Play today's unique puzzle."}
            </p>
            
            <Button 
              onClick={() => navigate('/daily')} 
              className="w-full"
              variant={dailyCompleted ? "outline" : "default"}
            >
              {dailyCompleted ? "Play Again" : "Play Daily Challenge"}
            </Button>
          </div>
          
          <div className="p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-medium">Your Stats</h2>
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm text-foreground/70">Games Played</p>
                <p className="text-2xl font-medium">{stats.gamesPlayed}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Daily Streak</p>
                <p className="text-2xl font-medium">{stats.dailyStreak}</p>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/stats')} 
              variant="outline"
              className="w-full"
            >
              View All Stats
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
