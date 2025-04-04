import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Puzzle, Bridge, checkPuzzleSolved, checkAllIslandsHaveCorrectConnections, checkAllIslandsConnected } from '../utils/gameLogic';
import { generatePuzzle } from '../utils/puzzleGenerator';
import { savePuzzle, updateStats, getStats } from '../utils/storage';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { hapticFeedback, isHapticFeedbackAvailable } from '../utils/haptics';
import audioManager from '../utils/audio';

import Board from '../components/Board';
import GameHeader from '../components/game/GameHeader';
import GameCompletedModal from '../components/game/GameCompletedModal';
import ConnectivityAlert from '../components/ConnectivityAlert';
import { supabase } from '@/integrations/supabase/client';
import { UserSettings } from '@/types/user-settings';

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
  const [originalPuzzle, setOriginalPuzzle] = useState<Puzzle | null>(null); // Store original puzzle for restart
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<Bridge[][]>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<boolean>(false);
  const [restartConfirmOpen, setRestartConfirmOpen] = useState<boolean>(false);
  const [showConnectionAlert, setShowConnectionAlert] = useState<boolean>(false);
  const [userOverrodeConnectivity, setUserOverrodeConnectivity] = useState<boolean>(false);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [settings, setSettings] = useState({
    hapticFeedback: true,
    backgroundMusic: false
  });
  
  const stats = getStats();
  
  const validDifficulties = ['easy', 'medium', 'hard', 'expert', 'custom'];
  const validDifficulty = validDifficulties.includes(difficulty || '') 
    ? difficulty as 'easy' | 'medium' | 'hard' | 'expert' | 'custom'
    : 'easy';
  
  // Load user settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user?.user) {
          // Fetch user settings from supabase
          // Since we may not have types updated yet, use a more generic approach
          const { data: userSettings, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.user.id)
            .single();
          
          if (userSettings && !error) {
            // Cast the result to our temporary UserSettings type
            const settings = userSettings as unknown as UserSettings;
            
            setSettings({
              hapticFeedback: settings.haptic_feedback || true,
              backgroundMusic: settings.background_music || false
            });
            
            // Toggle background music if it's enabled in settings
            audioManager.toggle(settings.background_music || false);
            if (settings.background_music) {
              audioManager.setVolume(settings.volume / 100 || 0.5);
            }
          }
        } else {
          // If no user is logged in, check localStorage for settings
          const storedSettings = localStorage.getItem('gameSettings');
          if (storedSettings) {
            const parsedSettings = JSON.parse(storedSettings);
            setSettings(parsedSettings);
            
            // Toggle background music if it's enabled in settings
            audioManager.toggle(parsedSettings.backgroundMusic || false);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    
    fetchSettings();
    
    // Cleanup function to pause background music when component unmounts
    return () => {
      audioManager.pause();
    };
  }, []);
  
  // Handle haptic feedback on bridge placement
  const triggerHapticFeedback = useCallback((bridgeCount: number) => {
    if (settings.hapticFeedback) {
      if (bridgeCount === 1) {
        hapticFeedback.light();
      } else {
        hapticFeedback.medium();
      }
    }
  }, [settings.hapticFeedback]);
  
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
                gridSize: initialGridSize ? { rows: initialGridSize, cols: initialGridSize } : undefined,
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
            setOriginalPuzzle({...newPuzzle}); // Store a copy of the original puzzle for restart
            setMoveHistory([[]]);
            setGameCompleted(false);
            setLoading(false);
            console.log(`Generated puzzle with seed: ${newPuzzle.seed}, size: ${newPuzzle.size.rows}x${newPuzzle.size.cols}, advanced tactics: ${newPuzzle.requiresAdvancedTactics}`);
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
    
    // Determine if a bridge was added (for haptic feedback)
    const oldBridgeCount = puzzle?.bridges.length || 0;
    const newBridgeCount = updatedPuzzle.bridges.length || 0;
    
    if (newBridgeCount > oldBridgeCount) {
      // A bridge was added, trigger haptic feedback
      const newBridge = updatedPuzzle.bridges[updatedPuzzle.bridges.length - 1];
      if (newBridge) {
        triggerHapticFeedback(newBridge.count);
      }
    }
    
    setPuzzle(updatedPuzzle);
    
    // Create a new entry in move history - store only bridges
    const newHistory = [...moveHistory];
    newHistory.push([...updatedPuzzle.bridges]);
    setMoveHistory(newHistory);
    
    // Check for the condition where bridges are correct but not all islands are connected
    const correctConnections = checkAllIslandsHaveCorrectConnections(updatedPuzzle);
    const allConnected = checkAllIslandsConnected(updatedPuzzle.islands);
    
    if (correctConnections && !allConnected && !userOverrodeConnectivity) {
      setShowConnectionAlert(true);
    } else {
      setShowConnectionAlert(false);
    }
    
    if (updatedPuzzle.solved || (correctConnections && allConnected)) {
      const fullyCompleted = {
        ...updatedPuzzle,
        solved: true,
        endTime: Date.now()
      };
      
      setPuzzle(fullyCompleted);
      setGameCompleted(true);
      savePuzzle(fullyCompleted);
      updateStats(fullyCompleted);
      
      // Trigger success haptic feedback
      if (settings.hapticFeedback) {
        hapticFeedback.success();
      }
      
      const completionTime = fullyCompleted.endTime! - fullyCompleted.startTime!;
      updateExtendedStats(validDifficulty, completionTime, true);
      
      // Add delay before showing completion modal
      setTimeout(() => {
        setShowCompletionModal(true);
      }, 300); // 300ms delay
    }
  }, [gameCompleted, gameStarted, moveHistory, puzzle, settings.hapticFeedback, triggerHapticFeedback, updateExtendedStats, validDifficulty, userOverrodeConnectivity]);
  
  const handleContinueAnyway = () => {
    setUserOverrodeConnectivity(true);
    setShowConnectionAlert(false);
    
    if (puzzle) {
      const updatedPuzzle = {
        ...puzzle,
        solved: true,
        endTime: Date.now()
      };
      
      setPuzzle(updatedPuzzle);
      setGameCompleted(true);
      savePuzzle(updatedPuzzle);
      updateStats(updatedPuzzle);
      
      const completionTime = updatedPuzzle.endTime! - updatedPuzzle.startTime!;
      updateExtendedStats(validDifficulty, completionTime, true);
      
      // Add delay before showing completion modal
      setTimeout(() => {
        setShowCompletionModal(true);
      }, 300); // 300ms delay
    }
  };
  
  const handleContinuePlaying = () => {
    setShowConnectionAlert(false);
  };
  
  const resetPuzzle = () => {
    setShowCompletionModal(false);
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
                gridSize: initialGridSize ? { rows: initialGridSize, cols: initialGridSize } : undefined,
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
            setOriginalPuzzle({...newPuzzle}); // Store a copy of the original puzzle for restart
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
  
  // Updated restart function to truly restart the same puzzle
  const restartPuzzle = () => {
    setRestartConfirmOpen(false);
    
    // If we have the original puzzle, use it to reset the game
    if (originalPuzzle) {
      setGameStarted(false);
      setTimer(0);
      setGameCompleted(false);
      
      // Create a fresh copy of the original puzzle to avoid reference issues
      const restartedPuzzle = {
        ...originalPuzzle,
        bridges: [], // Clear all bridges
        solved: false,
        startTime: Date.now(), // Reset start time for a fresh timer
        endTime: undefined  // Clear end time if it was set
      };
      
      setPuzzle(restartedPuzzle);
      setMoveHistory([[]]);
      
      if (settings.hapticFeedback) {
        hapticFeedback.medium();
      }
      
      toast({
        title: "Puzzle Restarted",
        description: "The puzzle has been reset to its initial state.",
        duration: 2000,
      });
    } else {
      console.error("Cannot restart: original puzzle state not found");
      toast({
        title: "Error restarting puzzle",
        description: "Could not restore the original puzzle state.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleUndo = useCallback(() => {
    if (moveHistory.length > 1 && puzzle) {
      // Remove the most recent bridge state
      const newHistory = [...moveHistory];
      newHistory.pop();
      
      // Get the previous bridge state
      const previousBridges = newHistory[newHistory.length - 1];
      
      // Create a new puzzle state with the previous bridges
      const updatedPuzzle = {
        ...puzzle,
        bridges: [...previousBridges],
        islands: puzzle.islands.map(island => {
          // Calculate connected islands
          const connectedTo = previousBridges
            .filter(bridge => bridge.startIslandId === island.id || bridge.endIslandId === island.id)
            .map(bridge => bridge.startIslandId === island.id ? bridge.endIslandId : bridge.startIslandId);
          
          return {
            ...island,
            connectedTo: connectedTo
          };
        }),
        solved: false
      };
        
      // Update the puzzle state
      setPuzzle(updatedPuzzle);
      setMoveHistory(newHistory);
      
      // Light haptic feedback for undo
      if (settings.hapticFeedback) {
        hapticFeedback.light();
      }
    }
  }, [moveHistory, puzzle, settings.hapticFeedback]);

  const showHelp = () => {
    toast({
      title: "How to Play",
      description: "Connect islands with bridges. Each island must have exactly the number of bridges shown on it. Bridges can't cross each other. All islands must be connected to each other.",
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
        restartPuzzle={restartPuzzle}
        setShowRestartDialog={setRestartConfirmOpen}
        showRestartDialog={restartConfirmOpen}
        canUndo={moveHistory.length > 1}
        gameStarted={gameStarted}
      />
      
      <main className="flex-1 pt-16 pb-6 px-2 flex flex-col items-center justify-center overflow-y-auto">
        <h1 className="text-lg font-medium capitalize mb-4">
          {difficulty} Puzzle 
          {initialSeed && <span className="text-sm text-muted-foreground ml-2">(Seed: {initialSeed})</span>}
          {puzzle?.requiresAdvancedTactics && <span className="text-sm text-amber-500 ml-2">(Advanced)</span>}
        </h1>
        
        {showConnectionAlert && !gameCompleted && (
          <ConnectivityAlert 
            onContinue={handleContinueAnyway}
            onContinueToPlay={handleContinuePlaying}
          />
        )}
        
        {loading ? (
          <div className="w-full max-w-md space-y-4">
            <Progress value={loadingProgress} className="h-2 w-full" />
            <p className="text-center text-sm text-muted-foreground">
              {generateError ? "Error generating puzzle..." : "Generating puzzle..."}
            </p>
          </div>
        ) : puzzle ? (
          <div className="game-container w-full max-w-lg mx-auto">
            <Board puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
          </div>
        ) : (
          <div className="animate-pulse">Loading puzzle...</div>
        )}
        
        {gameCompleted && showCompletionModal && (
          <GameCompletedModal 
            time={puzzle?.endTime! - puzzle?.startTime!}
            resetPuzzle={resetPuzzle}
            seed={puzzle?.seed}
            onClose={() => setShowCompletionModal(false)}
          />
        )}
      </main>
    </div>
  );
};

export default Game;
