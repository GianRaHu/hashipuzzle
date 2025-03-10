import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Puzzle } from '../utils/gameLogic';
import { generateDailyChallenge } from '../utils/puzzleGenerator';
import { savePuzzle, updateStats, formatTime, isDailyCompleted, setDailyCompleted } from '../utils/storage';
import Board from '../components/Board';
import { useToast } from '@/hooks/use-toast';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Calendar as CalendarComponent,
  CalendarProps 
} from '@/components/ui/calendar';
import { addDays, format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

const DailyChallenge: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Calculate date range for calendar
  const today = new Date();
  const pastDaysLimit = 7;
  const minSelectableDate = subDays(today, pastDaysLimit);
  
  // Generate the daily challenge when component mounts or selected date changes
  useEffect(() => {
    setLoading(true);
    setLoadingProgress(0);
    
    // Simulate progressive loading
    const loadingInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 90 ? 90 : newProgress;
      });
    }, 200);
    
    // Use setTimeout to delay puzzle generation
    setTimeout(() => {
      console.log(`Generating daily challenge for: ${format(selectedDate, 'yyyy-MM-dd')}`);
      const dailyPuzzle = generateDailyChallenge(selectedDate);
      
      // Complete the loading progress
      clearInterval(loadingInterval);
      setLoadingProgress(100);
      
      // Add a small delay before showing the puzzle
      setTimeout(() => {
        setPuzzle(dailyPuzzle);
        setLoading(false);
        setGameCompleted(false);
        console.log(`Generated daily puzzle with seed: ${dailyPuzzle.seed}`);
      }, 500);
    }, 1000);
    
    return () => clearInterval(loadingInterval);
  }, [selectedDate]);
  
  // Update timer
  useEffect(() => {
    if (!puzzle || gameCompleted || loading) return;
    
    const interval = setInterval(() => {
      setTimer(Date.now() - puzzle.startTime!);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [puzzle, gameCompleted, loading]);
  
  // Handle puzzle updates
  const handlePuzzleUpdate = (updatedPuzzle: Puzzle) => {
    setPuzzle(updatedPuzzle);
    
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
    setGameCompleted(false);
  };

  // Custom day renderer for the calendar
  const dayRenderer: CalendarProps["modifiers"] = {
    selected: (date) => format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'),
    today: (date) => format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
  };
  
  // Display loading screen while waiting for the puzzle to be generated
  if (loading) {
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
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-8 border-dashed flex items-center gap-1"
                >
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{format(selectedDate, 'MMM dd, yyyy')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <CalendarComponent 
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => {
                    return date > today || date < minSelectableDate;
                  }}
                  modifiers={dayRenderer}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
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
          <h2 className="text-xl font-medium mb-2">Challenge Completed!</h2>
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
