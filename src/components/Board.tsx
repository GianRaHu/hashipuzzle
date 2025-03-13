import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Puzzle, Island, Bridge, toggleBridge, canConnect } from '@/utils/gameLogic';
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
  const [potentialTarget, setPotentialTarget] = useState<Island | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Reduced swipe threshold
  const swipeThreshold = 15; // Even shorter minimum distance to trigger
  const angleTolerance = Math.PI / 4; // Increased angle tolerance
  const lastTouchTime = useRef<number>(0);

  const findIslandInDirection = (start: Island, direction: Point, islands: Island[]): Island | null => {
    const angle = Math.atan2(direction.y, direction.x);

    // Normalize angle to 0-2π range
    const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;

    return islands.find(island => {
      if (island.id === start.id) return false;

      const dx = island.col - start.col;
      const dy = island.row - start.row;
      const islandAngle = Math.atan2(dy, dx);
      const normalizedIslandAngle = islandAngle < 0 ? islandAngle + 2 * Math.PI : islandAngle;
      
      // Calculate absolute angle difference, handling wrap-around
      let angleDiff = Math.abs(normalizedAngle - normalizedIslandAngle);
      angleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);

      const isAligned = angleDiff < angleTolerance;
      const isValidConnection = start.row === island.row || start.col === island.col;

      return isAligned && isValidConnection && 
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
    setPotentialTarget(null);
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

    // Early trigger for direction detection
    if (distance > swipeThreshold) {
      const direction = {
        x: dx / distance, // Normalized direction vector
        y: dy / distance
      };
      
      setSwipeDirection({ x: dx, y: dy });

      // Find potential target based on direction, not distance
      const target = findIslandInDirection(selectedIsland, direction, puzzle.islands);
      setPotentialTarget(target);
    }
  }, [swipeStart, selectedIsland, puzzle.islands]);

  const handleTouchEnd = useCallback((event: TouchEvent | MouseEvent) => {
    if (!swipeStart || !selectedIsland || !swipeDirection) {
      setSwipeStart(null);
      setSwipeDirection(null);
      setPotentialTarget(null);
      return;
    }

    const dx = swipeDirection.x;
    const dy = swipeDirection.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= swipeThreshold && potentialTarget) {
      triggerHaptic('medium');
      const updatedPuzzle = toggleBridge(selectedIsland, potentialTarget, puzzle);
      onUpdate(updatedPuzzle);
    }

    setSwipeStart(null);
    setSwipeDirection(null);
    setPotentialTarget(null);
    setSelectedIsland(null);
  }, [swipeStart, selectedIsland, swipeDirection, potentialTarget, puzzle,

    // Only check if we've moved past the minimum threshold
    if (distance >= swipeThreshold) {
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

  const handleBridgeTap = useCallback((bridge: Bridge) => {
    triggerHaptic('light');
    
    const startIsland = puzzle.islands.find(i => i.id === bridge.startIslandId);
    const endIsland = puzzle.islands.find(i => i.id === bridge.endIslandId);
    
    if (startIsland && endIsland) {
      const updatedPuzzle = toggleBridge(startIsland, endIsland, puzzle);
      onUpdate(updatedPuzzle);
    }
  }, [puzzle, onUpdate]);

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
      <div 
        className="grid absolute inset-4"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
          gap: '0px'
        }}
      >
        {/* Bridges rendering remains the same */}
        {puzzle.bridges.map((bridge) => {
          // ... bridge rendering code remains the same
        })}

        {/* Islands rendering remains the same */}
        {puzzle.islands.map((island) => (
          // ... island rendering code remains the same
        ))}

        {/* Updated swipe indicator with potential target highlight */}
        {selectedIsland && swipeDirection && (
          <>
            <div
              className="absolute bg-primary/30 rounded-full"
              style={{
                width: '8px',
                height: '8px',
                left: `${selectedIsland.col * cellSize + cellSize / 2 - 4}px`,
                top: `${selectedIsland.row * cellSize + cellSize / 2 - 4}px`,
                transform: `translate(${swipeDirection.x}px, ${swipeDirection.y}px)`,
                transition: 'transform 0.1s ease-out',
                pointerEvents: 'none',
                zIndex: 30
              }}
            />
            {potentialTarget && (
              <div
                className="absolute bg-primary/20 rounded-full"
                style={{
                  width: cellSize * 0.9,
                  height: cellSize * 0.9,
                  left: `${potentialTarget.col * cellSize + cellSize * 0.05}px`,
                  top: `${potentialTarget.row * cellSize + cellSize * 0.05}px`,
                  pointerEvents: 'none',
                  zIndex: 25
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Board;
export default Board;
