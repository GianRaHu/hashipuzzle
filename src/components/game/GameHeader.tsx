
import React from 'react';
import { formatTime } from '@/utils/time';
import { Button } from '@/components/ui/button';
import { X, Home, RotateCcw, Undo, HelpCircle } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';
import HelpDialog from './HelpDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type GameHeaderProps = {
  timer: number;
  bestTime: number;
  handleUndo: () => void;
  restartPuzzle: () => void;
  setShowRestartDialog: (show: boolean) => void;
  showRestartDialog: boolean;
  canUndo: boolean;
  gameStarted: boolean;
  onShowHelp?: () => void;
};

const GameHeader: React.FC<GameHeaderProps> = ({
  timer,
  bestTime, 
  handleUndo,
  restartPuzzle,
  setShowRestartDialog,
  showRestartDialog,
  canUndo,
  gameStarted,
  onShowHelp
}) => {
  return (
    <header className="game-header h-14 px-4 flex items-center justify-between">
      <Link to="/">
        <Button variant="ghost" size="icon" aria-label="Home">
          <Home className="h-5 w-5" />
        </Button>
      </Link>
      
      <div className="flex-1 px-4">
        <div className="flex flex-col md:flex-row items-center justify-center text-xs md:text-sm gap-1 md:gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Time:</span> 
            <span className="tabular-nums">{formatTime(timer)}</span>
          </div>
          
          {bestTime > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Best:</span>
              <span className="tabular-nums">{formatTime(bestTime)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleUndo} 
                disabled={!canUndo}
                className="h-8 w-8 rounded-full" 
                aria-label="Undo"
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo last move</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowRestartDialog(true)} 
                className="h-8 w-8 rounded-full" 
                aria-label="Restart"
                disabled={!gameStarted}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Restart puzzle</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Show our help dialog */}
        {onShowHelp ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onShowHelp}
                  className="h-8 w-8 rounded-full" 
                  aria-label="Tutorial"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show tutorial</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <HelpDialog />
        )}
      </div>
      
      <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <AlertDialogContent className="max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Restart Puzzle?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all bridges and reset the timer. Your progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={restartPuzzle}>Restart</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default GameHeader;
