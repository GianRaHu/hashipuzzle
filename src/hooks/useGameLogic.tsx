
import { useState, useCallback, useEffect } from 'react';
import { Puzzle, Bridge, checkAllIslandsHaveCorrectConnections, checkAllIslandsConnected } from '../utils/gameLogic';
import { savePuzzle, updateStats } from '../utils/storage';
import { supabase } from '@/integrations/supabase/client';
import { hapticFeedback } from '../utils/haptics';

interface UseGameLogicProps {
  puzzle: Puzzle | null;
  setPuzzle: (puzzle: Puzzle) => void;
  setGameCompleted: (completed: boolean) => void;
  setShowConnectionAlert: (show: boolean) => void;
  userOverrodeConnectivity: boolean;
  triggerHapticFeedback: (bridgeCount: number) => void;
  validDifficulty: string;
  setShowCompletionModal: (show: boolean) => void;
}

export const useGameLogic = ({
  puzzle,
  setPuzzle,
  setGameCompleted,
  setShowConnectionAlert,
  userOverrodeConnectivity,
  triggerHapticFeedback,
  validDifficulty,
  setShowCompletionModal
}: UseGameLogicProps) => {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<Bridge[][]>([[]]);

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
      hapticFeedback.success();
      
      const completionTime = fullyCompleted.endTime! - fullyCompleted.startTime!;
      updateExtendedStats(validDifficulty, completionTime, true);
      
      // Add delay before showing completion modal
      setTimeout(() => {
        setShowCompletionModal(true);
      }, 300); // 300ms delay
    }
  }, [gameStarted, moveHistory, puzzle, triggerHapticFeedback, updateExtendedStats, validDifficulty, userOverrodeConnectivity, setPuzzle, setGameCompleted, setShowConnectionAlert, setShowCompletionModal]);

  const handleContinueAnyway = useCallback(() => {
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
  }, [puzzle, setPuzzle, setGameCompleted, validDifficulty, setShowCompletionModal, setShowConnectionAlert]);

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
      hapticFeedback.light();
    }
  }, [moveHistory, puzzle, setPuzzle]);

  return {
    gameStarted,
    setGameStarted,
    moveHistory,
    setMoveHistory,
    handlePuzzleUpdate,
    handleContinueAnyway,
    handleUndo,
    updateExtendedStats
  };
};
