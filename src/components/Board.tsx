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
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  // UPDATED: Reduced threshold for starting drag detection (pixels)
  const DRAG_START_THRESHOLD = 0.5; // Reduced from 1.0 to make connections even easier
  
  // ADDED: Swipe direction detection parameters
  const SWIPE_THRESHOLD = 5;  // Minimum distance for a swipe
  const SWIPE_DIRECTION_THRESHOLD = 0.7; // How directional the swipe needs to be (0.7 = 70% in one direction)
  
  const dragStartPositionRef = useRef<{x: number, y: number} | null>(null);
  const swipeDirectionRef = useRef<'horizontal' | 'vertical' | null>(null);

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

  // Handle bridge click to remove/toggle it
  const handleBridgeClick = (startIslandId: string, endIslandId: string) => {
    const startIsland = getIslandById(puzzle.islands, startIslandId);
    const endIsland = getIslandById(puzzle.islands, endIslandId);
  
    if (startIsland && endIsland) {
      // Get the existing bridge between these islands
       const existingBridge = getBridgeBetweenIslands(puzzle.bridges, startIslandId, endIslandId);
    
      if (existingBridge) {
        // Create a modified version of the puzzle with the bridge updated
        let updatedPuzzle = { ...puzzle };
      
        // If it's a double bridge, reduce to a single bridge
        if (existingBridge.count === 2) {
          // Find the bridge in the bridges array
          const bridgeIndex = updatedPuzzle.bridges.findIndex(
            b => b.id === existingBridge.id
          );
        
          if (bridgeIndex !== -1) {
            // Update to a single bridge
            updatedPuzzle.bridges[bridgeIndex] = {
              ...existingBridge,
              count: 1
            };
          
            // Remove one connection from each island
            updatedPuzzle.islands = updatedPuzzle.islands.map(island => {
              if (island.id === startIslandId || island.id === endIslandId) {
                // Find the other island's id
                const otherId = island.id === startIslandId ? endIslandId : startIslandId;
              
                // Remove just one connection
                const connectionIndex = island.connectedTo.lastIndexOf(otherId);
                if (connectionIndex !== -1) {
                  const newConnectedTo = [...island.connectedTo];
                  newConnectedTo.splice(connectionIndex, 1);
                  return {
                    ...island,
                    connectedTo: newConnectedTo
                  };
                }
              }
              return island;
            });
          }
        } else {
          // It's a single bridge, remove it completely
          updatedPuzzle.bridges = updatedPuzzle.bridges.filter(b => b.id !== existingBridge.id);
        
          // Remove all connections between these islands
          updatedPuzzle.islands = updatedPuzzle.islands.map(island => {
            if (island.id === startIslandId || island.id === endIslandId) {
              return {
                ...island,
                connectedTo: island.connectedTo.filter(id => 
                  id !== (island.id === startIslandId ? endIslandId : startIslandId)
                )
              };
            }
            return island;
          });
        }
      
        onUpdate(updatedPuzzle);
      }
    }
  };

  // UPDATED: Handle drag start on island with improved swipe detection
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
    
    // Store the initial position for threshold checking
    dragStartPositionRef.current = { x: clientX, y: clientY };
    swipeDirectionRef.current = null;
    
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
    dragStartPositionRef.current = null;
    swipeDirectionRef.current = null;
  };
  
  // UPDATED: Handle board mouse/touch move with improved swipe detection
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
    
    // Check if we've exceeded the drag threshold
    if (dragStartPositionRef.current) {
      const dx = clientX - dragStartPositionRef.current.x;
      const dy = clientY - dragStartPositionRef.current.y;
      const distanceSquared = dx * dx + dy * dy;
      
      // Detect swipe direction if we haven't already
      if (!swipeDirectionRef.current && distanceSquared > SWIPE_THRESHOLD * SWIPE_THRESHOLD) {
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        
        if (absX > absY && absX / (absX + absY) > SWIPE_DIRECTION_THRESHOLD) {
          swipeDirectionRef.current = 'horizontal';
        } else if (absY > absX && absY / (absX + absY) > SWIPE_DIRECTION_THRESHOLD) {
          swipeDirectionRef.current = 'vertical';
        }
      }
      
      // Only start showing the drag line when we exceed the threshold
      if (distanceSquared > DRAG_START_THRESHOLD * DRAG_START_THRESHOLD) {
        setDragPosition({ x: clientX, y: clientY });
      } else {
        return; // Don't show drag line yet
      }
    } else {
      setDragPosition({ x: clientX, y: clientY });
    }
    
    // UPDATED: Check if we can find an island in the swipe direction
    const findIslandInSwipeDirection = () => {
      if (!swipeDirectionRef.current || !dragStartIsland) return null;
      
      const direction = swipeDirectionRef.current;
      
      // Find all islands in the same row or column as the start island
      const alignedIslands = puzzle.islands.filter(island => {
        if (island.id === dragStartIsland.id) return false;
        
        if (direction === 'horizontal') {
          return island.row === dragStartIsland.row;
        } else {
          return island.col === dragStartIsland.col;
        }
      });
      
      if (alignedIslands.length === 0) return null;
      
      // Determine which aligned island to select based on drag direction
      let targetIsland: IslandType | null = null;
      
      if (direction === 'horizontal') {
        const dx = clientX - dragStartPositionRef.current!.x;
        const isMovingRight = dx > 0;
        
        // Filter islands that are to the right or left depending on direction
        const directionFilteredIslands = alignedIslands.filter(island => 
          isMovingRight ? island.col > dragStartIsland.col : island.col < dragStartIsland.col
        );
        
        if (directionFilteredIslands.length > 0) {
          // Find the closest island in the swipe direction
          targetIsland = directionFilteredIslands.reduce((closest, current) => {
            const distToCurrent = Math.abs(current.col - dragStartIsland.col);
            const distToClosest = closest ? Math.abs(closest.col - dragStartIsland.col) : Infinity;
            return distToCurrent < distToClosest ? current : closest;
          }, null as IslandType | null);
        }
      } else {
        const dy = clientY - dragStartPositionRef.current!.y;
        const isMovingDown = dy > 0;
        
        // Filter islands that are below or above depending on direction
        const directionFilteredIslands = alignedIslands.filter(island => 
          isMovingDown ? island.row > dragStartIsland.row : island.row < dragStartIsland.row
        );
        
        if (directionFilteredIslands.length > 0) {
          // Find the closest island in the swipe direction
          targetIsland = directionFilteredIslands.reduce((closest, current) => {
            const distToCurrent = Math.abs(current.row - dragStartIsland.row);
            const distToClosest = closest ? Math.abs(closest.row - dragStartIsland.row) : Infinity;
            return distToCurrent < distToClosest ? current : closest;
          }, null as IslandType | null);
        }
      }
      
      // Check if we can connect to this island
      if (targetIsland && canConnect(dragStartIsland, targetIsland, puzzle.islands, puzzle.bridges)) {
        return targetIsland;
      }
      
      return null;
    };
    
    // Check for islands using standard hover detection
    const boardRect = boardRef.current.getBoundingClientRect();
    const relativeX = clientX - boardRect.left;
    const relativeY = clientY - boardRect.top;
    
    // Calculate island detection radius based on grid size
    const getDetectionRadius = () => {
      const minGridSize = Math.min(puzzle.size.rows, puzzle.size.cols);
      if (minGridSize <= 6) return 48; // Increased for better detection
      if (minGridSize <= 8) return 40; // Increased for better detection
      if (minGridSize <= 10) return 34; // Increased for better detection
      if (minGridSize <= 12) return 30; // Increased for better detection
      return 26; // For largest grids
    };
    
    const detectionRadius = getDetectionRadius();
    
    // Find if we're over any island (excluding the start island)
    let draggedOverIsland = puzzle.islands.find(island => {
      if (island.id === dragStartIsland.id) return false;
      
      const cellSizeX = boardRect.width / puzzle.size.cols;
      const cellSizeY = boardRect.height / puzzle.size.rows;
      
      const islandX = (island.col + 0.5) * cellSizeX;
      const islandY = (island.row + 0.5) * cellSizeY;
      
      // Check if pointer is within island radius
      const dx = relativeX - islandX;
      const dy = relativeY - islandY;
      const distanceSquared = dx * dx + dy * dy;
      
      // Increased tolerance for detection radius
      const radiusSquared = detectionRadius * detectionRadius;
      
      return distanceSquared <= radiusSquared;
    });
    
    // If we don't have an island under the pointer, check for an island in the swipe direction
    if (!draggedOverIsland && swipeDirectionRef.current) {
      draggedOverIsland = findIslandInSwipeDirection();
    }
    
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
      className={`relative board-container border border-border/30 rounded-lg overflow-hidden ${boardOrientationClass}`}
      aria-label="Hashi puzzle board"
      style={{ 
        touchAction: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        width: '100%',
        maxWidth: '100%',
        aspectRatio: `${puzzle.size.cols} / ${puzzle.size.rows}`,
        margin: '0 auto'
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
  gridSize: { rows: number; cols: number };
}

const DragLine: React.FC<DragLineProps> = ({ startIsland, dragPosition, boardRef, gridSize }) => {
  if (!boardRef.current) return null;
  
  const boardRect = boardRef.current.getBoundingClientRect();
  const cellSizeX = 100 / gridSize.cols;
  const cellSizeY = 100 / gridSize.rows;
  
  // Calculate start position (island center) in pixels
  const startX = (startIsland.col * cellSizeX + cellSizeX / 2) * boardRect.width / 100;
  const startY = (startIsland.row * cellSizeY + cellSizeY / 2) * boardRect.height / 100;
  
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
