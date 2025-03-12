import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { generatePuzzle, Puzzle, isSolved } from '@/utils/gameLogic';
import Board from '@/components/Board';
import Timer from '@/components/Timer';
import { saveCurrentGame, getCurrentGame, clearCurrentGame, updateStats } from '@/utils/storage';

const Game: React.FC = () => {
  const { difficulty = 'easy' } = useParams();
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);

  useEffect(() => {
    // Try to load existing game
    const savedPuzzle = getCurrentGame(difficulty);
    
    if (savedPuzzle) {
      setPuzzle(savedPuzzle);
    } else {
      // Create new puzzle if no saved game exists
      setPuzzle(generatePuzzle(difficulty));
    }
  }, [difficulty]);

  const handlePuzzleUpdate = (updatedPuzzle: Puzzle) => {
    const newPuzzle = { ...updatedPuzzle };
    
    // Check if puzzle is solved
    if (isSolved(newPuzzle)) {
      newPuzzle.endTime = Date.now();
      updateStats(newPuzzle);
      clearCurrentGame(difficulty); // Remove saved game when completed
    } else {
      // Save progress
      saveCurrentGame(newPuzzle);
    }
    
    setPuzzle(newPuzzle);
  };

  const handleNewGame = () => {
    if (window.confirm('Start a new game? Current progress will be lost.')) {
      clearCurrentGame(difficulty);
      setPuzzle(generatePuzzle(difficulty));
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back
          </Button>
          <h1 className="text-2xl font-semibold capitalize">
            {difficulty} Mode
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {puzzle?.startTime && !puzzle.endTime && (
            <Timer startTime={puzzle.startTime} />
          )}
          <Button onClick={handleNewGame}>
            New Game
          </Button>
        </div>
      </div>

      {puzzle && (
        <div className="flex justify-center">
          <Board puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
        </div>
      )}
    </div>
  );
};

export default Game;
