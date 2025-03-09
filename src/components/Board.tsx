
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
  
  // Handle island click with debounce for mobile
  const handleIslandClick = (island: IslandType) => {
    console.log('Island clicked:', island.id);
    
    if (selectedIsland) {
      if (selectedIsland.id === island.id) {
        // Deselect if clicking the same island
        setSelectedIsland(null);
      } else if (canConnect(selectedIsland, island, puzzle.islands, puzzle.bridges)) {
        // Connect the islands
        const updatedPuzzle = toggleBridge(selectedIsland, island, puzzle);
        onUpdate(updatedPuzzle);
        setSelectedIsland(null);
      } else {
        // Select the new island instead
        setSelectedIsland(island);
      }
    } else {
      // Select the island
      setSelectedIsland(island);
    }
  };
  
  // Check if puzzle is solved
  useEffect(() => {
    if (checkPuzzleSolved(puzzle) && !puzzle.solved) {
      const updatedPuzzle = {
        ...puzzle,
        solved: true,
        endTime: Date.now()
      };
      onUpdate(updatedPuzzle);
    }
  }, [puzzle, onUpdate]);

  // Mobile touch optimization
  useEffect(() => {
    if (!boardRef.current) return;
    
    // Disable zoom and scrolling within the board
    const board = boardRef.current;
    
    const preventTouchDefault = (e: TouchEvent) => {
      e.preventDefault();
    };
    
    board.addEventListener('touchmove', preventTouchDefault, { passive: false });
    board.addEventListener('touchstart', preventTouchDefault, { passive: false });
    
    return () => {
      board.removeEventListener('touchmove', preventTouchDefault);
      board.removeEventListener('touchstart', preventTouchDefault);
    };
  }, [boardRef.current]);

  return (
    <div 
      ref={boardRef}
      className="relative w-full aspect-square max-w-lg mx-auto border border-border/30 rounded-lg glass-panel overflow-hidden"
      aria-label="Hashi puzzle board"
      style={{ 
        touchAction: "none", // Disable browser touch actions completely
        WebkitUserSelect: "none", // Prevent text selection
        userSelect: "none" // Prevent text selection
      }}
    >
      {/* Grid lines */}
      <div className="absolute inset-0 grid" style={{ 
        gridTemplateColumns: `repeat(${puzzle.size}, 1fr)`,
        gridTemplateRows: `repeat(${puzzle.size}, 1fr)`,
        pointerEvents: "none" // Prevent grid lines from capturing clicks
      }}>
        {Array.from({ length: puzzle.size * puzzle.size }).map((_, index) => (
          <div 
            key={index} 
            className="border border-border/10"
            aria-hidden="true"
          />
        ))}
      </div>
      
      {/* Bridges */}
      {puzzle.bridges.map(bridge => {
        const startIsland = getIslandById(puzzle.islands, bridge.startIslandId)!;
        const endIsland = getIslandById(puzzle.islands, bridge.endIslandId)!;
        
        return (
          <Bridge 
            key={bridge.id}
            bridge={bridge}
            startIsland={startIsland}
            endIsland={endIsland}
            gridSize={puzzle.size}
          />
        );
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
