
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Puzzle } from '../utils/gameLogic';
import { generatePuzzle } from '../utils/puzzleGenerator';
import { savePuzzle, updateStats, getStats } from '../utils/storage';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

import Board from '../components/Board';
import GameHeader from '../components/game/GameHeader';
import GameCompletedModal from '../components/game/GameCompletedModal';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { difficulty } = useParams<{ difficulty: string }>();
  const location = useLocation();
  
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<Puzzle[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const [generateError, setGenerateError] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const stats = getStats();
  
  const validDifficulties = ['easy', 'medium', 'hard', 'expert', 'master'];
  const validDifficulty = validDifficulties.includes(difficulty || '') 
    ? difficulty as 'easy' | 'medium' | 'hard' | 'expert' | 'master' 
    : 'easy';
  
  useEffect(() => {
    if (validDifficulty) {
      setLoading(true);
      setLoadingProgress(0);
      setGenerateError(false);
      
      const loadingInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 200);
      
      setTimeout(() => {
        try {
          console.log(`Generating new puzzle with difficulty: ${validDifficulty}`);
          const newPuzzle = generatePuzzle(validDifficulty);
          
          clearInterval(loadingInterval);
          setLoadingProgress(100);
          
          setTimeout(() => {
            setPuzzle(newPuzzle);
            setMoveHistory([newPuzzle]);
            setCurrentMoveIndex(0);
            setGameCompleted(false);
            setLoading(false);
            console.log(`Generated puzzle with seed: ${newPuzzle.seed}`);
          }, 500);
        } catch (error) {
          console.error("Error generating puzzle:", error);
          clearInterval(loadingInterval);
          setLoadingProgress(100);
          setGenerateError(true);
          
          toast({
            title: "Error generating puzzle",
            description: "Please try again or select a different difficulty level.",
            variant: "destructive",
            duration: 5000,
          });
          
          navigate('/');
        }
      }, 1000);
      
      return () => clearInterval(loadingInterval);
    }
  }, [validDifficulty, location.search, navigate, toast]);
  
  useEffect(() => {
    if (!puzzle || gameCompleted || loading) return;
    
    if (!gameStarted) return;
    
    const interval = setInterval(() => {
      setTimer(Date.now() - puzzle.startTime!);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [puzzle, gameCompleted, loading, gameStarted]);
  
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
      
      toast({
        title: "Puzzle solved!",
        description: `You completed the ${difficulty} puzzle in ${updatedPuzzle.endTime! - updatedPuzzle.startTime!}`,
        duration: 5000,
      });
    }
  }, [currentMoveIndex, difficulty, gameCompleted, gameStarted, moveHistory, toast]);
  
  const resetPuzzle = () => {
    if (validDifficulty) {
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
          const newPuzzle = generatePuzzle(validDifficulty);
          
          clearInterval(loadingInterval);
          setLoadingProgress(100);
          
          setTimeout(() => {
            setPuzzle(newPuzzle);
            setGameCompleted(false);
            setMoveHistory([newPuzzle]);
            setCurrentMoveIndex(0);
            setGameStarted(false);
            setTimer(0);
            setLoading(false);
            console.log(`Generated new puzzle with seed: ${newPuzzle.seed}`);
          }, 500);
        } catch (error) {
          console.error("Error generating puzzle:", error);
          clearInterval(loadingInterval);
          setLoadingProgress(100);
          setGenerateError(true);
          
          toast({
            title: "Error generating puzzle",
            description: "Please try again or select a different difficulty level.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }, 1000);
    }
  };
  
  const restartPuzzle = () => {
    setGameStarted(false);
    setTimer(0);
    
    if (validDifficulty && puzzle?.seed) {
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
          const newPuzzle = generatePuzzle(validDifficulty, puzzle.seed);
          
          clearInterval(loadingInterval);
          setLoadingProgress(100);
          
          setTimeout(() => {
            setPuzzle(newPuzzle);
            setGameCompleted(false);
            setMoveHistory([newPuzzle]);
            setCurrentMoveIndex(0);
            setLoading(false);
            console.log(`Restarted puzzle with seed: ${newPuzzle.seed}`);
          }, 500);
        } catch (error) {
          console.error("Error restarting puzzle:", error);
          clearInterval(loadingInterval);
          setLoadingProgress(100);
          
          toast({
            title: "Error restarting puzzle",
            description: "Please try again.",
            variant: "destructive",
            duration: 5000,
          });
          
          setLoading(false);
        }
      }, 1000);
    }
  };

  const handleUndo = useCallback(() => {
    if (currentMoveIndex > 0) {
      const previousMove = moveHistory[currentMoveIndex - 1];
      setPuzzle(previousMove);
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  }, [currentMoveIndex, moveHistory]);

  const handleRedo = useCallback(() => {
    if (currentMoveIndex < moveHistory.length - 1) {
      const nextMove = moveHistory[currentMoveIndex + 1];
      setPuzzle(nextMove);
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  }, [currentMoveIndex, moveHistory]);

  const showHelp = () => {
    toast({
      title: "How to Play",
      description: "Connect islands with bridges. Each island must have exactly the number of bridges shown on it. Bridges can't cross each other.",
      duration: 5000,
    });
  };
  
  const bestTime = stats.bestTime[difficulty as string] || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
        <h1 className="text-lg font-medium capitalize mb-8">{difficulty} Puzzle</h1>
        <div className="w-full max-w-md space-y-4">
          <Progress value={loadingProgress} className="h-2 w-full" />
          <p className="text-center text-sm text-muted-foreground">
            {generateError ? "Error generating puzzle..." : "Generating puzzle..."}
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
        bestTime={stats.bestTime[difficulty as string] || 0}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        restartPuzzle={restartPuzzle}
        canUndo={currentMoveIndex > 0}
        canRedo={currentMoveIndex < moveHistory.length - 1}
        gameStarted={gameStarted}
      />
      
      <main className="flex-1 pt-16 pb-6 px-2 flex flex-col items-center justify-center overflow-y-auto">
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
