import React, { useEffect, useCallback } from 'react';
import { Puzzle, Island, toggleBridge, canConnect } from '@/utils/gameLogic';
import { triggerHaptic } from '@/utils/haptics';
import { cn } from '@/lib/utils';

interface BoardProps {
  puzzle: Puzzle;
  onUpdate: (puzzle: Puzzle) => void;
}

const Board: React.FC<BoardProps> = ({ puzzle, onUpdate }) => {
  const [selectedIsland, setSelectedIsland] = React.useState<Island | null>(null);

  const handleIslandClick = useCallback((island: Island) => {
    triggerHaptic('light');
    
    if (selectedIsland) {
      if (canConnect(selectedIsland, island, puzzle.islands, puzzle.bridges)) {
        const updatedPuzzle = toggleBridge(selectedIsland, island, puzzle);
        onUpdate(updatedPuzzle);
      }
      setSelectedIsland(null);
    } else {
      setSelectedIsland(island);
    }
  }, [selectedIsland, puzzle, onUpdate]);

  useEffect(() => {
    const handleTouchStart = async (event: TouchEvent) => {
      try {
        await triggerHaptic('light');
      } catch (error) {
        console.warn('Haptics not available:', error);
      }
    };

    const board = document.querySelector('.board');
    if (board) {
      board.addEventListener('touchstart', handleTouchStart);
      return () => {
        board.removeEventListener('touchstart', handleTouchStart);
      };
    }
  }, []);

  // Calculate grid size
  const gridSize = puzzle.size;
  const cellSize = Math.min(window.innerWidth, 600) / (gridSize + 2);

  return (
    <div 
      className="board relative bg-background shadow-lg rounded-lg p-4"
      style={{
        width: cellSize * (gridSize + 2),
        height: cellSize * (gridSize + 2)
      }}
    >
      {/* Grid */}
      <div 
        className="grid absolute inset-4"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
          gap: '0px'
        }}
      >
        {/* Islands */}
        {puzzle.islands.map((island) => (
          <div
            key={island.id}
            className={cn(
              "island absolute flex items-center justify-center",
              "rounded-full bg-primary text-primary-foreground",
              "cursor-pointer transition-transform hover:scale-110",
              selectedIsland?.id === island.id && "ring-2 ring-offset-2 ring-primary"
            )}
            style={{
              width: cellSize * 0.8,
              height: cellSize * 0.8,
              left: `${island.col * cellSize + cellSize * 0.1}px`,
              top: `${island.row * cellSize + cellSize * 0.1}px`,
              fontSize: `${cellSize * 0.4}px`
            }}
            onClick={() => handleIslandClick(island)}
          >
            {island.value}
          </div>
        ))}

        {/* Bridges */}
        {puzzle.bridges.map((bridge) => {
          const start = puzzle.islands.find(i => i.id === bridge.startIslandId)!;
          const end = puzzle.islands.find(i => i.id === bridge.endIslandId)!;
          
          const isHorizontal = bridge.orientation === 'horizontal';
          const length = isHorizontal 
            ? Math.abs(end.col - start.col) * cellSize
            : Math.abs(end.row - start.row) * cellSize;
          
          return (
            <div
              key={bridge.id}
              className={cn(
                "bridge absolute bg-primary/80",
                bridge.count === 2 && "before:content-[''] before:absolute before:inset-0 before:bg-primary/80",
                isHorizontal 
                  ? "before:-translate-y-[3px] h-[2px]"
                  : "before:-translate-x-[3px] w-[2px]"
              )}
              style={{
                left: `${Math.min(start.col, end.col) * cellSize + cellSize / 2}px`,
                top: `${Math.min(start.row, end.row) * cellSize + cellSize / 2}px`,
                width: isHorizontal ? length : '2px',
                height: isHorizontal ? '2px' : length,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Board;
