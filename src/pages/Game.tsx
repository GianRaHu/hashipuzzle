
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Board from '../components/Board';
import { generatePuzzle } from '../utils/puzzleGenerator';
import GameControls from '../components/GameControls';
import GameStats from '../components/GameStats';
import HelpDialog from '../components/game/HelpDialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from "@/components/ui/use-toast";
import GameHeader from '@/components/game/GameHeader';

const Game = () => {
  const params = useParams<{ difficulty: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [puzzle, setPuzzle] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [gameHistory, setGameHistory] = useLocalStorage<any[]>('gameHistory', []);
  const { toast } = useToast();

  const handleAddBridge = useCallback((startIslandId: string, endIslandId: string) => {
    setPuzzle(prevPuzzle => {
      if (!prevPuzzle) return prevPuzzle;

      const updatedPuzzle = { ...prevPuzzle };
      return updatedPuzzle;
    });
  }, [setPuzzle]);

  const handleSolve = useCallback(() => {
    if (!puzzle) return;

    // Basic solve logic (can be expanded)
    setPuzzle(prevPuzzle => {
      if (!prevPuzzle) return prevPuzzle;

      const solvedPuzzle = { ...prevPuzzle, solved: true, endTime: Date.now() };
      return solvedPuzzle;
    });

    toast({
      title: "Puzzle Solved!",
      description: "Congratulations, you solved the puzzle!",
    });
  }, [puzzle, toast]);

  const handleUndo = useCallback(() => {
    if (gameHistory.length > 0) {
      const previousState = gameHistory[gameHistory.length - 1];
      setPuzzle(previousState);
      // Fix: Directly pass the new array instead of using a function
      setGameHistory(gameHistory.slice(0, -1));
    } else {
      toast({
        title: "No moves to undo",
        description: "Start playing to enable undo",
      });
    }
  }, [gameHistory, setGameHistory, toast]);

  const handleReset = useCallback(() => {
    if (!puzzle) return;

    // Reset the puzzle to its initial state
    setPuzzle(prevPuzzle => {
      if (!prevPuzzle) return prevPuzzle;

      const initialPuzzle = { ...prevPuzzle, bridges: [], solved: false, startTime: Date.now(), endTime: undefined };
      return initialPuzzle;
    });

    toast({
      title: "Puzzle Reset",
      description: "The puzzle has been reset to its initial state.",
    });
  }, [puzzle, toast]);

  useEffect(() => {
    // Get difficulty parameter from URL
    const difficultyParam = params.difficulty;
    
    // Handle custom games
    if (difficultyParam === 'custom') {
      const searchParams = new URLSearchParams(location.search);
      const heightParam = searchParams.get('height');
      const widthParam = searchParams.get('width');
      const seedParam = searchParams.get('seed');
      
      let customHeight = 7; // Default height
      let customWidth = 5; // Default width (3:4 ratio)
      
      if (heightParam) {
        const parsedHeight = parseInt(heightParam, 10);
        if (!isNaN(parsedHeight) && parsedHeight >= 5 && parsedHeight <= 15) {
          customHeight = parsedHeight;
        }
      }
      
      if (widthParam) {
        const parsedWidth = parseInt(widthParam, 10);
        if (!isNaN(parsedWidth) && parsedWidth >= 4 && parsedWidth <= 12) {
          customWidth = parsedWidth;
        }
      }
      
      let customSeed = undefined;
      if (seedParam) {
        const parsedSeed = parseInt(seedParam, 10);
        if (!isNaN(parsedSeed)) {
          customSeed = parsedSeed;
        }
      }
      
      // Generate a custom puzzle
      let newPuzzle;
      if (customSeed !== undefined) {
        newPuzzle = generatePuzzle('medium', customSeed, customWidth, customHeight);
      } else {
        newPuzzle = generatePuzzle('medium', undefined, customWidth, customHeight);
      }
      
      // Set custom properties
      newPuzzle.difficulty = 'custom';
      
      setPuzzle(newPuzzle);
      setLoading(false);
      return;
    }
    
    // Load puzzle based on difficulty
    if (difficultyParam === 'easy' || difficultyParam === 'medium' || difficultyParam === 'hard' || difficultyParam === 'expert' || difficultyParam === 'master') {
      const newPuzzle = generatePuzzle(difficultyParam);
      setPuzzle(newPuzzle);
      setLoading(false);
    } else {
      // Redirect to home if difficulty is invalid
      navigate('/');
    }
  }, [params.difficulty, location.search, navigate]);

  if (loading) {
    return <div className="content-container">Loading...</div>;
  }

  if (!puzzle) {
    return <div className="content-container">Error generating puzzle.</div>;
  }

  return (
    <div className="content-container">
      <GameHeader 
        backUrl="/"
        title={`${puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1)} Puzzle`}
      />
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-2/3">
          <div className="relative">
            <Board puzzle={puzzle} onAddBridge={handleAddBridge} />
          </div>
        </div>
        <div className="md:w-1/3 flex flex-col gap-4">
          <GameControls 
            onSolve={handleSolve}
            onUndo={handleUndo}
            onReset={handleReset}
          />
          <GameStats puzzle={puzzle} />
          <HelpDialog />
        </div>
      </div>
    </div>
  );
};

export default Game;
