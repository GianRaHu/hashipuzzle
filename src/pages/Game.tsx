
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { generatePuzzle, Puzzle, isSolved, undoLastMove } from '@/utils/gameLogic';
import Board from '@/components/Board';
import { saveCurrentGame, getCurrentGame, clearCurrentGame, updateStats, formatTime } from '@/utils/storage';
import { motion } from 'framer-motion';
import GameCompletedModal from '@/components/game/GameCompletedModal';
import GameHeader from '@/components/game/GameHeader';

const Game: React.FC = () => {
  const { difficulty = 'easy' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [bestTime, setBestTime] = useState<number>(0);

  // Check if we should create a new puzzle (from URL query param)
  const shouldCreateNew = location.search.includes('t=');
  
  useEffect(() => {
    // Load best time for this difficulty
    const stats = JSON.parse(localStorage.getItem('hashi_stats') || '{}');
    const difficultyBestTime = stats?.bestTime?.[difficulty] || 0;
    setBestTime(difficultyBestTime);
    
    // Try to load existing game or create new one
    const savedPuzzle = getCurrentGame(difficulty);
    
    if (savedPuzzle && !shouldCreateNew) {
      console.log('Loading saved puzzle for difficulty:', difficulty);
      setPuzzle(savedPuzzle);
      
      if (savedPuzzle.startTime && !savedPuzzle.endTime) {
        setGameStarted(true);
        // Calculate elapsed time
        const elapsed = savedPuzzle.lastPlayedTime ? 
          (Date.now() - savedPuzzle.lastPlayed) + savedPuzzle.lastPlayedTime : 
          Date.now() - savedPuzzle.startTime;
        setTimer(elapsed);
      }
    } else {
      console.log('Creating new puzzle for difficulty:', difficulty);
      const newPuzzle = generatePuzzle(difficulty);
      setPuzzle(newPuzzle);
    }
  }, [difficulty, shouldCreateNew]);
  
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
    
    // Save current time played
    updatedPuzzle.lastPlayedTime = timer;
    updatedPuzzle.lastPlayed = Date.now();
    
    // Check if puzzle is solved
    if (isSolved(updatedPuzzle) && !gameCompleted) {
      updatedPuzzle.endTime = Date.now();
      setGameCompleted(true);
      clearCurrentGame(difficulty);
      updateStats(updatedPuzzle);
    } else {
      // Save progress
      saveCurrentGame(updatedPuzzle);
    }
    
    setPuzzle(updatedPuzzle);
  }, [difficulty, gameStarted, timer, gameCompleted]);

  const handleUndo = useCallback(() => {
    if (!puzzle) return;
    const updatedPuzzle = undoLastMove(puzzle);
    handlePuzzleUpdate(updatedPuzzle);
  }, [puzzle, handlePuzzleUpdate]);

  const restartPuzzle = useCallback(() => {
    if (!puzzle) return;
    
    // Create a new puzzle with the same seed for true restart
    const restartedPuzzle = generatePuzzle(difficulty, puzzle.seed);
    clearCurrentGame(difficulty);
    
    setGameStarted(false);
    setGameCompleted(false);
    setTimer(0);
    setPuzzle(restartedPuzzle);
  }, [puzzle, difficulty]);
  
  const newPuzzle = useCallback(() => {
    // Force a new random puzzle
    const newPuzzle = generatePuzzle(difficulty);
    clearCurrentGame(difficulty);
    
    setGameStarted(false);
    setGameCompleted(false);
    setTimer(0);
    setPuzzle(newPuzzle);
  }, [difficulty]);

  return (
    <div className="content-container flex flex-col items-center justify-center max-w-4xl animate-fade-in page-transition">
      <GameHeader 
        timer={timer}
        bestTime={bestTime}
        handleUndo={handleUndo}
        restartPuzzle={restartPuzzle}
        canUndo={puzzle?.moveHistory?.length ? puzzle.moveHistory.length > 0 : false}
        gameStarted={gameStarted}
      />
      
      <div className="my-8 flex-1 flex items-center justify-center w-full">
        {puzzle ? (
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
            <p>Loading puzzle...</p>
          </div>
        )}
      </div>
      
      {gameCompleted && puzzle && (
        <GameCompletedModal 
          time={timer} 
          resetPuzzle={newPuzzle}
          seed={puzzle.seed}
        />
      )}
    </div>
  );
};

export default Game;
