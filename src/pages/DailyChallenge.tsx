
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Puzzle } from '../utils/gameLogic';
import { generateDailyChallenge } from '../utils/puzzleGenerator';
import { savePuzzle, updateStats, formatTime, isDailyCompleted, setDailyCompleted } from '../utils/storage';
import Board from '../components/Board';
import { useToast } from '@/hooks/use-toast';

const DailyChallenge: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  
  // Generate the daily challenge when component mounts
  useEffect(() => {
    console.log("Generating daily challenge");
    const dailyPuzzle = generateDailyChallenge();
    setPuzzle(dailyPuzzle);
    console.log(`Generated daily puzzle with seed: ${dailyPuzzle.seed}`);
  }, []);
  
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
      setDailyCompleted();
      
      toast({
        title: "Daily Challenge Completed!",
        description: `You completed today's challenge in ${formatTime(updatedPuzzle.endTime! - updatedPuzzle.startTime!)}`,
      });
    }
  };
  
  // Restart the daily puzzle
  const restartPuzzle = () => {
    console.log("Restarting daily challenge");
    const dailyPuzzle = generateDailyChallenge();
    setPuzzle(dailyPuzzle);
    setGameCompleted(false);
  };
  
  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading daily challenge...</div>
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
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h1 className="text-lg font-medium">Daily Challenge</h1>
          </div>
          <div className="flex items-center text-sm text-foreground/70">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatTime(timer)}</span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={restartPuzzle}
          className="rounded-full"
          aria-label="Restart puzzle"
        >
          <ArrowLeft className="h-5 w-5 opacity-0" /> {/* Placeholder for layout */}
        </Button>
      </div>
      
      <Board puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
      
      {gameCompleted && (
        <div className="mt-8 text-center bg-primary/10 p-4 rounded-lg animate-scale-in">
          <h2 className="text-xl font-medium mb-2">Daily Challenge Completed!</h2>
          <p className="mb-4">Time: {formatTime(puzzle.endTime! - puzzle.startTime!)}</p>
          
          <div className="flex justify-center space-x-3">
            <Button onClick={restartPuzzle} variant="outline">
              Play Again
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

export default DailyChallenge;
