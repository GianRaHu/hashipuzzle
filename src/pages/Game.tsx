
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Puzzle } from '../utils/gameLogic';
import { generatePuzzle } from '../utils/puzzleGenerator';
import { savePuzzle, updateStats, getStats } from '../utils/storage';
import { useToast } from '@/hooks/use-toast';

import Board from '../components/Board';
import GameHeader from '../components/game/GameHeader';
import GameCompletedModal from '../components/game/GameCompletedModal';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { difficulty } = useParams<{ difficulty: string }>();
  
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<Puzzle[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const stats = getStats();
  
  // Validate difficulty
  const validDifficulties = ['easy', 'medium', 'hard', 'expert', 'master'];
  const validDifficulty = validDifficulties.includes(difficulty || '') 
    ? difficulty as 'easy' | 'medium' | 'hard' | 'expert' | 'master' 
    : 'easy';
  
  // Generate a new puzzle when component mounts or difficulty changes
  useEffect(() => {
    if (validDifficulty) {
      console.log(`Generating new puzzle with difficulty: ${validDifficulty}`);
      const newPuzzle = generatePuzzle(validDifficulty);
      setPuzzle(newPuzzle);
      setMoveHistory([newPuzzle]);
      setCurrentMoveIndex(0);
      setGameCompleted(false);
      console.log(`Generated puzzle with seed: ${newPuzzle.seed}`);
    }
  }, [validDifficulty]);
  
  // Update timer
  useEffect(() => {
    if (!puzzle || gameCompleted) return;
    
    const interval = setInterval(() => {
      setTimer(Date.now() - puzzle.startTime!);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [puzzle, gameCompleted]);
  
  // Handle puzzle updates
  const handlePuzzleUpdate = useCallback((updatedPuzzle: Puzzle) => {
    setPuzzle(updatedPuzzle);
    
    // Add to move history, truncating any "future" moves if we're undoing
    const newHistory = [...moveHistory.slice(0, currentMoveIndex + 1), updatedPuzzle];
    setMoveHistory(newHistory);
    setCurrentMoveIndex(newHistory.length - 1);
    
    // Check if puzzle is solved
    if (updatedPuzzle.solved && !gameCompleted) {
      setGameCompleted(true);
      savePuzzle(updatedPuzzle);
      updateStats(updatedPuzzle);
      
      toast({
        title: "Puzzle solved!",
        description: `You completed the ${difficulty} puzzle in ${updatedPuzzle.endTime! - updatedPuzzle.startTime!}`,
        duration: 5000,
      });
    }
  }, [currentMoveIndex, difficulty, gameCompleted, moveHistory, toast]);
  
  // Reset the puzzle with a new seed
  const resetPuzzle = () => {
    if (validDifficulty) {
      const newPuzzle = generatePuzzle(validDifficulty);
      setPuzzle(newPuzzle);
      setGameCompleted(false);
      setMoveHistory([newPuzzle]);
      setCurrentMoveIndex(0);
      console.log(`Generated new puzzle with seed: ${newPuzzle.seed}`);
    }
  };
  
  // Reset the puzzle with the same seed
  const restartPuzzle = () => {
    if (validDifficulty && puzzle?.seed) {
      const newPuzzle = generatePuzzle(validDifficulty, puzzle.seed);
      setPuzzle(newPuzzle);
      setGameCompleted(false);
      setMoveHistory([newPuzzle]);
      setCurrentMoveIndex(0);
      console.log(`Restarted puzzle with seed: ${newPuzzle.seed}`);
    }
  };

  // Undo move
  const handleUndo = useCallback(() => {
    if (currentMoveIndex > 0) {
      const previousMove = moveHistory[currentMoveIndex - 1];
      setPuzzle(previousMove);
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  }, [currentMoveIndex, moveHistory]);

  // Redo move
  const handleRedo = useCallback(() => {
    if (currentMoveIndex < moveHistory.length - 1) {
      const nextMove = moveHistory[currentMoveIndex + 1];
      setPuzzle(nextMove);
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  }, [currentMoveIndex, moveHistory]);

  // Show help
  const showHelp = () => {
    toast({
      title: "How to Play",
      description: "Connect islands with bridges. Each island must have exactly the number of bridges shown on it. Bridges can't cross each other.",
      duration: 5000,
    });
  };
  
  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading puzzle...</div>
      </div>
    );
  }

  // Get best time for this difficulty
  const bestTime = stats.bestTime[difficulty as string] || 0;

  return (
    <div className="min-h-screen flex flex-col animate-fade-in page-transition">
      <GameHeader 
        timer={timer}
        bestTime={bestTime}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        restartPuzzle={restartPuzzle}
        showHelp={showHelp}
        canUndo={currentMoveIndex > 0}
        canRedo={currentMoveIndex < moveHistory.length - 1}
      />
      
      {/* Main content with proper spacing from header */}
      <main className="flex-1 pt-16 pb-6 px-2 flex flex-col items-center justify-center">
        <h1 className="text-lg font-medium capitalize mb-4">{difficulty} Puzzle</h1>
        
        <Board puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
        
        {gameCompleted && (
          <GameCompletedModal 
            time={puzzle.endTime! - puzzle.startTime!}
            resetPuzzle={resetPuzzle}
          />
        )}
      </main>
    </div>
  );
};

export default Game;
