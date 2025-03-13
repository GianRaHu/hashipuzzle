
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Puzzle, undoLastMove } from '@/utils/gameLogic';
import { generateCustomPuzzle } from '@/utils/customPuzzleGenerator';
import Board from '@/components/Board';
import { saveCurrentGame, updateStats, formatTime } from '@/utils/storage';
import { motion } from 'framer-motion';
import GameCompletedModal from '@/components/game/GameCompletedModal';
import GameHeader from '@/components/game/GameHeader';
import { useToast } from '@/hooks/use-toast';

const CustomGamePlay: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get query parameters
  const searchParams = new URLSearchParams(location.search);
  const seed = parseInt(searchParams.get('seed') || '0', 10);
  const size = parseInt(searchParams.get('size') || '7', 10);
  const islands = parseInt(searchParams.get('islands') || '10', 10);
  
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Generate a custom puzzle based on parameters
  useEffect(() => {
    setLoading(true);
    
    try {
      console.log(`Generating custom puzzle - Seed: ${seed}, Size: ${size}, Islands: ${islands}`);
      const newPuzzle = generateCustomPuzzle(seed, size, islands);
      setPuzzle(newPuzzle);
    } catch (error) {
      console.error('Error generating puzzle:', error);
      toast({
        title: "Error Generating Puzzle",
        description: "An error occurred. Please try different settings.",
        variant: "destructive"
      });
      navigate('/custom');
    } finally {
      setLoading(false);
    }
  }, [seed, size, islands, navigate, toast]);
  
  // Update timer
  useEffect(() => {
    if (!puzzle || gameCompleted || !gameStarted) return;
    
    const interval = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1000);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [puzzle, gameCompleted, gameStarted]);
  
  const handlePuzzleUpdate = useCallback((updatedPuzzle: Puzzle) => {
    if (!gameStarted) {
      setGameStarted(true);
      updatedPuzzle = {
        ...updatedPuzzle,
        startTime: Date.now()
      };
    }
    
    // Check if puzzle is solved
    if (updatedPuzzle.solved && !gameCompleted) {
      updatedPuzzle.endTime = Date.now();
      setGameCompleted(true);
      updateStats(updatedPuzzle);
      
      toast({
        title: "Puzzle Completed!",
        description: `You solved the puzzle in ${formatTime(timer)}`,
      });
    }
    
    setPuzzle(updatedPuzzle);
  }, [gameStarted, timer, gameCompleted, toast]);
  
  const handleUndo = useCallback(() => {
    if (!puzzle) return;
    const updatedPuzzle = undoLastMove(puzzle);
    handlePuzzleUpdate(updatedPuzzle);
  }, [puzzle, handlePuzzleUpdate]);
  
  const restartPuzzle = useCallback(() => {
    if (!seed) return;
    
    setLoading(true);
    
    try {
      const restartedPuzzle = generateCustomPuzzle(seed, size, islands);
      setGameStarted(false);
      setGameCompleted(false);
      setTimer(0);
      setPuzzle(restartedPuzzle);
    } catch (error) {
      console.error('Error restarting puzzle:', error);
      toast({
        title: "Error Restarting Puzzle",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [seed, size, islands, toast]);
  
  return (
    <div className="content-container flex flex-col items-center justify-center max-w-4xl animate-fade-in page-transition">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="flex justify-between items-center my-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/custom')}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
          
          <div className="text-center">
            <h2 className="text-lg font-medium">Custom Puzzle</h2>
            <p className="text-xs text-muted-foreground">Seed: {seed}</p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={restartPuzzle}
          >
            Restart
          </Button>
        </div>
      </div>
      
      <GameHeader 
        timer={timer}
        bestTime={0}
        handleUndo={handleUndo}
        restartPuzzle={restartPuzzle}
        canUndo={puzzle?.moveHistory?.length ? puzzle.moveHistory.length > 0 : false}
        gameStarted={gameStarted}
      />
      
      <div className="my-8 flex-1 flex items-center justify-center w-full">
        {loading ? (
          <div className="text-center p-8">
            <p>Generating puzzle...</p>
          </div>
        ) : puzzle ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-auto"
          >
            <Board puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
          </motion.div>
        ) : (
          <div className="text-center p-8">
            <p>Failed to generate puzzle</p>
          </div>
        )}
      </div>
      
      {gameCompleted && puzzle && (
        <GameCompletedModal 
          time={timer} 
          resetPuzzle={restartPuzzle}
          seed={puzzle.seed}
        />
      )}
    </div>
  );
};

export default CustomGamePlay;
