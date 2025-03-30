
import React, { useState, useEffect, useRef } from 'react';
import { 
  Puzzle, 
  Island as IslandType, 
  canConnect, 
  toggleBridge, 
  getIslandById,
  checkPuzzleSolved,
  getBridgeBetweenIslands
} from '../utils/gameLogic';
import Island from './Island';
import Bridge from './Bridge';
import GridBackground from './GridBackground';
import { useMediaQuery } from '@/hooks/use-mobile';

interface BoardProps {
  puzzle: Puzzle;
  onUpdate: (updatedPuzzle: Puzzle) => void;
}

const Board: React.FC<BoardProps> = ({ puzzle, onUpdate }) => {
  const [selectedIsland, setSelectedIsland] = useState<IslandType | null>(null);
  const [dragStartIsland, setDragStartIsland] = useState<IslandType | null>(null);
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);
  const [dragPosition, setDragPosition] = useState<{x: number, y: number} | null>(null);
  const [dragOverIsland, setDragOverIsland] = useState<IslandType | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('(min-width: 768px)')
    // Update the grid layout CSS to handle rectangular grids
    const gridStyle = {
      display: 'grid',
      gridTemplateRows: `repeat(${puzzle.size.rows}, 1fr)`,
      gridTemplateColumns: `repeat(${puzzle.size.cols}, 1fr)`,
      gap: '2px',
      padding: '8px',
      backgroundColor: 'var(--grid-bg)',
      borderRadius: '8px',
      width: '100%',
      maxWidth: `${puzzle.size.cols * 40}px`, // Adjust cell size as needed
      aspectRatio: `${puzzle.size.cols} / ${puzzle.size.rows}`,
      margin: '0 auto'
    };
  // Island click handler (for both mobile and desktop)
  const handleIslandClick = (island: IslandType) => {
    if (selectedIsland) {
      if (selectedIsland.id === island.id) {
        // Deselect if clicking the same island
        setSelectedIsland(null);
      } else if (canConnect(selectedIsland, island, puzzle.islands, puzzle.bridges)) {
        // Connect islands if possible
        const updatedPuzzle = toggleBridge(selectedIsland, island, puzzle);
        onUpdate(updatedPuzzle);
        setSelectedIsland(null);
      } else {
        // Select the new island if can't connect
        setSelectedIsland(island);
      }
    } else {
      // No island selected yet, select this one
      setSelectedIsland(island);
    }
  };

  // Handle bridge click to remove it
  const handleBridgeClick = (startIslandId: string, endIslandId: string) => {
    const startIsland = getIslandById(puzzle.islands, startIslandId);
    const endIsland = getIslandById(puzzle.islands, endIslandId);
    
    if (startIsland && endIsland) {
      const updatedPuzzle = toggleBridge(startIsland, endIsland, puzzle);
      onUpdate(updatedPuzzle);
    }
  };

  // Handle drag start on island
  const handleDragStart = (island: IslandType, event: React.MouseEvent | React.TouchEvent) => {
    setDragStartIsland(island);
    setIsPointerDown(true);
    
    // Get pointer position
    let clientX: number, clientY: number;
    
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    setDragPosition({ x: clientX, y: clientY });
    
    // Prevent default behavior
    event.preventDefault();
  };

  // Handle drag end on island
  const handleDragEnd = (endIsland: IslandType) => {
    // If we have a drag over island during drag end, use that island
    const targetIsland = dragOverIsland || endIsland;
    
    if (dragStartIsland && dragStartIsland.id !== targetIsland.id) {
      if (canConnect(dragStartIsland, targetIsland, puzzle.islands, puzzle.bridges)) {
        const updatedPuzzle = toggleBridge(dragStartIsland, targetIsland, puzzle);
        onUpdate(updatedPuzzle);
      }
    }
    
    // Reset drag state
    setDragStartIsland(null);
    setIsPointerDown(false);
    setDragPosition(null);
    setDragOverIsland(null);
  };
  
  // Handle board mouse/touch move (for drawing drag line)
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPointerDown || !dragStartIsland || !boardRef.current) return;
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    setDragPosition({ x: clientX, y: clientY });
    
    // Check if we're hovering over an island
    const boardRect = boardRef.current.getBoundingClientRect();
    const relativeX = clientX - boardRect.left;
    const relativeY = clientY - boardRect.top;
    
    // Find if we're over any island (excluding the start island)
    const draggedOverIsland = puzzle.islands.find(island => {
      if (island.id === dragStartIsland.id) return false;
      
      const cellSize = 100 / puzzle.size;
      const islandX = (island.col * cellSize + cellSize / 2) * boardRect.width / 100;
      const islandY = (island.row * cellSize + cellSize / 2) * boardRect.height / 100;
      
      // Check if pointer is within island radius (using 30px as approximate radius)
      const dx = relativeX - islandX;
      const dy = relativeY - islandY;
      const distanceSquared = dx * dx + dy * dy;
      
      return distanceSquared <= 900; // 30px radius squared
    });
    
    setDragOverIsland(draggedOverIsland || null);
    
    e.preventDefault();
  };
  
  // Handle pointer up anywhere in the document (to end drag)
  useEffect(() => {
    const handlePointerUp = () => {
      if (dragStartIsland && dragOverIsland) {
        // Complete the connection if drag ends over another island
        if (canConnect(dragStartIsland, dragOverIsland, puzzle.islands, puzzle.bridges)) {
          const updatedPuzzle = toggleBridge(dragStartIsland, dragOverIsland, puzzle);
          onUpdate(updatedPuzzle);
        }
      }
      
      setIsPointerDown(false);
      setDragPosition(null);
      setDragStartIsland(null);
      setDragOverIsland(null);
    };
    
    document.addEventListener('mouseup', handlePointerUp);
    document.addEventListener('touchend', handlePointerUp);
    
    return () => {
      document.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('touchend', handlePointerUp);
    };
  }, [dragOverIsland, dragStartIsland, onUpdate, puzzle]);
  
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

  // Disable browser's touch actions
  useEffect(() => {
    if (!boardRef.current) return;
    
    const board = boardRef.current;
    const preventTouch = (e: TouchEvent) => {
      // Only prevent default for drag gestures
      if (dragStartIsland || isPointerDown) {
        e.preventDefault();
      }
    };
    
    board.addEventListener('touchmove', preventTouch, { passive: false });
    
    return () => {
      board.removeEventListener('touchmove', preventTouch);
    };
  }, [dragStartIsland, isPointerDown]);

  // Determine if board should be in portrait or landscape orientation
  const boardOrientationClass = isDesktop ? 'board-landscape' : 'board-portrait';

  return (
    <div 
      ref={boardRef}
      className={`relative w-full max-w-lg mx-auto border border-border/30 rounded-lg overflow-hidden ${boardOrientationClass}`}
      aria-label="Hashi puzzle board"
      style={{ 
        touchAction: "none",
        WebkitUserSelect: "none",
        userSelect: "none"
      }}
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
    >
      {/* Grid Background */}
      <GridBackground gridSize={puzzle.size} islands={puzzle.islands} />
      
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
              onClick={() => handleBridgeClick(bridge.startIslandId, bridge.endIslandId)}
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
          isSelected={selectedIsland?.id === island.id || dragStartIsland?.id === island.id || dragOverIsland?.id === island.id}
          onClick={() => handleIslandClick(island)}
          onDragStart={(e) => handleDragStart(island, e)}
          onDragEnd={() => handleDragEnd(island)}
          gridSize={puzzle.size}
        />
      ))}
      
      {/* Drag Line Visualization */}
      {dragStartIsland && dragPosition && boardRef.current && (
        <DragLine 
          startIsland={dragStartIsland} 
          dragPosition={dragPosition}
          boardRef={boardRef}
          gridSize={puzzle.size}
        />
      )}
    </div>
  );
};

// Helper component to visualize drag
interface DragLineProps {
  startIsland: IslandType;
  dragPosition: { x: number, y: number };
  boardRef: React.RefObject<HTMLDivElement>;
  gridSize: number;
}

const DragLine: React.FC<DragLineProps> = ({ startIsland, dragPosition, boardRef, gridSize }) => {
  if (!boardRef.current) return null;
  
  const boardRect = boardRef.current.getBoundingClientRect();
  const cellSize = 100 / gridSize;
  
  // Calculate start position (island center) in pixels
  const startX = (startIsland.col * cellSize + cellSize / 2) * boardRect.width / 100;
  const startY = (startIsland.row * cellSize + cellSize / 2) * boardRect.height / 100;
  
  // Calculate end position (cursor position relative to board)
  const endX = dragPosition.x - boardRect.left;
  const endY = dragPosition.y - boardRect.top;
  
  // Calculate the line's length and angle
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  // Style for the drag line
  const lineStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${length}px`,
    height: '2px',
    backgroundColor: 'hsl(var(--primary))',
    opacity: 0.7,
    transformOrigin: '0 0',
    transform: `rotate(${angle}deg)`,
    pointerEvents: 'none',
    zIndex: 4
  };
  
  return <div style={lineStyle} />;
};

export default Board;
