
import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, RotateCcw, CheckCircle } from 'lucide-react';

interface GameControlsProps {
  onSolve: () => void;
  onUndo: () => void;
  onReset: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ onSolve, onUndo, onReset }) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onUndo}
        aria-label="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onReset}
        aria-label="Reset"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onSolve}
        aria-label="Check Solution"
        className="ml-auto"
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default GameControls;
