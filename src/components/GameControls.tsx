import React from 'react';
import { Button } from '@/components/ui/button';
import { undoLastMove, Puzzle } from '@/utils/gameLogic';
import { UndoIcon } from 'lucide-react';

interface GameControlsProps {
  puzzle: Puzzle;
  onPuzzleUpdate: (puzzle: Puzzle) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({ 
  puzzle, 
  onPuzzleUpdate 
}) => {
  const handleUndo = () => {
    const updatedPuzzle = undoLastMove(puzzle);
    onPuzzleUpdate(updatedPuzzle);
  };

  return (
    <div className="flex gap-2 justify-center items-center p-4">
      <Button
        onClick={handleUndo}
        disabled={!puzzle.moveHistory?.length}
        variant="outline"
        size="icon"
        className="w-10 h-10"
        title="Undo last move"
      >
        <UndoIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default GameControls;
