import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Board from '../components/Board';
import { generatePuzzle } from '../utils/puzzleGenerator';
import { Puzzle, Bridge } from '../utils/gameLogic';
import GameControls from '../components/GameControls';
import GameStats from '../components/GameStats';
import HelpDialog from '../components/game/HelpDialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from "@/components/ui/use-toast"

const Game: React.FC = () => {
  const params = useParams<{ difficulty: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [gameHistory, setGameHistory] = useLocalStorage<Puzzle[]>('gameHistory', []);
  const { toast } = useToast()
  
  const handleSolve = useCallback(() => {
    if (puzzle) {
      // Check if all islands are satisfied
      const allIslandsSatisfied = puzzle.islands.every(island => {
        const connectedBridges = puzzle.bridges.filter(bridge => 
          bridge.startIslandId === island.id || bridge.endIslandId === island.id
        );
        const totalBridges = connectedBridges.reduce((sum, bridge) => sum + bridge.count, 0);
        return totalBridges === island.value;
      });
      
      if (allIslandsSatisfied) {
        // Check if all islands are connected
        const isConnected = puzzle.islands.every(island => {
          return puzzle.bridges.some(bridge => bridge.startIslandId === island.id || bridge.endIslandId === island.id);
        });
        
        if (isConnected) {
          // Puzzle is solved
          setPuzzle(prevPuzzle => {
            if (prevPuzzle) {
              const updatedPuzzle = { ...prevPuzzle, solved: true, endTime: Date.now() };
              setGameHistory([updatedPuzzle, ...gameHistory.filter(game => game.id !== updatedPuzzle.id)]);
              toast({
                title: "Congratulations!",
                description: "You solved the puzzle!",
              })
              return updatedPuzzle;
            }
            return prevPuzzle;
          });
        } else {
          // Not all islands are connected
          toast({
            title: "Not quite!",
            description: "All islands must be connected.",
          })
        }
      } else {
        // Not all islands are satisfied
        toast({
          title: "Keep trying!",
          description: "Not all islands have the correct number of bridges.",
        })
      }
    }
  }, [puzzle, gameHistory, setGameHistory, toast]);
  
  const handleUndo = useCallback(() => {
    setPuzzle(prevPuzzle => {
      if (!prevPuzzle) return prevPuzzle;
      
      // Remove the last bridge
      const lastBridgeIndex = prevPuzzle.bridges.length - 1;
      if (lastBridgeIndex < 0) return prevPuzzle;
      
      const lastBridge = prevPuzzle.bridges[lastBridgeIndex];
      const startIsland = prevPuzzle.islands.find(island => island.id === lastBridge.startIslandId);
      const endIsland = prevPuzzle.islands.find(island => island.id === lastBridge.endIslandId);
      
      if (!startIsland || !endIsland) return prevPuzzle;
      
      // Update island values
      startIsland.value -= lastBridge.count;
      endIsland.value -= lastBridge.count;
      
      // Remove the bridge
      const updatedBridges = [...prevPuzzle.bridges];
      updatedBridges.pop();
      
      const updatedPuzzle = {
        ...prevPuzzle,
        bridges: updatedBridges,
        islands: [...prevPuzzle.islands]
      };
      
      return updatedPuzzle;
    });
  }, [setPuzzle]);
  
  const handleReset = useCallback(() => {
    setPuzzle(prevPuzzle => {
      if (!prevPuzzle) return prevPuzzle;
      
      // Reset the puzzle to its initial state
      const initialPuzzle = {
        ...prevPuzzle,
        bridges: [],
        islands: prevPuzzle.islands.map(island => ({ ...island, value: 0 })),
        solved: false
      };
      
      return initialPuzzle;
    });
  }, [setPuzzle]);
  
  const handleAddBridge = useCallback((startIslandId: string, endIslandId: string) => {
    setPuzzle(prevPuzzle => {
      if (!prevPuzzle) return prevPuzzle;
      
      const startIsland = prevPuzzle.islands.find(island => island.id === startIslandId);
      const endIsland = prevPuzzle.islands.find(island => island.id === endIslandId);
      
      if (!startIsland || !endIsland) return prevPuzzle;
      
      // Check if islands are already connected
      const existingBridgeIndex = prevPuzzle.bridges.findIndex(
        bridge => (bridge.startIslandId === startIslandId && bridge.endIslandId === endIslandId) ||
                  (bridge.startIslandId === endIslandId && bridge.endIslandId === startIslandId)
      );
      
      if (existingBridgeIndex !== -1) {
        // Already has a bridge, ensure we don't exceed max
        const existingBridge = prevPuzzle.bridges[existingBridgeIndex];
        if (existingBridge.count === 1 && startIsland.value < 8 && endIsland.value < 8) {
          // Upgrade to double bridge
          existingBridge.count = 2;
          startIsland.value += 1;
          endIsland.value += 1;
        } else {
          // Remove bridge
          startIsland.value -= existingBridge.count;
          endIsland.value -= existingBridge.count;
          prevPuzzle.bridges.splice(existingBridgeIndex, 1);
        }
      } else {
        // Create new bridge
        const orientation = startIsland.row === endIsland.row ? 'horizontal' : 'vertical';
        const newBridge: Bridge = {
          id: `${startIslandId}-${endIslandId}`,
          startIslandId: startIslandId,
          endIslandId: endIslandId,
          count: 1,
          orientation: orientation
        };
        
        startIsland.value += 1;
        endIsland.value += 1;
        prevPuzzle.bridges.push(newBridge);
      }
      
      return {
        ...prevPuzzle,
        bridges: [...prevPuzzle.bridges],
        islands: [...prevPuzzle.islands]
      };
    });
  }, [setPuzzle]);

  useEffect(() => {
    // Get difficulty parameter from URL
    const difficultyParam = params.difficulty;
    
    // Handle custom games
    if (difficultyParam === 'custom') {
      const searchParams = new URLSearchParams(location.search);
      const sizeParam = searchParams.get('size');
      const seedParam = searchParams.get('seed');
      
      let customSize = 7; // Default size
      if (sizeParam) {
        const parsedSize = parseInt(sizeParam, 10);
        if (!isNaN(parsedSize) && parsedSize >= 5 && parsedSize <= 15) {
          customSize = parsedSize;
        }
      }
      
      let customSeed: number | undefined = undefined;
      if (seedParam) {
        const parsedSeed = parseInt(seedParam, 10);
        if (!isNaN(parsedSeed)) {
          customSeed = parsedSeed;
        }
      }
      
      // Generate a custom puzzle
      let newPuzzle: Puzzle;
      if (customSeed !== undefined) {
        newPuzzle = generatePuzzle('medium', customSeed);
      } else {
        newPuzzle = generatePuzzle('medium');
      }
      
      // Override the size after generation
      newPuzzle.size = customSize;
      newPuzzle.difficulty = 'custom';
      
      setPuzzle(newPuzzle);
      setLoading(false);
      return;
    }
    
    // Handle standard difficulties
    let difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master' = 'medium';
    switch (difficultyParam) {
      case 'easy':
      case 'medium':
      case 'hard':
      case 'expert':
      case 'master':
        difficulty = difficultyParam;
        break;
      default:
        navigate('/not-found');
        return;
    }
    
    // Check if we have a saved game state in history
    const savedGame = gameHistory.find(game => game.difficulty === difficulty);
    if (savedGame && !savedGame.solved) {
      // Load saved game
      setPuzzle(savedGame);
      setLoading(false);
    } else {
      // Generate a new puzzle
      const newPuzzle = generatePuzzle(difficulty);
      setPuzzle(newPuzzle);
      setLoading(false);
    }
  }, [params.difficulty, location.search, gameHistory, navigate]);

  if (loading) {
    return <div className="content-container">Loading...</div>;
  }

  if (!puzzle) {
    return <div className="content-container">Error generating puzzle.</div>;
  }
  
  return (
    <div className="content-container">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-2/3">
          <div className="relative">
            <Board puzzle={puzzle} onAddBridge={handleAddBridge} />
          </div>
        </div>
        <div className="md:w-1/3 flex flex-col gap-4">
          <GameControls 
            onSolve={handleSolve}
            onUndo={handleUndo}
            onReset={handleReset}
          />
          <GameStats puzzle={puzzle} />
          <HelpDialog />
        </div>
      </div>
    </div>
  );
};

export default Game;
