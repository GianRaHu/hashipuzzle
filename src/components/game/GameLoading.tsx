
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Puzzle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EnhancedLoadingSpinner from '@/components/enhanced/EnhancedLoadingSpinner';

interface GameLoadingProps {
  difficulty: string;
  loadingProgress: number;
  generateError: boolean;
}

const GameLoading: React.FC<GameLoadingProps> = ({
  difficulty,
  loadingProgress,
  generateError
}) => {
  const getLoadingMessage = (progress: number) => {
    if (progress < 20) return "Initializing puzzle...";
    if (progress < 40) return "Placing islands...";
    if (progress < 60) return "Calculating connections...";
    if (progress < 80) return "Optimizing layout...";
    if (progress < 100) return "Finalizing puzzle...";
    return "Almost ready!";
  };

  if (generateError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="bg-destructive/10 p-4 rounded-full mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Generation Failed</h1>
          <p className="text-muted-foreground mb-6">
            Unable to generate a {difficulty} puzzle. Please try again.
          </p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="flex flex-col items-center text-center max-w-md">
        {/* Puzzle icon with animation */}
        <div className="mb-6 relative">
          <Puzzle className="h-16 w-16 text-primary animate-pulse-subtle" />
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold capitalize mb-2 bg-gradient-to-r from-primary to-primaryGlow bg-clip-text text-transparent">
          {difficulty} Puzzle
        </h1>
        
        <div className="w-full space-y-6">
          <EnhancedLoadingSpinner 
            size="lg"
            message={getLoadingMessage(loadingProgress)}
            progress={loadingProgress}
          />
          
          {/* Fun facts while loading */}
          <div className="bg-accent/50 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 Tip: Each island must have exactly the number of bridges shown on it!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLoading;
