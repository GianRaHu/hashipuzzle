
import React, { useState, useRef } from 'react';
import { Island as IslandType } from '../utils/gameLogic';

interface IslandProps {
  island: IslandType;
  isSelected: boolean;
  onClick: () => void;
  onDragStart: (event: React.MouseEvent | React.TouchEvent) => void;
  onDragEnd: () => void;
  gridWidth: number;
  gridHeight: number;
}

const Island: React.FC<IslandProps> = ({ 
  island, 
  isSelected, 
  onClick, 
  onDragStart, 
  onDragEnd, 
  gridWidth,
  gridHeight
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const touchTimerRef = useRef<number | null>(null);
  const moveDetectedRef = useRef<boolean>(false);
  
  // Calculate the size and position based on grid dimensions
  const cellWidth = 100 / gridWidth;
  const cellHeight = 100 / gridHeight;
  
  const xPos = island.col * cellWidth + cellWidth / 2;
  const yPos = island.row * cellHeight + cellHeight / 2;
  
  // Connection completeness (for visual feedback)
  const connectionsNeeded = island.value;
  const actualConnections = island.connectedTo.length;
  
  // Determine visual state with fixed sizes and consistent transparency
  let stateClass = '';
  let bgColorClass = 'bg-secondary/90'; // Consistent transparency
  
  if (isSelected || isDragging) {
    stateClass = 'ring-1 ring-primary ring-offset-1 ring-offset-background bg-primary/20 text-primary font-bold';
  } else if (actualConnections === connectionsNeeded) {
    // Connections match exactly - show green ring
    stateClass = 'ring-1 ring-green-500 text-green-600 font-bold';
    bgColorClass = 'bg-green-100/90 dark:bg-green-900/20';
  } else if (actualConnections > connectionsNeeded) {
    // Too many connections - show yellow warning
    stateClass = 'ring-1 ring-yellow-500 text-yellow-600 font-bold';
    bgColorClass = 'bg-yellow-100/90 dark:bg-yellow-900/20';
  } else if (actualConnections === 0) {
    // No connections yet - show white ring
    stateClass = 'ring-1 ring-white dark:ring-slate-300';
  } else if (actualConnections < connectionsNeeded) {
    // Some connections but not complete - show red ring
    stateClass = 'ring-1 ring-red-500 text-red-600';
    bgColorClass = 'bg-red-50/90 dark:bg-red-900/20';
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
      className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-foreground transition-all duration-300 ${bgColorClass} ${stateClass}`}
      style={{
        position: 'absolute',
        left: `${xPos}%`,
        top: `${yPos}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        minWidth: '2rem',
        minHeight: '2rem',
        fontSize: '1rem',
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
