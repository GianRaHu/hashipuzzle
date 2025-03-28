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
import { supabase } from '@/integrations/supabase/client';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { difficulty } = useParams<{ difficulty: string }>();
  const location = useLocation();
  
  // Get seed from URL if provided
  const urlParams = new URLSearchParams(location.search);
  const seedParam = urlParams.get('seed');
  const initialSeed = seedParam ? parseInt(seedParam, 10) : undefined;
  
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
  
  // Update extended stats in Supabase
  const updateExtendedStats = async (
    difficulty: string, 
    completionTime: number | null = null, 
    completed: boolean = false
  ) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      
      const userId = user.user.id;
      
      // First check if stats for this difficulty already exist
      const { data: existingStats } = await supabase
        .from('extended_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('difficulty', difficulty)
        .single();
      
      if (existingStats) {
        // Update existing stats
        const updates: any = {
          games_played: existingStats.games_played + 1,
          total_time: existingStats.total_time + (completionTime || 0),
          updated_at: new Date().toISOString()
        };
        
        if (completed) {
          updates.games_won = existingStats.games_won + 1;
          
          // Calculate average completion time
          const newTotalCompletions = existingStats.games_won + 1;
          if (completionTime) {
            updates.avg_completion_time = Math.round(
              (existingStats.avg_completion_time || 0) * existingStats.games_won / newTotalCompletions + 
              completionTime / newTotalCompletions
            );
            
            // Update best time if this is better
            if (!existingStats.best_completion_time || completionTime < existingStats.best_completion_time) {
              updates.best_completion_time = completionTime;
              updates.best_time_date = new Date().toISOString();
            }
          }
        }
        
        await supabase
          .from('extended_stats')
          .update(updates)
          .eq('id', existingStats.id);
      } else {
        // Create new stats entry
        const newStats: any = {
          user_id: userId,
          difficulty,
          games_played: 1,
          games_won: completed ? 1 : 0,
          total_time: completionTime || 0
        };
        
        if (completed && completionTime) {
          newStats.avg_completion_time = completionTime;
          newStats.best_completion_time = completionTime;
          newStats.best_time_date = new Date().toISOString();
        }
        
        await supabase
          .from('extended_stats')
          .insert(newStats);
      }
      
      // If the game was completed, add to completed_puzzles
      if (completed && completionTime && puzzle) {
        await supabase
          .from('completed_puzzles')
          .insert({
            user_id: userId,
            puzzle_id: puzzle.id,
            difficulty,
            completion_time: completionTime
          });
      }
    } catch (error) {
      console.error('Error updating extended stats:', error);
    }
  };
  
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
          console.log(`Generating new puzzle with difficulty: ${validDifficulty}, seed: ${initialSeed || 'random'}`);
          const newPuzzle = generatePuzzle(validDifficulty, initialSeed);
          
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
  }, [validDifficulty, location.search, navigate, toast, initialSeed]);
  
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
      
      const completionTime = updatedPuzzle.endTime! - updatedPuzzle.startTime!;
      updateExtendedStats(validDifficulty, completionTime, true);
    }
  }, [currentMoveIndex, gameCompleted, gameStarted, moveHistory, validDifficulty]);
  
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
            
            // Update extended stats for a new game
            updateExtendedStats(validDifficulty);
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
        <h1 className="text-lg font-medium capitalize mb-4">{difficulty} Puzzle {initialSeed && <span className="text-sm text-muted-foreground">(Seed: {initialSeed})</span>}</h1>
        
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

export default Game;
