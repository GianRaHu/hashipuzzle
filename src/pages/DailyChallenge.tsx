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
      if (format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-d
