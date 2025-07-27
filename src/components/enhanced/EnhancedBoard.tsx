
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Puzzle, 
  Island as IslandType, 
  canConnect, 
  toggleBridge, 
  getIslandById,
  checkPuzzleSolved,
  getBridgeBetweenIslands
} from '../../utils/gameLogic';
import EnhancedIsland from './EnhancedIsland';
import EnhancedBridge from './EnhancedBridge';
import GridBackground from '../GridBackground';
import { useMediaQuery } from '@/hooks/use-mobile';
import { hapticFeedback } from '@/utils/haptics';

interface EnhancedBoardProps {
  puzzle: Puzzle;
  onUpdate: (updatedPuzzle: Puzzle) => void;
}

const EnhancedBoard: React.FC<EnhancedBoardProps> = ({ puzzle, onUpdate }) => {
  const [selectedIsland, setSelectedIsland] = useState<IslandType | null>(null);
  const [dragStartIsland, setDragStartIsland] = useState<IslandType | null>(null);
  const [dragTargetIsland, setDragTargetIsland] = useState<IslandType | null>(null);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [dragPosition, setDragPosition] = useState<{x: number, y: number} | null>(null);
  const [highlightedBridge, setHighlightedBridge] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  // Optimized drag threshold for portrait smartphone
  const getDragThreshold = () => {
    return 8; // Consistent threshold for portrait smartphone
  };

  // Island interaction handlers
  const handleIslandClick = useCallback((island: IslandType) => {
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
  }, [selectedIsland, puzzle, onUpdate]);

  // Enhanced bridge interaction with better feedback
  const handleBridgeInteraction = useCallback((startIslandId: string, endIslandId: string, action: 'toggle' | 'remove') => {
    const startIsland = getIslandById(puzzle.islands, startIslandId);
    const endIsland = getIslandById(puzzle.islands, endIslandId);
    
    if (!startIsland || !endIsland) return;
    
    const existingBridge = getBridgeBetweenIslands(puzzle.bridges, startIslandId, endIslandId);
    
    if (!existingBridge) return;
    
    let updatedPuzzle = { ...puzzle };
    
    if (action === 'remove') {
      // Remove bridge completely
      updatedPuzzle.bridges = updatedPuzzle.bridges.filter(b => b.id !== existingBridge.id);
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
    } else {
      // Toggle bridge (normal behavior)
      updatedPuzzle = toggleBridge(startIsland, endIsland, puzzle);
    }
    
    onUpdate(updatedPuzzle);
    setHighlightedBridge(null);
  }, [puzzle, onUpdate]);

  // Drag handling with improved gesture recognition
  const handleDragStart = useCallback((island: IslandType, event: React.TouchEvent | React.MouseEvent) => {
    setDragStartIsland(island);
    setIsPointerDown(true);
    setSelectedIsland(null); // Clear selection when starting drag
    
    // Haptic feedback for drag start
    hapticFeedback.light();
    
    event.preventDefault();
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragStartIsland && dragTargetIsland && dragStartIsland.id !== dragTargetIsland.id) {
      if (canConnect(dragStartIsland, dragTargetIsland, puzzle.islands, puzzle.bridges)) {
        const updatedPuzzle = toggleBridge(dragStartIsland, dragTargetIsland, puzzle);
        onUpdate(updatedPuzzle);
        // Haptic feedback for successful connection
        hapticFeedback.medium();
      } else {
        // Haptic feedback for failed connection
        hapticFeedback.light();
      }
    }
    
    // Reset all drag states
    setDragStartIsland(null);
    setDragTargetIsland(null);
    setIsPointerDown(false);
    setDragPosition(null);
  }, [dragStartIsland, dragTargetIsland, puzzle, onUpdate]);

  // Enhanced pointer move with better target detection
  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
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
    
    // Find target island with improved detection
    const boardRect = boardRef.current.getBoundingClientRect();
    const relativeX = clientX - boardRect.left;
    const relativeY = clientY - boardRect.top;
    
    // Optimized detection radius for portrait smartphone
    const getDetectionRadius = () => {
      const minGridSize = Math.min(puzzle.size.rows, puzzle.size.cols);
      
      // Larger detection radius for better touch targeting
      if (minGridSize <= 6) return 65;
      if (minGridSize <= 8) return 55;
      if (minGridSize <= 10) return 45;
      if (minGridSize <= 12) return 40;
      return 35;
    };
    
    const detectionRadius = getDetectionRadius();
    
    const targetIsland = puzzle.islands.find(island => {
      if (island.id === dragStartIsland.id) return false;
      
      const cellSizeX = boardRect.width / puzzle.size.cols;
      const cellSizeY = boardRect.height / puzzle.size.rows;
      
      const islandX = (island.col + 0.5) * cellSizeX;
      const islandY = (island.row + 0.5) * cellSizeY;
      
      const dx = relativeX - islandX;
      const dy = relativeY - islandY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance <= detectionRadius;
    });
    
    setDragTargetIsland(targetIsland || null);
    
    e.preventDefault();
  }, [isPointerDown, dragStartIsland, puzzle]);

  // Global pointer up handler
  useEffect(() => {
    const handlePointerUp = () => {
      if (isPointerDown) {
        handleDragEnd();
      }
    };
    
    document.addEventListener('mouseup', handlePointerUp);
    document.addEventListener('touchend', handlePointerUp);
    
    return () => {
      document.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('touchend', handlePointerUp);
    };
  }, [isPointerDown, handleDragEnd]);

  // Solve detection
  useEffect(() => {
    if (checkPuzzleSolved(puzzle) && !puzzle.solved) {
      onUpdate({
        ...puzzle,
        solved: true,
        endTime: Date.now()
      });
    }
  }, [puzzle, onUpdate]);

  return (
    <div 
      ref={boardRef}
      className="relative board-container border border-border/30 rounded-lg overflow-hidden bg-background"
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
      aria-label="Enhanced Hashi puzzle board"
    >
      {/* Grid Background */}
      <GridBackground gridSize={puzzle.size} islands={puzzle.islands} />
      
      {/* Bridges */}
      {puzzle.bridges.map(bridge => {
        const startIsland = getIslandById(puzzle.islands, bridge.startIslandId);
        const endIsland = getIslandById(puzzle.islands, bridge.endIslandId);
        
        if (startIsland && endIsland) {
          return (
            <EnhancedBridge 
              key={bridge.id}
              bridge={bridge}
              startIsland={startIsland}
              endIsland={endIsland}
              gridSize={puzzle.size}
              isHighlighted={highlightedBridge === bridge.id}
              onClick={() => handleBridgeInteraction(bridge.startIslandId, bridge.endIslandId, 'toggle')}
              onRemove={() => handleBridgeInteraction(bridge.startIslandId, bridge.endIslandId, 'remove')}
            />
          );
        }
        return null;
      })}
      
      {/* Islands */}
      {puzzle.islands.map(island => (
        <EnhancedIsland 
          key={island.id}
          island={island}
          isSelected={selectedIsland?.id === island.id}
          isHighlighted={dragStartIsland?.id === island.id}
          isDragTarget={dragTargetIsland?.id === island.id}
          onClick={() => handleIslandClick(island)}
          onDragStart={(e) => handleDragStart(island, e)}
          onDragEnd={handleDragEnd}
          gridSize={puzzle.size}
          showConnections={true}
        />
      ))}
      
      {/* Enhanced Drag Line Visualization */}
      {dragStartIsland && dragPosition && boardRef.current && (
        <EnhancedDragLine 
          startIsland={dragStartIsland} 
          dragPosition={dragPosition}
          boardRef={boardRef}
          gridSize={puzzle.size}
          canConnectToTarget={dragTargetIsland ? canConnect(dragStartIsland, dragTargetIsland, puzzle.islands, puzzle.bridges) : false}
        />
      )}
    </div>
  );
};

// Enhanced drag line with better visual feedback
interface EnhancedDragLineProps {
  startIsland: IslandType;
  dragPosition: { x: number, y: number };
  boardRef: React.RefObject<HTMLDivElement>;
  gridSize: { rows: number; cols: number };
  canConnectToTarget: boolean;
}

const EnhancedDragLine: React.FC<EnhancedDragLineProps> = ({ 
  startIsland, 
  dragPosition, 
  boardRef, 
  gridSize,
  canConnectToTarget 
}) => {
  if (!boardRef.current) return null;
  
  const boardRect = boardRef.current.getBoundingClientRect();
  const cellSizeX = 100 / gridSize.cols;
  const cellSizeY = 100 / gridSize.rows;
  
  const startX = (startIsland.col * cellSizeX + cellSizeX / 2) * boardRect.width / 100;
  const startY = (startIsland.row * cellSizeY + cellSizeY / 2) * boardRect.height / 100;
  
  const endX = dragPosition.x - boardRect.left;
  const endY = dragPosition.y - boardRect.top;
  
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  // Use same thickness calculation as EnhancedBridge
  const getBridgeThickness = () => {
    const gridArea = gridSize.rows * gridSize.cols;
    if (gridArea <= 42) return 2;
    if (gridArea <= 96) return 1.5;
    return 1;
  };

  return (
    <div
      className={`
        absolute pointer-events-none z-30 rounded-full transition-all duration-200
        ${canConnectToTarget ? 'bg-green-500 shadow-green-500/50' : 'bg-primary shadow-primary/50'}
      `}
      style={{
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${length}px`,
        height: `${getBridgeThickness()}px`,
        opacity: 0.8,
        transformOrigin: '0 0',
        transform: `rotate(${angle}deg)`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
    />
  );
};

export default EnhancedBoard;
