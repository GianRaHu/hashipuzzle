
import { useState, useEffect } from 'react';
import { Puzzle } from '../utils/gameLogic';

export const useGameTimer = (
  puzzle: Puzzle | null, 
  gameCompleted: boolean, 
  loading: boolean,
  gameStarted: boolean
) => {
  const [timer, setTimer] = useState<number>(0);

  useEffect(() => {
    if (!puzzle || gameCompleted || loading) return;
    
    if (!gameStarted) return;
    
    const interval = setInterval(() => {
      setTimer(Date.now() - puzzle.startTime!);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [puzzle, gameCompleted, loading, gameStarted]);

  return timer;
};
