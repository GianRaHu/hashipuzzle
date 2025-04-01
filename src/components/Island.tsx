import React, { useMemo, useState, useRef } from 'react';
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
  
  // Always use consistent text color for better readability
  const textColorClass = 'text-black dark:text-white';
  
  // Responsive node sizing based on grid size
  const getNodeSize = () => {
    const gridArea = gridSize.rows * gridSize.cols;
    if (gridArea <= 42) return 'w-8 h-8 text-base';      // Small grid
    if (gridArea <= 96) return 'w-7 h-7 text-sm';        // Medium grid
    if (gridArea <= 140) return 'w-6 h-6 text-xs';       // Large grid
    if (gridArea <= 192) return 'w-5 h-5 text-xs';       // Extra large grid
    return 'w-4 h-4 text-[10px]';                        // Huge grid
  };
  
  const nodeSize = getNodeSize();
  
  // Memoize the color calculation based on island state and isDragging
  const { stateClass, bgColorClass } = useMemo(() => {
    const connectionsNeeded = island.value;
    const actualConnections = island.connectedTo.length;
    
    let stateClass = '';
    let bgColorClass = '';
    
    if (isSelected || isDragging) {
      stateClass = 'ring-2 ring-primary ring-offset-1 ring-offset-background';
      bgColorClass = 'bg-primary/20';
    } else if (actualConnections === 0) {
      // No connections yet - base color
      stateClass = 'ring-1 ring-white/70 dark:ring-slate-400';
      bgColorClass = 'bg-white dark:bg-slate-800';
    } else if (actualConnections === connectionsNeeded) {
      // Connections match exactly - green
      stateClass = 'ring-1 ring-green-500';
      bgColorClass = 'bg-green-100 dark:bg-green-900/50';
    } else if (actualConnections > connectionsNeeded) {
      // Too many connections - yellow
      stateClass = 'ring-1 ring-yellow-500';
      bgColorClass = 'bg-yellow-100 dark:bg-yellow-900/50';
    } else if (actualConnections < connectionsNeeded) {
      // Some connections but not complete - red
      stateClass = 'ring-1 ring-red-500';
      bgColorClass = 'bg-red-50 dark:bg-red-900/50';
    }
    
    return { stateClass, bgColorClass };
  }, [island.value, island.connectedTo.length, isSelected, isDragging]);

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
      className={`${nodeSize} rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${bgColorClass} ${stateClass}`}
      style={{
        position: 'absolute',
        left: `${xPos}%`,
        top: `${yPos}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      aria-label={`Island with value ${island.value}`}
    >
      <span className={`${textColorClass} font-medium`}>
        {island.value}
      </span>
    </button>
  );
};

export default React.memo(Island);
