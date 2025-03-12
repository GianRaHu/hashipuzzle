
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, CornerUpLeft, CornerUpRight, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/utils/storage';
import HelpDialog from './HelpDialog';

export interface GameHeaderProps {
  timer?: number;
  bestTime?: number;
  handleUndo?: () => void;
  handleRedo?: () => void;
  restartPuzzle?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  gameStarted?: boolean;
  title?: string;
  backUrl?: string;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  timer = 0,
  bestTime = 0,
  handleUndo,
  handleRedo,
  restartPuzzle,
  canUndo = false,
  canRedo = false,
  gameStarted = false,
  title,
  backUrl
}) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-background z-50 border-b border-border/10 shadow-sm">
      <div className="container flex justify-between items-center h-14 px-4 max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(backUrl || '/')}
          className="rounded-full"
          aria-label="Back to home"
        >
          <Home className="h-5 w-5" />
        </Button>
        
        {title && (
          <div className="font-medium">{title}</div>
        )}
        
        {timer > 0 && (
          <div className="flex gap-2 items-center text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span>{formatTime(timer)}</span>
            {bestTime > 0 && (
              <span className="text-muted-foreground text-xs">
                Best: {formatTime(bestTime)}
              </span>
            )}
          </div>
        )}
        
        {!title && (
          <div className="flex gap-1">
            {handleUndo && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleUndo}
                disabled={!canUndo}
                className="rounded-full h-8 w-8"
                aria-label="Undo"
              >
                <CornerUpLeft className="h-4 w-4" />
              </Button>
            )}
            
            {handleRedo && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRedo}
                disabled={!canRedo}
                className="rounded-full h-8 w-8"
                aria-label="Redo"
              >
                <CornerUpRight className="h-4 w-4" />
              </Button>
            )}
            
            {restartPuzzle && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={restartPuzzle}
                className="rounded-full h-8 w-8"
                aria-label="Restart puzzle"
                title="Restart with same layout"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            
            <HelpDialog />
          </div>
        )}
      </div>
    </header>
  );
};

export default GameHeader;
