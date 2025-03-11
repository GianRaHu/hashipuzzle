import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Puzzle } from '../utils/gameLogic';
import { generateDailyChallenge } from '../utils/puzzleGenerator';
import { savePuzzle, updateStats, formatTime, isDailyCompleted, setDailyCompleted } from '../utils/storage';
import Board from '../components/Board';
import GameCompletedModal from '../components/game/GameCompletedModal';
import DailyPuzzleList from '../components/game/DailyPuzzleList';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';

const DailyChallenge: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showPuzzleList, setShowPuzzleList] = useState<boolean>(true);
  const [moveHistory, setMoveHistory] = useState<Puzzle[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  
  // Calculate date range for calendar
  const today = new Date();
  const pastDaysLimit = 7;
  const minSelectableDate = subDays(today, pastDaysLimit);
  
  // Generate the daily challenge when user selects a date
  const loadDailyChallenge = (date: Date) => {
    setLoading(true);
    setLoadingProgress(0);
    setShowPuzzleList(false);
    
    // Simulate progressive loading
    const loadingInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 90 ? 90 : newProgress;
      });
    }, 200);
    
    // Use setTimeout to delay puzzle generation
    setTimeout(() => {
      console.log(`Generating daily challenge for: ${format(date, 'yyyy-MM-dd')}`);
      const dailyPuzzle = generateDailyChallenge(date);
      
      // Complete the loading progress
      clearInterval(loadingInterval);
      setLoadingProgress(100);
      
      // Add a small delay before showing the puzzle
      setTimeout(() => {
        setPuzzle(dailyPuzzle);
        setMoveHistory([dailyPuzzle]);
        setCurrentMoveIndex(0);
        setGameStarted(false);
        setTimer(0);
        setLoading(false);
        setGameCompleted(false);
        console.log(`Generated daily puzzle with seed: ${dailyPuzzle.seed}`);
      }, 500);
    }, 1000);
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    loadDailyChallenge(date);
  };
  
  // Update timer
  useEffect(() => {
    if (!puzzle || gameCompleted || loading || !gameStarted) return;
    
    const interval = setInterval(() => {
      setTimer(Date.now() - puzzle.startTime!);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [puzzle, gameCompleted, loading, gameStarted]);
  
  // Handle puzzle updates
  const handlePuzzleUpdate = (updatedPuzzle: Puzzle) => {
    // Start the timer on first move
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
    
    // Check if puzzle is solved
    if (updatedPuzzle.solved && !gameCompleted) {
      setGameCompleted(true);
      savePuzzle(updatedPuzzle);
      updateStats(updatedPuzzle);
      
      // Only update daily completion for today's challenge
      if (format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        setDailyCompleted();
      }
      
      toast({
        title: "Daily Challenge Completed!",
        description: `You completed the challenge in ${formatTime(updatedPuzzle.endTime! - updatedPuzzle.startTime!)}`,
      });
    }
  };
  
  // Restart the daily puzzle
  const restartPuzzle = () => {
    console.log(`Restarting daily challenge for: ${format(selectedDate, 'yyyy-MM-dd')}`);
    const dailyPuzzle = generateDailyChallenge(selectedDate);
    setPuzzle(dailyPuzzle);
    setMoveHistory([dailyPuzzle]);
    setCurrentMoveIndex(0);
    setGameStarted(false);
    setTimer(0);
    setGameCompleted(false);
  };
  
  // Go back to puzzle list
  const handleBackToPuzzleList = () => {
    setShowPuzzleList(true);
  };
  
  // Handle undo
  const handleUndo = () => {
    if (currentMoveIndex > 0) {
      const previousMove = moveHistory[currentMoveIndex - 1];
      setPuzzle(previousMove);
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  };

  // Handle redo
  const handleRedo = () => {
    if (currentMoveIndex < moveHistory.length - 1) {
      const nextMove = moveHistory[currentMoveIndex + 1];
      setPuzzle(nextMove);
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  };
  
  // Display puzzle list if no date selected yet
  if (showPuzzleList) {
    return (
      <div className="content-container max-w-4xl px-4 py-12 md:py-16 mx-auto mt-16 animate-fade-in page-transition scrollable-container">
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
          
          <h1 className="text-xl font-semibold">Daily Challenge</h1>
          
          <div className="w-10">{/* Spacer */}</div>
        </div>
        
        <DailyPuzzleList
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
        />
      </div>
    );
  }
  
  // Display loading screen while waiting for the puzzle to be generated
  if (loading) {
    return (
      <div className="container max-w-4xl px-4 py-12 md:py-16 mx-auto mt-16 animate-fade-in page-transition">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackToPuzzleList}
            className="rounded-full"
            aria-label="Back to puzzle list"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                className="h-8 border-dashed flex items-center gap-1"
                disabled
              >
                <Calendar className="h-4 w-4 text-primary" />
                <span>{format(selectedDate, 'MMM dd, yyyy')}</span>
              </Button>
            </div>
          </div>
          
          <div className="w-10">{/* Spacer */}</div>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-full max-w-md space-y-4">
            <Progress value={loadingProgress} className="h-2 w-full" />
            <p className="text-center text-sm text-muted-foreground">
              Generating daily challenge...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading daily challenge...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl px-4 py-12 md:py-16 mx-auto mt-16 animate-fade-in page-transition scrollable-container">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBackToPuzzleList}
          className="rounded-full"
          aria-label="Back to puzzle list"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-medium mb-1">Daily Challenge</h2>
          <div className="flex items-center text-sm text-foreground/70 space-x-2">
            <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
            <span className="text-primary">•</span>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatTime(timer)}</span>
            </div>
          </div>
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
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={restartPuzzle}
            className="rounded-full h-8 w-8"
            aria-label="Restart puzzle"
          >
            <ArrowLeft className="h-4 w-4 opacity-0" /> {/* Placeholder for layout */}
          </Button>
        </div>
      </div>
      
      <Board puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
      
      {gameCompleted && (
        <GameCompletedModal
          time={puzzle.endTime! - puzzle.startTime!}
          resetPuzzle={restartPuzzle}
          seed={puzzle.seed}
        />
      )}
    </div>
  );
};

export default DailyChallenge;
