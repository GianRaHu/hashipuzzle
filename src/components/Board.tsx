
import { useEffect, useCallback, useRef, useState, memo } from 'react';
import { Puzzle, Island, toggleBridge, canConnect } from '@/utils/gameLogic';
import { triggerHaptic } from '@/utils/haptics';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface BoardProps {
  puzzle: Puzzle;
  onUpdate: (puzzle: Puzzle) => void;
}

interface Point {
  x: number;
  y: number;
}

const Board = memo<BoardProps>(({ puzzle, onUpdate }) => {
  const [selectedIsland, setSelectedIsland] = useState<Island | null>(null);
  const [swipeStart, setSwipeStart] = useState<Point | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<Point | null>(null);
  const [potentialTarget, setPotentialTarget] = useState<Island | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  
  const swipeThreshold = 10; // Reduced threshold for more responsive feel
  const angleTolerance = Math.PI / 3; // Increased angle tolerance
  const lastTouchTime = useRef<number>(0);
  const touchTimeout = useRef<number | null>(null);

  const findIslandInDirection = useCallback((start: Island, direction: Point): Island | null => {
    const angle = Math.atan2(direction.y, direction.x);
    const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;

    return puzzle.islands.find(island => {
      if (island.id === start.id) return false;

      const dx = island.col - start.col;
      const dy = island.row - start.row;
      const islandAngle = Math.atan2(dy, dx);
      const normalizedIslandAngle = islandAngle < 0 ? islandAngle + 2 * Math.PI : islandAngle;
      
      let angleDiff = Math.abs(normalizedAngle - normalizedIslandAngle);
      angleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);

      const isAligned = angleDiff < angleTolerance;
      const isValidConnection = start.row === island.row || start.col === island.col;

      return isAligned && isValidConnection && 
             canConnect(start, island, puzzle.islands, puzzle.bridges);
    }) || null;
  }, [puzzle.islands, puzzle.bridges]);

  const handleTouchStart = useCallback((event: MouseEvent | TouchEvent) => {
    if (touchTimeout.current) {
      window.clearTimeout(touchTimeout.current);
      touchTimeout.current = null;
    }

    const touch = 'touches' in event ? event.touches[0] : event;
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    const x = touch.clientX - boardRect.left;
    const y = touch.clientY - boardRect.top;
    setSwipeStart({ x, y });
    lastTouchTime.current = Date.now();
    setPotentialTarget(null);
  }, []);

  const handleTouchMove = useCallback((event: MouseEvent | TouchEvent) => {
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
      const direction = {
        x: dx / distance,
        y: dy / distance
      };
      
      setSwipeDirection({ x: dx, y: dy });
      const target = findIslandInDirection(selectedIsland, direction);
      setPotentialTarget(target);
    }
  }, [swipeStart, selectedIsland, findIslandInDirection]);

  const handleTouchEnd = useCallback(() => {
    if (!swipeStart || !selectedIsland || !swipeDirection || !potentialTarget) {
      setSwipeStart(null);
      setSwipeDirection(null);
      setPotentialTarget(null);
      return;
    }

    triggerHaptic('medium');
    const updatedPuzzle = toggleBridge(selectedIsland, potentialTarget, puzzle);
    onUpdate(updatedPuzzle);

    // Reset all touch states
    setSwipeStart(null);
    setSwipeDirection(null);
    setPotentialTarget(null);
    setSelectedIsland(null);
  }, [swipeStart, selectedIsland, swipeDirection, potentialTarget, puzzle, onUpdate]);

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
      board.addEventListener('touchstart', handleTouchStart, { passive: true });
      board.addEventListener('touchmove', handleTouchMove, { passive: true });
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
    <motion.div 
      ref={boardRef}
      className="board relative bg-background shadow-lg rounded-lg p-4"
      style={{
        width: cellSize * (gridSize + 2),
        height: cellSize * (gridSize + 2),
        touchAction: 'none'
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className="grid absolute inset-4"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
          gap: '0px'
        }}
      >
        <AnimatePresence>
          {puzzle.bridges.map((bridge) => {
            const start = puzzle.islands.find(i => i.id === bridge.startIslandId)!;
            const end = puzzle.islands.find(i => i.id === bridge.endIslandId)!;
            
            const isHorizontal = bridge.orientation === 'horizontal';
            const length = isHorizontal 
              ? Math.abs(end.col - start.col) * cellSize
              : Math.abs(end.row - start.row) * cellSize;
            
            return (
              <motion.div
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
                  zIndex: 10
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
              />
            );
          })}
        </AnimatePresence>

        {puzzle.islands.map((island) => (
          <motion.div
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
              fontSize: `${cellSize * 0.4}px`,
              zIndex: 20
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleIslandClick(island);
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleIslandClick(island);
            }}
          >
            {island.value}
          </motion.div>
        ))}

        {selectedIsland && swipeDirection && (
          <>
            <motion.div
              className="absolute bg-primary/30 rounded-full"
              style={{
                width: '8px',
                height: '8px',
                left: `${selectedIsland.col * cellSize + cellSize / 2 - 4}px`,
                top: `${selectedIsland.row * cellSize + cellSize / 2 - 4}px`,
                transform: `translate(${swipeDirection.x}px, ${swipeDirection.y}px)`,
                pointerEvents: 'none',
                zIndex: 30
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
            />
            {potentialTarget && (
              <motion.div
                className="absolute bg-primary/20 rounded-full"
                style={{
                  width: cellSize * 0.9,
                  height: cellSize * 0.9,
                  left: `${potentialTarget.col * cellSize + cellSize * 0.05}px`,
                  top: `${potentialTarget.row * cellSize + cellSize * 0.05}px`,
                  pointerEvents: 'none',
                  zIndex: 25
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
});

Board.displayName = 'Board';

export default Board;
