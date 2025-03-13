import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Puzzle } from '@/utils/gameLogic';
import { savePuzzleToLovable, loadPuzzleFromLovable } from '@/utils/lovable';
import Board from '@/components/Board';
import GameHeader from '@/components/game/GameHeader';
import { getStats } from '@/utils/storage';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const stats = getStats();

  useEffect(() => {
    const loadGame = async () => {
      // Try to load from location state first (for custom games)
      if (location.state?.puzzle) {
        setPuzzle(location.state.puzzle);
        savePuzzleToLovable(location.state.puzzle);
        return;
      }

      // Try to load from Lovable
      const savedPuzzle = await loadPuzzleFromLovable();
      if (savedPuzzle) {
        setPuzzle(savedPuzzle);
      }
    };

    loadGame();
  }, [location.state]);

  useEffect(() => {
    if (!puzzle?.startTime || puzzle.endTime) return;

    const interval = setInterval(() => {
      setTimer(Date.now() - puzzle.startTime!);
    }, 1000);

    return () => clearInterval(interval);
  }, [puzzle]);

  const handlePuzzleUpdate = (updatedPuzzle: Puzzle) => {
    setPuzzle(updatedPuzzle);
    savePuzzleToLovable(updatedPuzzle);
  };

  const handleUndo = () => {
    if (!puzzle) return;
    // Implement undo logic
  };

  const handleRestart = () => {
    if (!puzzle) return;
    const newPuzzle = {
      ...puzzle,
      bridges: [],
      moveHistory: [],
      startTime: Date.now(),
      endTime: undefined
    };
    setPuzzle(newPuzzle);
    savePuzzleToLovable(newPuzzle);
  };

  if (!puzzle) return null;

  return (
    <div className="min-h-screen bg-background">
      <GameHeader
        timer={timer}
        bestTime={stats.bestTime[puzzle.difficulty || 'custom'] || 0}
        handleUndo={handleUndo}
        restartPuzzle={handleRestart}
        canUndo={puzzle.moveHistory.length > 0}
      />

      <main className="container max-w-4xl mx-auto pt-20 p-4">
        <div className="flex justify-center">
          <Board puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
        </div>
      </main>
    </div>
  );
};

export default Game;
