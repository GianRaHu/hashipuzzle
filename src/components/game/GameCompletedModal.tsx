
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/utils/storage';
import { X } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-sm w-full animate-scale-in text-center relative">
        <Button 
          onClick={onClose} 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <h2 className="text-xl font-medium mb-2">Puzzle Completed!</h2>
        <p className="mb-2">Time: {formatTime(time)}</p>
        {seed && <p className="text-sm text-muted-foreground mb-4">Seed: {seed}</p>}
        
        <div className="flex justify-center space-x-3">
          <Button onClick={resetPuzzle} variant="outline">
            New Puzzle
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            variant="default"
            className="bg-gameAccent hover:bg-gameAccent/90"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameCompletedModal;
