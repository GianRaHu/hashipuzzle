
import React, { useState, useEffect, useRef } from 'react';
import { 
  Puzzle, 
  Island as IslandType, 
  canConnect, 
  toggleBridge, 
  getIslandById,
  checkPuzzleSolved
} from '../utils/gameLogic';
import Island from './Island';
import Bridge from './Bridge';

interface BoardProps {
  puzzle: Puzzle;
  onUpdate: (updatedPuzzle: Puzzle) => void;
}

const Board: React.FC<BoardProps> = ({ puzzle, onUpdate }) => {
  const [selectedIsland, setSelectedIsland] = useState<IslandType | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Simplified island click handler for better performance
  const handleIslandClick = (island: IslandType) => {
    if (selectedIsland) {
      if (selectedIsland.id === island.id) {
        setSelectedIsland(null);
      } else if (canConnect(selectedIsland, island, puzzle.islands, puzzle.bridges)) {
        const updatedPuzzle = toggleBridge(selectedIsland, island, puzzle);
        onUpdate(updatedPuzzle);
        setSelectedIsland(null);
      } else {
        setSelectedIsland(island);
      }
    } else {
      setSelectedIsland(island);
    }
  };
  
  // Check if puzzle is solved
  useEffect(() => {
    if (checkPuzzleSolved(puzzle) && !puzzle.solved) {
      onUpdate({
        ...puzzle,
        solved: true,
        endTime: Date.now()
      });
    }
  }, [puzzle, onUpdate]);

  // Optimized touch handling
  useEffect(() => {
    if (!boardRef.current) return;
    
    const board = boardRef.current;
    const preventTouch = (e: TouchEvent) => e.preventDefault();
    
    board.addEventListener('touchmove', preventTouch, { passive: false });
    board.addEventListener('touchstart', preventTouch, { passive: false });
    
    return () => {
      board.removeEventListener('touchmove', preventTouch);
      board.removeEventListener('touchstart', preventTouch);
    };
  }, []);

  return (
    <div 
      ref={boardRef}
      className="relative w-full aspect-square max-w-lg mx-auto border border-border/30 rounded-lg overflow-hidden"
      aria-label="Hashi puzzle board"
      style={{ 
        touchAction: "none",
        WebkitUserSelect: "none",
        userSelect: "none"
      }}
    >
      {/* Bridges */}
      {puzzle.bridges.map(bridge => {
        const startIsland = getIslandById(puzzle.islands, bridge.startIslandId);
        const endIsland = getIslandById(puzzle.islands, bridge.endIslandId);
        
        if (startIsland && endIsland) {
          return (
            <Bridge 
              key={bridge.id}
              bridge={bridge}
              startIsland={startIsland}
              endIsland={endIsland}
              gridSize={puzzle.size}
              animate={false}
            />
          );
        }
        return null;
      })}
      
      {/* Islands */}
      {puzzle.islands.map(island => (
        <Island 
          key={island.id}
          island={island}
          isSelected={selectedIsland?.id === island.id}
          onClick={() => handleIslandClick(island)}
          gridSize={puzzle.size}
        />
      ))}
    </div>
  );
};

export default Board;
