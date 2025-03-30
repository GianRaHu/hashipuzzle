import React, { useState, useRef } from 'react';
import { Island as IslandType } from '../utils/gameLogic';

interface IslandProps {
  island: IslandType;
  isSelected: boolean;
  onClick: () => void;
  onDragStart: (event: React.MouseEvent | React.TouchEvent) => void;
  onDragEnd: () => void;
  gridSize: { rows: number; cols: number };
}

const Island: React.FC<IslandProps> = ({ 
  island, 
  isSelected, 
  onClick, 
  onDragStart, 
  onDragEnd, 
  gridSize 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const touchTimerRef = useRef<number | null>(null);
  const moveDetectedRef = useRef<boolean>(false);
  
  // Calculate the size and position based on grid dimensions
  const cellSizeX = 100 / gridSize.cols;
  const cellSizeY = 100 / gridSize.rows;
  const xPos = island.col * cellSizeX + cellSizeX / 2;
  const yPos = island.row * cellSizeY + cellSizeY / 2;
  
  // Connection completeness (for visual feedback)
  const connectionsNeeded = island.value;
  const actualConnections = island.connectedTo.length;
  
  // Determine visual state with fixed sizes and consistent transparency
  let stateClass = '';
  let bgColorClass = '';
  
  // Responsive node sizing based on grid size - make even smaller for larger grids
  const getNodeSize = () => {
    const minGridSize = Math.min(gridSize.rows, gridSize.cols);
    if (minGridSize <= 6) return 'w-7 h-7 text-sm';
    if (minGridSize <= 8) return 'w-6 h-6 text-xs';
    if (minGridSize <= 10) return 'w-5 h-5 text-xs';
    if (minGridSize <= 12) return 'w-4 h-4 text-[10px]';
    return 'w-3.5 h-3.5 text-[9px]'; // For largest grids
  };
  
  const nodeSize = getNodeSize();
  
  if (isSelected || isDragging) {
    stateClass = 'ring-2 ring-primary ring-offset-1 ring-offset-background';
    bgColorClass = 'bg-primary/20 text-primary font-bold';
  } else if (actualConnections === 0) {
    // No connections yet - white
    stateClass = 'ring-1 ring-white/70 dark:ring-slate-400';
    bgColorClass = 'bg-white dark:bg-slate-800 text-foreground';
  } else if (actualConnections === connectionsNeeded) {
    // Connections match exactly - green
    stateClass = 'ring-1 ring-green-500';
    bgColorClass = 'bg-green-100 dark:bg-green-900/50 text-green-600 font-bold';
  } else if (actualConnections > connectionsNeeded) {
    // Too many connections - yellow
    stateClass = 'ring-1 ring-yellow-500';
    bgColorClass = 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 font-bold';
  } else if (actualConnections < connectionsNeeded) {
    // Some connections but not complete - red
    stateClass = 'ring-1 ring-red-500';
    bgColorClass = 'bg-red-50 dark:bg-red-900/50 text-red-600';
  }

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    // Start a timer to differentiate between tap and drag
    moveDetectedRef.current = false;
    
    touchTimerRef.current = window.setTimeout(() => {
      if (!moveDetectedRef.current) {
        // It was a tap, not a drag
        onClick();
      }
      touchTimerRef.current = null;
    }, 150); // Short delay to detect intention
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    moveDetectedRef.current = true;
    
    // If we detect movement, it's a drag
    if (!isDragging) {
      setIsDragging(true);
      onDragStart(e);
    }
    
    // Clear the tap timer if it's still active
    if (touchTimerRef.current !== null) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    // If a drag was in progress, end it
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    }
    
    // Clear any active timers
    if (touchTimerRef.current !== null) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
      
      // If no movement was detected and timer was canceled before firing,
      // treat as a tap
      if (!moveDetectedRef.current) {
        onClick();
      }
    }
  };

  // Handle mouse events (for desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Enable drag mode immediately for mouse
    setIsDragging(true);
    onDragStart(e);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // If was dragging, end drag
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    } else {
      // Otherwise, it's a click
      onClick();
    }
  };

  // Handle mouse click (for desktop - click without drag)
  const handleClick = (e: React.MouseEvent) => {
    // Only treat as click if it wasn't part of a drag
    if (!isDragging) {
      onClick();
    }
    e.preventDefault();
  };

  return (
    <button
      type="button"
      className={`${nodeSize} rounded-full flex items-center justify-center font-medium transition-all duration-200 ${bgColorClass} ${stateClass}`}
      style={{
        position: 'absolute',
        left: `${xPos}%`,
        top: `${yPos}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        fontWeight: 600
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      aria-label={`Island with value ${island.value}`}
    >
      {island.value}
    </button>
  );
};

export default React.memo(Island);
