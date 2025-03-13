
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Puzzle, undoLastMove } from '../utils/gameLogic';
import { generateDailyChallenge } from '../utils/puzzleGenerator';
import { savePuzzle, updateStats, formatTime, isDailyCompleted, setDailyCompleted } from '../utils/storage';
import Board from '../components/Board';
import GameCompletedModal from '../components/game/GameCompletedModal';
import DailyPuzzleList from '../components/game/DailyPuzzleList';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import GameHeader from '../components/game/GameHeader';

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
    
    setTimeout(() => {
      console.log(`Generating daily challenge for: ${format(date, 'yyyy-MM-dd')}`);
      const dailyPuzzle = generateDailyChallenge(date);
      dailyPuzzle.moveHistory = [];
      
      clearInterval(loadingInterval);
      setLoadingProgress(100);
      
      setTimeout(() => {
        setPuzzle(dailyPuzzle);
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
  const handlePuzzleUpdate = useCallback((updatedPuzzle: Puzzle) => {
    if (!gameStarted) {
      setGameStarted(true);
      updatedPuzzle = {
        ...updatedPuzzle,
        startTime: Date.now()
      };
    }
    
    setPuzzle(updatedPuzzle);
    
    if (updatedPuzzle.solved && !gameCompleted) {
      setGameCompleted(true);
      savePuzzle(updatedPuzzle);
      updateStats(updatedPuzzle);
      
      // Only update daily completion for today's challenge
      if (format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        setDailyCompleted(today);
        toast({
          title: "Daily Challenge Completed!",
          description: `Great job! You've completed today's challenge in ${formatTime(Date.now() - updatedPuzzle.startTime!)}.`,
        });
      }
    }
  }, [gameStarted, gameCompleted, selectedDate, today, toast]);
  
  // Handle undo
  const handleUndo = useCallback(() => {
    if (!puzzle) return;
    
    const updatedPuzzle = undoLastMove(puzzle);
    handlePuzzleUpdate(updatedPuzzle);
  }, [puzzle, handlePuzzleUpdate]);
  
  // Load the current date's challenge on mount
  useEffect(() => {
    handleDateSelect(new Date());
  }, []);
  
  return (
    <div className="content-container flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-6 animate-fade-in page-transition">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="p-0 h-9 w-9"
            aria-label="Back to home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
          
          <h1 className="text-2xl font-bold text-center">Daily Challenge</h1>
          
          <Button
            variant="ghost"
            onClick={() => setShowPuzzleList(!showPuzzleList)}
            className="p-0 h-9 w-9"
            aria-label="Toggle calendar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </Button>
        </div>
        
        {showPuzzleList ? (
          <DailyPuzzleList onSelectDate={handleDateSelect} selectedDate={selectedDate} />
        ) : loading ? (
          <div className="text-center p-8 space-y-4">
            <p className="text-lg">Generating daily challenge...</p>
            <Progress value={loadingProgress} className="w-full h-2" />
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <div className="flex justify-between w-full items-center">
              <div className="flex space-x-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPuzzleList(true)}
                  className="h-8"
                >
                  Change Date
                </Button>
                <p className="text-sm font-medium">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={!puzzle?.moveHistory?.length}
                  className="h-8"
                >
                  Undo
                </Button>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border shadow-sm w-full overflow-hidden">
              {puzzle && (
                <div className="p-4 w-full">
                  <Board puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {gameCompleted && puzzle && (
        <GameCompletedModal
          time={Date.now() - puzzle.startTime!}
          resetPuzzle={() => {
            setShowPuzzleList(true);
            setGameCompleted(false);
          }}
          seed={puzzle.seed}
        />
      )}
    </div>
  );
};

export default DailyChallenge;
