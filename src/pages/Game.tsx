import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Puzzle, Bridge } from '../utils/gameLogic';
import { generatePuzzle } from '../utils/puzzleGenerator';
import { savePuzzle, updateStats, getStats } from '../utils/storage';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction, AlertDialogFooter } from '@/components/ui/alert-dialog';

import Board from '../components/Board';
import GameHeader from '../components/game/GameHeader';
import GameCompletedModal from '../components/game/GameCompletedModal';
import { supabase } from '@/integrations/supabase/client';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { difficulty } = useParams<{ difficulty: string }>();
  const location = useLocation();
  
  // Get URL parameters
  const urlParams = new URLSearchParams(location.search);
  const seedParam = urlParams.get('seed');
  const initialSeed = seedParam ? parseInt(seedParam, 10) : undefined;
  const gridSizeParam = urlParams.get('gridSize');
  const initialGridSize = gridSizeParam ? parseInt(gridSizeParam, 10) : undefined;
  const advancedTacticsParam = urlParams.get('advancedTactics');
  const initialAdvancedTactics = advancedTacticsParam === 'true';
  
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<Bridge[][]>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<boolean>(false);
  const [restartConfirmOpen, setRestartConfirmOpen] = useState<boolean>(false);
  const stats = getStats();
  
  const validDifficulties = ['easy', 'medium', 'hard', 'expert', 'custom'];
  const validDifficulty = validDifficulties.includes(difficulty || '') 
    ? difficulty as 'easy' | 'medium' | 'hard' | 'expert' | 'custom'
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
          
          // Create custom options if needed
          const customOptions = validDifficulty === 'custom' || initialGridSize || initialAdvancedTactics !== undefined 
            ? {
                gridSize: initialGridSize,
                advancedTactics: initialAdvancedTactics
              }
            : undefined;
          
          // For 'custom' difficulty, we'll use 'medium' as the base and apply custom settings
          const difficultyToUse = validDifficulty === 'custom' ? 'medium' : validDifficulty;
          
          const newPuzzle = generatePuzzle(
            difficultyToUse as 'easy' | 'medium' | 'hard' | 'expert', 
            initialSeed, 
            customOptions
          );
          
          clearInterval(loadingInterval);
          setLoadingProgress(100);
          
          setTimeout(() => {
            setPuzzle(newPuzzle);
            setMoveHistory([[]]);
            setGameCompleted(false);
            setLoading(false);
            console.log(`Generated puzzle with seed: ${newPuzzle.seed}, size: ${newPuzzle.size}, advanced tactics: ${newPuzzle.requiresAdvancedTactics}`);
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
  }, [validDifficulty, location.search, navigate, toast, initialSeed, initialGridSize, initialAdvancedTactics]);
  
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
    
    // Create a new entry in move history - store only bridges
    const newHistory = [...moveHistory];
    newHistory.push([...updatedPuzzle.bridges]);
    setMoveHistory(newHistory);
    
    if (updatedPuzzle.solved && !gameCompleted) {
      setGameCompleted(true);
      savePuzzle(updatedPuzzle);
      updateStats(updatedPuzzle);
      
      const completionTime = updatedPuzzle.endTime! - updatedPuzzle.startTime!;
      updateExtendedStats(validDifficulty, completionTime, true);
    }
  }, [gameCompleted, gameStarted, moveHistory, updateExtendedStats, validDifficulty]);
  
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
          // Create custom options if needed
          const customOptions = validDifficulty === 'custom' || initialGridSize || initialAdvancedTactics !== undefined 
            ? {
                gridSize: initialGridSize,
                advancedTactics: initialAdvancedTactics
              }
            : undefined;
          
          // For 'custom' difficulty, we'll use 'medium' as the base and apply custom settings
          const difficultyToUse = validDifficulty === 'custom' ? 'medium' : validDifficulty;
          
          const newPuzzle = generatePuzzle(
            difficultyToUse as 'easy' | 'medium' | 'hard' | 'expert', 
            undefined, // No seed for new puzzle
            customOptions
          );
          
          clearInterval(loadingInterval);
          setLoadingProgress(100);
          
          setTimeout(() => {
            setPuzzle(newPuzzle);
            setGameCompleted(false);
            setMoveHistory([[]]);
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
  
  // We're removing the confirmRestartPuzzle function and using the restartPuzzle directly
  // with the dialog state controlled in the GameHeader component
  
  const restartPuzzle = () => {
    setRestartConfirmOpen(false);
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
          // Create custom options if needed
          const customOptions = validDifficulty === 'custom' || initialGridSize || initialAdvancedTactics !== undefined 
            ? {
                gridSize: initialGridSize,
                advancedTactics: initialAdvancedTactics
              }
            : undefined;
          
          // For 'custom' difficulty, we'll use 'medium' as the base and apply custom settings
          const difficultyToUse = validDifficulty === 'custom' ? 'medium' : validDifficulty;
          
          const newPuzzle = generatePuzzle(
            difficultyToUse as 'easy' | 'medium' | 'hard' | 'expert', 
            puzzle.seed,
            customOptions
          );
          
          clearInterval(loadingInterval);
          setLoadingProgress(100);
          
          setTimeout(() => {
            setPuzzle(newPuzzle);
            setGameCompleted(false);
            setMoveHistory([[]]);
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
    if (moveHistory.length > 1 && puzzle) {
      // Remove the most recent bridge state
      const newHistory = [...moveHistory];
      newHistory.pop(); // Remove last bridge state
      
      // Get the previous bridge state
      const previousBridges = newHistory[newHistory.length - 1];
      
      // Update the puzzle with the previous bridges
      setPuzzle({
        ...puzzle,
        bridges: [...previousBridges],
        solved: false // Reset solved state since we're undoing
      });
      
      // Update the history
      setMoveHistory(newHistory);
    }
  }, [moveHistory, puzzle]);

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
        bestTime={bestTime}
        handleUndo={handleUndo}
        restartPuzzle={restartPuzzle} // Pass the function directly without confirmation
        setShowRestartDialog={setRestartConfirmOpen} // Pass the state setter instead
        showRestartDialog={restartConfirmOpen} // Pass the state
        canUndo={moveHistory.length > 1}
        gameStarted={gameStarted}
      />
      
      <main className="flex-1 pt-16 pb-6 px-2 flex flex-col items-center justify-center overflow-y-auto">
        <h1 className="text-lg font-medium capitalize mb-4">
          {difficulty} Puzzle 
          {initialSeed && <span className="text-sm text-muted-foreground ml-2">(Seed: {initialSeed})</span>}
          {puzzle?.requiresAdvancedTactics && <span className="text-sm text-amber-500 ml-2">(Advanced)</span>}
        </h1>
        
        <Board puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
        
        {gameCompleted && (
          <GameCompletedModal 
            time={puzzle.endTime! - puzzle.startTime!}
            resetPuzzle={resetPuzzle}
            seed={puzzle.seed}
          />
        )}
        
        {/* Remove duplicate AlertDialog here since we'll handle it in the GameHeader */}
      </main>
    </div>
  );
};

export default Game;
