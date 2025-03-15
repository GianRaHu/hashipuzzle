
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { generatePuzzle, Puzzle, isSolved } from '@/utils/gameLogic';
import { saveCurrentGame, getCurrentGame, clearCurrentGame, updateStats } from '@/utils/storage';
import GameCompletedModal from '@/components/game/GameCompletedModal';
import GameHeader from '@/components/game/GameHeader';
import Game from '@/components/Game';

interface GameHeaderProps {
  timer: number;
  bestTime: number;
  handleUndo: () => void;
  restartPuzzle: () => void;
  canUndo: boolean;
}

const GamePage: React.FC = () => {
  const { difficulty = 'easy' } = useParams();
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
          (savedPuzzle.lastPlayed ? Date.now() - savedPuzzle.lastPlayed : 0) + savedPuzzle.lastPlayedTime : 
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
    
    if (puzzle.moveHistory.length > 0) {
      const updatedPuzzle = {...puzzle};
      updatedPuzzle.moveHistory.pop();
      handlePuzzleUpdate(updatedPuzzle);
    }
  }, [puzzle, handlePuzzleUpdate]);

  const restartPuzzle = useCallback(() => {
    if (!puzzle) return;
    
    // Create a new puzzle with the same properties for true restart
    const restartedPuzzle = generatePuzzle(difficulty);
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
      />
      
      <div className="my-8 flex-1 flex items-center justify-center w-full">
        {puzzle ? (
          <div className="w-full max-w-md mx-auto">
            {puzzle && <Game puzzle={puzzle} onPuzzleUpdate={handlePuzzleUpdate} />}
          </div>
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
          seed={typeof puzzle.seed === 'number' ? puzzle.seed : 0}
        />
      )}
    </div>
  );
};

export default GamePage;
