
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getStats, isFirstTimeUser } from '../utils/storage';
import { useToast } from '@/hooks/use-toast';
import { hapticFeedback } from '../utils/haptics';
import { usePuzzleGenerator } from '@/hooks/usePuzzleGenerator';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useGameTimer } from '@/hooks/useGameTimer';
import { useGameSettings } from '@/hooks/useGameSettings';

import EnhancedBoard from '../components/enhanced/EnhancedBoard';
import GameHeader from '../components/game/GameHeader';
import GameCompletedModal from '../components/game/GameCompletedModal';
import ConnectivityAlert from '../components/ConnectivityAlert';
import GameLoading from '@/components/game/GameLoading';
import FirstTimeTutorial from '@/components/tutorial/FirstTimeTutorial';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { difficulty } = useParams<{ difficulty: string }>();
  const location = useLocation();
  
  // Get URL parameters
  const urlParams = new URLSearchParams(location.search);
  
  // For seed-based generation, we only need the seed
  const seedParam = urlParams.get('seed');
  const initialSeed = seedParam ? parseInt(seedParam, 10) : undefined;
  
  // For custom configuration generation, we need gridSize and advancedTactics
  const gridSizeParam = urlParams.get('gridSize');
  const initialGridSize = gridSizeParam ? parseInt(gridSizeParam, 10) : undefined;
  const advancedTacticsParam = urlParams.get('advancedTactics');
  const initialAdvancedTactics = advancedTacticsParam === 'true';
  
  console.log(`Game page loaded with difficulty: ${difficulty}, seed: ${initialSeed}`);
  
  // Log all URL parameters for debugging
  urlParams.forEach((value, key) => {
    console.log(`URL parameter: ${key} = ${value}`);
  });
  
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [restartConfirmOpen, setRestartConfirmOpen] = useState<boolean>(false);
  const [showConnectionAlert, setShowConnectionAlert] = useState<boolean>(false);
  const [userOverrodeConnectivity, setUserOverrodeConnectivity] = useState<boolean>(false);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  
  const validDifficulties = ['easy', 'medium', 'hard', 'expert', 'custom'];
  const validDifficulty = validDifficulties.includes(difficulty || '') 
    ? difficulty as 'easy' | 'medium' | 'hard' | 'expert' | 'custom'
    : 'easy';
  
  const settings = useGameSettings();
  
  useEffect(() => {
    // Check if this is the user's first time playing
    if (isFirstTimeUser()) {
      setShowTutorial(true);
    }
  }, []);
  
  // Handle haptic feedback on bridge placement
  const triggerHapticFeedback = useCallback((bridgeCount: number) => {
    if (settings.hapticFeedback) {
      if (bridgeCount === 1) {
        hapticFeedback.light();
      } else {
        hapticFeedback.medium();
      }
    }
  }, [settings.hapticFeedback]);
  
  const stats = getStats();
  const bestTime = stats.bestTime[difficulty as string] || 0;

  // Update extended stats function
  const updateExtendedStats = (difficultyLevel: string, completionTime?: number | null, completed: boolean = false) => {
    console.log(`Updating extended stats for ${difficultyLevel} - Time: ${completionTime}, Completed: ${completed}`);
    // Stats updating logic is handled elsewhere
  };

  // Custom hooks
  const {
    puzzle,
    setPuzzle,
    loading,
    loadingProgress,
    generateError,
    resetPuzzle,
    restartPuzzle
  } = usePuzzleGenerator({
    difficulty,
    validDifficulty,
    initialSeed,
    initialGridSize,
    initialAdvancedTactics,
    updateExtendedStats
  });

  const {
    gameStarted,
    moveHistory,
    handlePuzzleUpdate,
    handleContinueAnyway,
    handleUndo,
    updateExtendedStats: gameLogicUpdateStats
  } = useGameLogic({
    puzzle,
    setPuzzle,
    setGameCompleted,
    setShowConnectionAlert,
    userOverrodeConnectivity,
    triggerHapticFeedback,
    validDifficulty,
    setShowCompletionModal
  });

  const timer = useGameTimer(puzzle, gameCompleted, loading, gameStarted);

  const handleRestartConfirm = () => {
    setRestartConfirmOpen(false);
    restartPuzzle();
  };

  const handleContinuePlaying = () => {
    setShowConnectionAlert(false);
  };

  const showHelp = () => {
    toast({
      title: "How to Play",
      description: "Connect islands with bridges. Each island must have exactly the number of bridges shown on it. Bridges can't cross each other. All islands must be connected to each other.",
      duration: 5000,
    });
  };
  
  if (loading) {
    return (
      <GameLoading 
        difficulty={difficulty || 'easy'} 
        loadingProgress={loadingProgress} 
        generateError={generateError} 
      />
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
        bestTime={bestTime}
        handleUndo={handleUndo}
        restartPuzzle={handleRestartConfirm}
        setShowRestartDialog={setRestartConfirmOpen}
        showRestartDialog={restartConfirmOpen}
        canUndo={moveHistory.length > 1}
        gameStarted={gameStarted}
        showTimer={settings.showTimer}
        showBestTime={settings.showBestTime}
      />
      
      <main className="flex-1 pt-14 pb-4 px-2 flex flex-col items-center justify-start overflow-y-auto">
        <h1 className="text-lg font-medium capitalize mb-3">
          {difficulty} Puzzle 
          {initialSeed && <span className="text-sm text-muted-foreground ml-2">(Seed: {initialSeed})</span>}
          {puzzle?.requiresAdvancedTactics && <span className="text-sm text-amber-500 ml-2">(Advanced)</span>}
        </h1>
        
        {showConnectionAlert && !gameCompleted && (
          <ConnectivityAlert 
            onContinue={handleContinueAnyway}
            onContinueToPlay={handleContinuePlaying}
          />
        )}
        
        <div className="game-container w-full max-w-lg mx-auto">
          <EnhancedBoard puzzle={puzzle} onUpdate={handlePuzzleUpdate} />
        </div>
        
        {gameCompleted && showCompletionModal && (
          <GameCompletedModal 
            time={puzzle?.endTime! - puzzle?.startTime!}
            resetPuzzle={resetPuzzle}
            seed={puzzle?.seed}
            onClose={() => setShowCompletionModal(false)}
          />
        )}

        {/* First time tutorial */}
        <FirstTimeTutorial
          open={showTutorial}
          onClose={() => setShowTutorial(false)}
        />
      </main>
    </div>
  );
};

export default Game;
