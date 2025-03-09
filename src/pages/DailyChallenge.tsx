
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Puzzle } from '../utils/gameLogic';
import { generateDailyChallenge } from '../utils/puzzleGenerator';
import { savePuzzle, updateStats, formatTime, isDailyCompleted, getStats } from '../utils/storage';
import Board from '../components/Board';
import { useToast } from '@/hooks/use-toast';

const DailyChallenge: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState<boolean>(false);
  
  // Generate the daily challenge when component mounts
  useEffect(() => {
    const dailyCompleted = isDailyCompleted();
    setIsAlreadyCompleted(dailyCompleted);
    
    const dailyPuzzle = generateDailyChallenge();
    setPuzzle(dailyPuzzle);
    
    if (dailyCompleted) {
      toast({
        title: "Daily Already Completed",
        description: "You've already completed today's challenge. Come back tomorrow!",
      });
    }
  }, [toast]);
  
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
      
      const stats = getStats();
      toast({
        title: "Daily Challenge Completed!",
        description: `You completed today's challenge in ${formatTime(updatedPuzzle.endTime! - updatedPuzzle.startTime!)}. Your streak: ${stats.dailyStreak}`,
      });
    }
  };
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
          <h1 className="text-lg font-medium">Daily Challenge</h1>
          <div className="flex items-center text-sm text-foreground/70">
            <CalendarDays className="h-3 w-3 mr-1" />
            <span>{formattedDate}</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm">
          <Clock className="h-4 w-4 mr-1" />
          <span>{formatTime(timer)}</span>
        </div>
      </div>
      
      <div className="mb-4 text-center">
        <div className="inline-block bg-primary/10 px-3 py-1 rounded-full text-sm">
          <span className="capitalize font-medium">{puzzle.difficulty}</span> puzzle
        </div>
      </div>
      
      <Board puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
      
      {gameCompleted && (
        <div className="mt-8 text-center bg-primary/10 p-4 rounded-lg animate-scale-in">
          <div className="flex justify-center mb-3">
            <div className="bg-primary/20 p-2 rounded-full">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-medium mb-2">Daily Challenge Completed!</h2>
          <p className="mb-4">Time: {formatTime(puzzle.endTime! - puzzle.startTime!)}</p>
          <p className="text-sm text-foreground/70 mb-4">Come back tomorrow for a new challenge!</p>
          
          <Button onClick={() => navigate('/')} variant="default">
            Back to Home
          </Button>
        </div>
      )}
      
      {isAlreadyCompleted && !gameCompleted && (
        <div className="mt-8 text-center bg-secondary p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-2">You've already completed today's challenge</h2>
          <p className="text-sm text-foreground/70 mb-4">Come back tomorrow for a new challenge!</p>
        </div>
      )}
    </div>
  );
};

export default DailyChallenge;
