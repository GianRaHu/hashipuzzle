
import React, { useState, useRef } from 'react';
import { Island as IslandType } from '../utils/gameLogic';

interface IslandProps {
  island: IslandType;
  isSelected: boolean;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  gridSize: number;
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
  
  // Calculate the size and position
  const cellSize = 100 / gridSize;
  const xPos = island.col * cellSize + cellSize / 2;
  const yPos = island.row * cellSize + cellSize / 2;
  
  // Connection completeness (for visual feedback)
  const connectionsNeeded = island.value;
  const actualConnections = island.connectedTo.length;
  
  // Determine visual state
  let stateClass = '';
  
  if (isSelected || isDragging) {
    stateClass = 'ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/20 text-primary font-bold';
  } else if (actualConnections === connectionsNeeded) {
    // Connections match exactly - show green ring
    stateClass = 'ring-2 ring-green-500 text-green-600 font-bold';
  } else if (actualConnections > connectionsNeeded) {
    // Too many connections - show red ring
    stateClass = 'ring-2 ring-destructive text-destructive font-bold';
  } else if (actualConnections > 0) {
    // Some connections but not complete
    stateClass = 'bg-secondary/20';
  }

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    
    // Start a timer to differentiate between tap and drag
    touchTimerRef.current = window.setTimeout(() => {
      setIsDragging(true);
      onDragStart();
      touchTimerRef.current = null;
    }, 150); // Short delay to detect intention
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    // If timer still active, clear it and start dragging
    if (touchTimerRef.current !== null) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
      setIsDragging(true);
      onDragStart();
    }
  };

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    
    // If timer is still active, it was a tap (not a drag)
    if (touchTimerRef.current !== null) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
      onClick();
    } else if (isDragging) {
      // It was a drag
      setIsDragging(false);
      onDragEnd();
    }
  };

  // Handle mouse events (for desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onDragStart();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    } else {
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-foreground transition-all duration-300 ${stateClass}`}
      style={{
        position: 'absolute',
        left: `${xPos}%`,
        top: `${yPos}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        minWidth: '2.75rem',
        minHeight: '2.75rem',
        fontSize: '1.2rem',
        fontWeight: 600
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      aria-label={`Island with value ${island.value}`}
    >
      {island.value}
    </button>
  );
};

export default React.memo(Island);
