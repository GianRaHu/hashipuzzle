
import React from 'react';
import { GameControls } from './GameControls';
import Board from './Board';
import { Puzzle } from '@/utils/gameLogic';

interface GameProps {
  puzzle: Puzzle;
  onPuzzleUpdate: (updatedPuzzle: Puzzle) => void;
}

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
      <div className="mt-4">
        <Board puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
      </div>
    </div>
  );
};

export default Game;
