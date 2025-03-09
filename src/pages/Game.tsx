
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Clock, Home, CornerUpLeft, CornerUpRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Puzzle } from '../utils/gameLogic';
import { generatePuzzle } from '../utils/puzzleGenerator';
import { savePuzzle, updateStats, formatTime, getStats } from '../utils/storage';
import Board from '../components/Board';
import { useToast } from '@/hooks/use-toast';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { difficulty } = useParams<{ difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master' }>();
  
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<Puzzle[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const stats = getStats();
  
  // Generate a new puzzle when component mounts
  useEffect(() => {
    if (difficulty) {
      const newPuzzle = generatePuzzle(difficulty as 'easy' | 'medium' | 'hard' | 'expert' | 'master');
      setPuzzle(newPuzzle);
      setMoveHistory([newPuzzle]);
      setCurrentMoveIndex(0);
      console.log(`Generated puzzle with seed: ${newPuzzle.seed}`);
    }
  }, [difficulty]);
  
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
        description: `You completed the ${difficulty} puzzle in ${formatTime(updatedPuzzle.endTime! - updatedPuzzle.startTime!)}`,
        duration: 5000,
      });
    }
  }, [currentMoveIndex, difficulty, gameCompleted, moveHistory, toast]);
  
  // Reset the puzzle with a new seed
  const resetPuzzle = () => {
    if (difficulty) {
      const newPuzzle = generatePuzzle(difficulty as 'easy' | 'medium' | 'hard' | 'expert' | 'master');
      setPuzzle(newPuzzle);
      setGameCompleted(false);
      setMoveHistory([newPuzzle]);
      setCurrentMoveIndex(0);
      console.log(`Generated new puzzle with seed: ${newPuzzle.seed}`);
    }
  };
  
  // Reset the puzzle with the same seed
  const restartPuzzle = () => {
    if (difficulty && puzzle?.seed) {
      const newPuzzle = generatePuzzle(
        difficulty as 'easy' | 'medium' | 'hard' | 'expert' | 'master', 
        puzzle.seed
      );
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
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 bg-background z-50 border-b border-border/10 shadow-sm">
        <div className="container flex justify-between items-center h-14 px-4 max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="rounded-full"
            aria-label="Back to home"
          >
            <Home className="h-5 w-5" />
          </Button>
          
          <div className="flex gap-2 items-center text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span>{formatTime(timer)}</span>
            {bestTime > 0 && (
              <span className="text-muted-foreground text-xs">
                Best: {formatTime(bestTime)}
              </span>
            )}
          </div>
          
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleUndo}
              disabled={currentMoveIndex <= 0}
              className="rounded-full h-8 w-8"
              aria-label="Undo"
            >
              <CornerUpLeft className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRedo}
              disabled={currentMoveIndex >= moveHistory.length - 1}
              className="rounded-full h-8 w-8"
              aria-label="Redo"
            >
              <CornerUpRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={restartPuzzle}
              className="rounded-full h-8 w-8"
              aria-label="Restart puzzle"
              title="Restart with same layout"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={showHelp}
              className="rounded-full h-8 w-8"
              aria-label="Help"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content with proper spacing from header */}
      <main className="flex-1 pt-16 pb-6 px-2 flex flex-col items-center justify-center">
        <h1 className="text-lg font-medium capitalize mb-4">{difficulty} Puzzle</h1>
        
        <Board puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
        
        {gameCompleted && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-card p-6 rounded-lg shadow-lg max-w-sm w-full animate-scale-in text-center">
              <h2 className="text-xl font-medium mb-2">Puzzle Completed!</h2>
              <p className="mb-4">Time: {formatTime(puzzle.endTime! - puzzle.startTime!)}</p>
              
              <div className="flex justify-center space-x-3">
                <Button onClick={resetPuzzle} variant="outline">
                  New Puzzle
                </Button>
                <Button onClick={() => navigate('/')} variant="default">
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Game;
