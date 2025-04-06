
import React from 'react';
import { Progress } from '@/components/ui/progress';

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
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <h1 className="text-lg font-medium capitalize mb-8">{difficulty} Puzzle</h1>
      <div className="w-full max-w-md space-y-4">
        <Progress value={loadingProgress} className="h-2 w-full" />
        <p className="text-center text-sm text-muted-foreground">
          {generateError ? "Error generating puzzle..." : "Generating puzzle..."}
        </p>
      </div>
    </div>
  );
};

export default GameLoading;
