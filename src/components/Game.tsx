
import React from 'react';
import { Puzzle } from '@/utils/gameLogic';
import Board from '@/components/Board';

interface GameProps {
  puzzle: Puzzle;
  onPuzzleUpdate: (updatedPuzzle: Puzzle) => void;
}

const Game: React.FC<GameProps> = ({ puzzle, onPuzzleUpdate }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <Board puzzle={puzzle} onUpdate={onPuzzleUpdate} />
    </div>
  );
};

export default Game;
