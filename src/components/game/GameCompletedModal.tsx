
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/utils/storage';
import { X, Trophy, Sparkles, Target, Clock } from 'lucide-react';

interface GameCompletedModalProps {
  time: number;
  resetPuzzle: () => void;
  seed?: number;
  onClose: () => void;
}

const GameCompletedModal: React.FC<GameCompletedModalProps> = ({ 
  time, 
  resetPuzzle,
  seed,
  onClose
}) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const getPerformanceMessage = (timeInSeconds: number) => {
    if (timeInSeconds < 60) return "Lightning fast! ⚡";
    if (timeInSeconds < 180) return "Great job! 🎯";
    if (timeInSeconds < 300) return "Well done! 👏";
    return "Completed! 🎉";
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-card p-8 rounded-2xl shadow-elegant max-w-sm w-full animate-scale-in text-center relative overflow-hidden">
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 w-2 h-2 bg-primary rounded-full animate-bounce" />
            <div className="absolute top-6 right-6 w-1 h-1 bg-success rounded-full animate-bounce delay-75" />
            <div className="absolute top-8 left-8 w-1.5 h-1.5 bg-warning rounded-full animate-bounce delay-150" />
            <div className="absolute top-3 right-3 w-1 h-1 bg-info rounded-full animate-bounce delay-300" />
          </div>
        )}

        <Button 
          onClick={onClose} 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2 text-muted-foreground hover:text-foreground z-10"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </Button>
        
        {/* Trophy Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Trophy className="h-16 w-16 text-primary animate-bounce-subtle" />
            <Sparkles className="h-6 w-6 text-warning absolute -top-1 -right-1 animate-pulse-subtle" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primaryGlow bg-clip-text text-transparent">
          Puzzle Completed!
        </h2>
        
        <p className="text-lg text-muted-foreground mb-1">
          {getPerformanceMessage(time / 1000)}
        </p>
        
        <div className="flex items-center justify-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-lg font-semibold">{formatTime(time)}</span>
        </div>
        
        {seed && (
          <p className="text-sm text-muted-foreground mb-6 bg-accent/50 px-3 py-1 rounded-full">
            Seed: {seed}
          </p>
        )}
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={resetPuzzle} 
            variant="premium"
            size="lg"
            className="w-full shadow-elegant"
          >
            <Target className="h-4 w-4 mr-2" />
            New Puzzle
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            size="lg"
            className="w-full"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameCompletedModal;
