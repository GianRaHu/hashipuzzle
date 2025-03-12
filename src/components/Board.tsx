import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Puzzle, Island, toggleBridge, canConnect, getIslandById } from '@/utils/gameLogic';
import { triggerHaptic } from '@/utils/haptics';
import { cn } from '@/lib/utils';

interface BoardProps {
  puzzle: Puzzle;
  onUpdate: (puzzle: Puzzle) => void;
}

interface Point {
  x: number;
  y: number;
}

const Board: React.FC<BoardProps> = ({ puzzle, onUpdate }) => {
  const [selectedIsland, setSelectedIsland] = useState<Island | null>(null);
  const [swipeStart, setSwipeStart] = useState<Point | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<Point | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  
  // High sensitivity thresholds
  const swipeThreshold = 20;
  const swipeSpeedThreshold = 0.3;
  const angleTolerance = Math.PI / 6;
  const lastTouchTime = useRef<number>(0);

  const findIslandInDirection = (start: Island, direction: Point, islands: Island[]): Island | null => {
    const angle = Math.atan2(direction.y, direction.x);

    return islands.find(island => {
      if (island.id === start.id) return false;

      const dx = island.col - start.col;
      const dy = island.row - start.row;
      const islandAngle = Math.atan2(dy, dx);
      
      const angleDiff = Math.abs(angle - islandAngle);
      const isAligned = angleDiff < angleTolerance || Math.abs(angleDiff - Math.PI) < angleTolerance;

      const isValidConnection = start.row === island.row || start.col === island.col;

      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = 0.5;

      return isAligned && isValidConnection && distance >= minDistance && 
             canConnect(start, island, puzzle.islands, puzzle.bridges);
    }) || null;
  };

  const handleTouchStart = useCallback((event: TouchEvent | MouseEvent) => {
    const touch = 'touches' in event ? event.touches[0] : event;
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    const x = touch.clientX - boardRect.left;
    const y = touch.clientY - boardRect.top;
    setSwipeStart({ x, y });
    lastTouchTime.current = Date.now();
  }, []);

  const handleTouchMove = useCallback((event: TouchEvent | MouseEvent) => {
    if (!swipeStart || !selectedIsland) return;
    
    const touch = 'touches' in event ? event.touches[0] : event;
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    const currentX = touch.clientX - boardRect.left;
    const currentY = touch.clientY - boardRect.top;
    
    const dx = currentX - swipeStart.x;
    const dy = currentY - swipeStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > swipeThreshold) {
      setSwipeDirection({ x: dx, y: dy });
    }
  }, [swipeStart, selectedIsland]);

  const handleTouchEnd = useCallback((event: TouchEvent | MouseEvent) => {
    if (!swipeStart || !selectedIsland || !swipeDirection) {
      setSwipeStart(null);
      setSwipeDirection(null);
      return;
    }

    const endTime = Date.now();
    const swipeDuration = endTime - lastTouchTime.current;
    const distance = Math.sqrt(
      swipeDirection.x * swipeDirection.x + 
      swipeDirection.y * swipeDirection.y
    );
    
    const speed = distance / swipeDuration;
    const minimumDistance = 30;

    if (speed >= swipeSpeedThreshold && distance >= minimumDistance) {
      const targetIsland = findIslandInDirection(selectedIsland, swipeDirection, puzzle.islands);
      if (targetIsland) {
        triggerHaptic('medium');
        const updatedPuzzle = toggleBridge(selectedIsland, targetIsland, puzzle);
        onUpdate(updatedPuzzle);
      }
    }

    setSwipeStart(null);
    setSwipeDirection(null);
    setSelectedIsland(null);
  }, [swipeStart, selectedIsland, swipeDirection, puzzle, onUpdate]);

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
    const board = boardRef.current;
    if (board) {
      board.addEventListener('touchstart', handleTouchStart);
      board.addEventListener('touchmove', handleTouchMove);
      board.addEventListener('touchend', handleTouchEnd);
      board.addEventListener('mousedown', handleTouchStart);
      board.addEventListener('mousemove', handleTouchMove);
      board.addEventListener('mouseup', handleTouchEnd);

      return () => {
        board.removeEventListener('touchstart', handleTouchStart);
        board.removeEventListener('touchmove', handleTouchMove);
        board.removeEventListener('touchend', handleTouchEnd);
        board.removeEventListener('mousedown', handleTouchStart);
        board.removeEventListener('mousemove', handleTouchMove);
        board.removeEventListener('mouseup', handleTouchEnd);
      };
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Calculate grid size
  const gridSize = puzzle.size;
  const cellSize = Math.min(window.innerWidth, 600) / (gridSize + 2);

  return (
    <div 
      ref={boardRef}
      className="board relative bg-background shadow-lg rounded-lg p-4"
      style={{
        width: cellSize * (gridSize + 2),
        height: cellSize * (gridSize + 2),
        touchAction: 'none'
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
            onMouseDown={(e) => {
              e.stopPropagation();
              handleIslandClick(island);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleIslandClick(island);
            }}
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
                pointerEvents: 'none'
              }}
            />
          );
        })}

        {/* Swipe Direction Indicator */}
        {selectedIsland && swipeDirection && (
          <div
            className="absolute bg-primary/30 rounded-full"
            style={{
              width: '8px',
              height: '8px',
              left: `${selectedIsland.col * cellSize + cellSize / 2 - 4}px`,
              top: `${selectedIsland.row * cellSize + cellSize / 2 - 4}px`,
              transform: `translate(${swipeDirection.x}px, ${swipeDirection.y}px)`,
              transition: 'transform 0.1s ease-out',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Board;
