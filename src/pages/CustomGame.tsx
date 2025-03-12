
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Puzzle } from '../utils/gameLogic';
import { generatePuzzle } from '../utils/puzzleGenerator';
import { savePuzzle, updateStats } from '../utils/storage';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

import Board from '../components/Board';
import GameHeader from '../components/game/GameHeader';
import GameCompletedModal from '../components/game/GameCompletedModal';

const CustomGame: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<Puzzle[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  
  // Load the custom puzzle from localStorage
  useEffect(() => {
    setLoading(true);
    setLoadingProgress(0);
    
    const loadingInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 90 ? 90 : newProgress;
      });
    }, 200);
    
    setTimeout(() => {
      try {
        const customPuzzleStr = localStorage.getItem('custom_puzzle');
        
        if (!customPuzzleStr) {
          // No custom puzzle found, redirect to custom page
          clearInterval(loadingInterval);
          navigate('/custom');
          return;
        }
        
        const customPuzzle = JSON.parse(customPuzzleStr) as Puzzle;
        
        clearInterval(loadingInterval);
        setLoadingProgress(100);
        
        setTimeout(() => {
          setPuzzle(customPuzzle);
          setMoveHistory([customPuzzle]);
          setCurrentMoveIndex(0);
          setGameCompleted(false);
          setLoading(false);
          console.log(`Loaded custom puzzle with seed: ${customPuzzle.seed}`);
        }, 500);
      } catch (error) {
        console.error("Error loading custom puzzle:", error);
        clearInterval(loadingInterval);
        
        toast({
          title: "Error loading puzzle",
          description: "Please create a new custom puzzle",
          variant: "destructive"
        });
        
        navigate('/custom');
      }
    }, 1000);
    
    return () => clearInterval(loadingInterval);
  }, [navigate, toast]);
  
  // Update timer
  useEffect(() => {
    if (!puzzle || gameCompleted || loading || !gameStarted) return;
    
    const interval = setInterval(() => {
      setTimer(Date.now() - puzzle.startTime!);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [puzzle, gameCompleted, loading, gameStarted]);
  
  // Handle puzzle updates
  const handlePuzzleUpdate = useCallback((updatedPuzzle: Puzzle) => {
    if (!gameStarted) {
      setGameStarted(true);
      
      updatedPuzzle = {
        ...updatedPuzzle,
        startTime: Date.now()
      };
    }
    
    setPuzzle(updatedPuzzle);
    
    // Only add to history if it's a new move (not from undo/redo)
    const newHistory = [...moveHistory.slice(0, currentMoveIndex + 1), updatedPuzzle];
    setMoveHistory(newHistory);
    setCurrentMoveIndex(newHistory.length - 1);
    
    if (updatedPuzzle.solved && !gameCompleted) {
      setGameCompleted(true);
      savePuzzle(updatedPuzzle);
      updateStats(updatedPuzzle);
    }
  }, [currentMoveIndex, gameCompleted, gameStarted, moveHistory]);
  
  // Reset and create a new puzzle
  const resetPuzzle = () => {
    navigate('/custom');
  };
  
  // Restart with the same seed
  const restartPuzzle = () => {
    if (!puzzle) return;
    
    setGameStarted(false);
    setTimer(0);
    setLoading(true);
    setLoadingProgress(0);
    
    const loadingInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 90 ? 90 : newProgress;
      });
    }, 200);
    
    setTimeout(() => {
      try {
        // Recreate the same puzzle using its seed and size
        const sameConfig = {
          difficulty: puzzle.difficulty,
          seed: puzzle.seed,
          size: puzzle.size
        };
        
        const newPuzzle = generatePuzzle(sameConfig.difficulty, sameConfig.seed, sameConfig.size);
        
        clearInterval(loadingInterval);
        setLoadingProgress(100);
        
        setTimeout(() => {
          setPuzzle(newPuzzle);
          setGameCompleted(false);
          setMoveHistory([newPuzzle]);
          setCurrentMoveIndex(0);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error restarting puzzle:", error);
        clearInterval(loadingInterval);
        setLoadingProgress(0);
        setLoading(false);
        
        toast({
          title: "Error restarting puzzle",
          description: "Please try again or create a new custom puzzle",
          variant: "destructive"
        });
      }
    }, 1000);
  };
  
  // Handle undo
  const handleUndo = useCallback(() => {
    if (currentMoveIndex > 0) {
      const previousMove = moveHistory[currentMoveIndex - 1];
      setPuzzle(previousMove);
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  }, [currentMoveIndex, moveHistory]);
  
  // Handle redo
  const handleRedo = useCallback(() => {
    if (currentMoveIndex < moveHistory.length - 1) {
      const nextMove = moveHistory[currentMoveIndex + 1];
      setPuzzle(nextMove);
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  }, [currentMoveIndex, moveHistory]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
        <h1 className="text-lg font-medium mb-8">Custom Puzzle</h1>
        <div className="w-full max-w-md space-y-4">
          <Progress value={loadingProgress} className="h-2 w-full" />
          <p className="text-center text-sm text-muted-foreground">
            Loading custom puzzle...
          </p>
        </div>
      </div>
    );
  }
  
  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading puzzle...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col animate-fade-in page-transition">
      <GameHeader 
        timer={timer}
        bestTime={0}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        restartPuzzle={restartPuzzle}
        canUndo={currentMoveIndex > 0}
        canRedo={currentMoveIndex < moveHistory.length - 1}
        gameStarted={gameStarted}
      />
      
      <main className="flex-1 pt-16 pb-6 px-2 flex flex-col items-center justify-center overflow-y-auto">
        <h1 className="text-lg font-medium mb-4">Custom Puzzle</h1>
        <div className="text-sm text-muted-foreground mb-4">
          {puzzle.size} x {Math.round(puzzle.size * (puzzle.size > 10 ? 0.75 : 1))} Grid • Seed: {puzzle.seed}
        </div>
        
        <Board puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
        
        {gameCompleted && (
          <GameCompletedModal 
            time={puzzle.endTime! - puzzle.startTime!}
            resetPuzzle={resetPuzzle}
            seed={puzzle.seed}
          />
        )}
      </main>
    </div>
  );
};

export default CustomGame;
