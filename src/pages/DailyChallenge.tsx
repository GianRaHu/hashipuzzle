import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Puzzle, Bridge } from '../utils/gameLogic';
import { generateDailyChallenge } from '../utils/puzzleGenerator';
import { savePuzzle, updateStats, formatTime, isDailyCompleted, setDailyCompleted } from '../utils/storage';
import Board from '../components/Board';
import GameCompletedModal from '../components/game/GameCompletedModal';
import DailyPuzzleList from '../components/game/DailyPuzzleList';
import GameHeader from '../components/game/GameHeader';
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
  const [moveHistory, setMoveHistory] = useState<Bridge[][]>([]);
  const [showRestartDialog, setShowRestartDialog] = useState<boolean>(false);
  
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
        setMoveHistory([[]]);
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
    
    // Store bridges for undo functionality
    const newHistory = [...moveHistory];
    newHistory.push([...updatedPuzzle.bridges]);
    setMoveHistory(newHistory);
    
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
    setMoveHistory([[]]);
    setGameStarted(false);
    setTimer(0);
    setGameCompleted(false);
    setShowRestartDialog(false);
  };
  
  // Go back to puzzle list
  const handleBackToPuzzleList = () => {
    setShowPuzzleList(true);
  };
  
  // Handle undo
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
  
  // Display puzzle list if no date selected yet
  if (showPuzzleList) {
    return (
      <div className="content-container max-w-4xl animate-fade-in page-transition">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-center">Daily Challenge</h1>
        </div>
        
        <DailyPuzzleList
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-md space-y-4">
          <Progress value={loadingProgress} className="h-2 w-full" />
          <p className="text-center text-sm text-muted-foreground">
            Generating daily challenge...
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
        bestTime={0}
        handleUndo={handleUndo}
        restartPuzzle={restartPuzzle}
        canUndo={moveHistory.length > 1}
        gameStarted={gameStarted}
        showRestartDialog={showRestartDialog}
        setShowRestartDialog={setShowRestartDialog}
      />
      
      <main className="flex-1 pt-16 pb-6 px-2 flex flex-col items-center justify-center overflow-y-auto">
        <Board puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
        
        {gameCompleted && (
          <GameCompletedModal 
            time={puzzle.endTime! - puzzle.startTime!}
            resetPuzzle={restartPuzzle}
            seed={puzzle.seed}
          />
        )}
      </main>
    </div>
  );
};

export default DailyChallenge;
