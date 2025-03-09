
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Puzzle } from '../utils/gameLogic';
import { generatePuzzle } from '../utils/puzzleGenerator';
import { savePuzzle, updateStats, formatTime } from '../utils/storage';
import Board from '../components/Board';
import { useToast } from '@/hooks/use-toast';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { difficulty } = useParams<{ difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master' }>();
  
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  
  // Generate a new puzzle when component mounts
  useEffect(() => {
    if (difficulty) {
      const newPuzzle = generatePuzzle(difficulty as 'easy' | 'medium' | 'hard' | 'expert' | 'master');
      setPuzzle(newPuzzle);
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
  const handlePuzzleUpdate = (updatedPuzzle: Puzzle) => {
    setPuzzle(updatedPuzzle);
    
    // Check if puzzle is solved
    if (updatedPuzzle.solved && !gameCompleted) {
      setGameCompleted(true);
      savePuzzle(updatedPuzzle);
      updateStats(updatedPuzzle);
      
      toast({
        title: "Puzzle solved!",
        description: `You completed the ${difficulty} puzzle in ${formatTime(updatedPuzzle.endTime! - updatedPuzzle.startTime!)}`,
      });
    }
  };
  
  // Reset the puzzle with a new seed
  const resetPuzzle = () => {
    if (difficulty) {
      const newPuzzle = generatePuzzle(difficulty as 'easy' | 'medium' | 'hard' | 'expert' | 'master');
      setPuzzle(newPuzzle);
      setGameCompleted(false);
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
      console.log(`Restarted puzzle with seed: ${newPuzzle.seed}`);
    }
  };
  
  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading puzzle...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl px-4 py-12 md:py-16 mx-auto mt-16 animate-fade-in page-transition">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="rounded-full"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-medium capitalize">{difficulty} Puzzle</h1>
          <div className="flex items-center text-sm text-foreground/70">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatTime(timer)}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={restartPuzzle}
            className="rounded-full"
            aria-label="Restart puzzle"
            title="Restart with same layout"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={resetPuzzle}
            className="rounded-full"
            aria-label="New puzzle"
            title="Generate new puzzle"
          >
            <RotateCcw className="h-5 w-5 rotate-180" />
          </Button>
        </div>
      </div>
      
      <Board puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
      
      {gameCompleted && (
        <div className="mt-8 text-center bg-primary/10 p-4 rounded-lg animate-scale-in">
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
      )}
    </div>
  );
};

export default Game;
