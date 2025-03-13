import React from 'react';
import { GameControls } from './GameControls';
import { Puzzle } from '@/utils/gameLogic';

interface GameProps {
  puzzle: Puzzle;
  onPuzzleUpdate: (updatedPuzzle: Puzzle) => void;
}

// In your Game component:
const Game: React.FC<GameProps> = ({ puzzle, onPuzzleUpdate }) => {
  const handlePuzzleUpdate = (updatedPuzzle: Puzzle) => {
    onPuzzleUpdate(updatedPuzzle);
  };

  return (
    <div className="flex flex-col">
      <GameControls 
        puzzle={puzzle} 
        onPuzzleUpdate={handlePuzzleUpdate}
      />
      {/* Rest of your game board implementation */}
    </div>
  );
};

export default Game;
