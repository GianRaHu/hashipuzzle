
import { useState, useEffect } from 'react';
import { Puzzle } from '../utils/gameLogic';
import { generatePuzzle } from '../utils/puzzleGenerator';
import { useToast } from '@/hooks/use-toast';

interface UsePuzzleGeneratorProps {
  difficulty: string | undefined;
  validDifficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'custom';
  initialSeed?: number;
  initialGridSize?: number;
  initialAdvancedTactics?: boolean;
  updateExtendedStats: (difficulty: string, completionTime?: number | null, completed?: boolean) => void;
}

export const usePuzzleGenerator = ({
  difficulty,
  validDifficulty,
  initialSeed,
  initialGridSize,
  initialAdvancedTactics,
  updateExtendedStats
}: UsePuzzleGeneratorProps) => {
  const { toast } = useToast();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [originalPuzzle, setOriginalPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [generateError, setGenerateError] = useState<boolean>(false);

  const generateNewPuzzle = (isReset: boolean = false) => {
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
          console.log(`Generating ${isReset ? 'new' : ''} puzzle with difficulty: ${validDifficulty}`);
          
          // Create custom options if needed
          const customOptions = validDifficulty === 'custom' || initialGridSize || initialAdvancedTactics !== undefined 
            ? {
                gridSize: initialGridSize ? { rows: initialGridSize, cols: initialGridSize } : undefined,
                advancedTactics: initialAdvancedTactics
              }
            : undefined;
          
          // For 'custom' difficulty, we'll use 'medium' as the base and apply custom settings
          const difficultyToUse = validDifficulty === 'custom' ? 'medium' : validDifficulty;
          
          // Only use the seed for initial puzzle, not for reset
          const seedToUse = !isReset ? initialSeed : undefined;
          
          const newPuzzle = generatePuzzle(
            difficultyToUse as 'easy' | 'medium' | 'hard' | 'expert', 
            seedToUse, 
            customOptions
          );
          
          clearInterval(loadingInterval);
          setLoadingProgress(100);
          
          setTimeout(() => {
            setPuzzle(newPuzzle);
            setOriginalPuzzle({...newPuzzle}); // Store a copy of the original puzzle for restart
            setLoading(false);
            console.log(`Generated ${isReset ? 'new' : ''} puzzle with seed: ${newPuzzle.seed}`);
            
            // Update extended stats for a new game if it's a reset
            if (isReset) {
              updateExtendedStats(validDifficulty);
            }
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
      
      return () => clearInterval(loadingInterval);
    }
  };

  const resetPuzzle = () => {
    generateNewPuzzle(true);
  };

  const restartPuzzle = () => {
    // If we have the original puzzle, use it to reset the game
    if (originalPuzzle) {
      // Create a fresh copy of the original puzzle to avoid reference issues
      const restartedPuzzle = {
        ...originalPuzzle,
        bridges: [], // Clear all bridges
        solved: false,
        startTime: Date.now(), // Reset start time for a fresh timer
        endTime: undefined  // Clear end time if it was set
      };
      
      setPuzzle(restartedPuzzle);
      
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

  // Initial puzzle generation on component mount
  useEffect(() => {
    generateNewPuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, validDifficulty, initialSeed, initialGridSize, initialAdvancedTactics]);

  return {
    puzzle,
    setPuzzle,
    originalPuzzle,
    loading,
    loadingProgress,
    generateError,
    resetPuzzle,
    restartPuzzle
  };
};
