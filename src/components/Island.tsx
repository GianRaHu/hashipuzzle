
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
  const touchStartTimeRef = useRef<number | null>(null);
  const touchTimerRef = useRef<number | null>(null);
  const moveDetectedRef = useRef<boolean>(false);
  const touchStartPosRef = useRef<{x: number, y: number} | null>(null);
  
  // Mobile touch threshold - lower value means more sensitivity (in pixels)
  const TOUCH_MOVE_THRESHOLD = 5;
  
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
    if (gridArea <= 42) return 'w-9 h-9 text-base';      // Small grid
    if (gridArea <= 96) return 'w-8 h-8 text-sm';        // Medium grid
    if (gridArea <= 140) return 'w-7 h-7 text-xs';       // Large grid
    if (gridArea <= 192) return 'w-6 h-6 text-xs';       // Extra large grid
    return 'w-5 h-5 text-[10px]';                        // Huge grid
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

  // Enhanced touch start - better for mobile experience
  const handleTouchStart = (e: React.TouchEvent) => {
    // Record touch start time and position
    touchStartTimeRef.current = Date.now();
    moveDetectedRef.current = false;
    
    if (e.touches.length > 0) {
      touchStartPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
    
    // Clear any existing timer
    if (touchTimerRef.current !== null) {
      clearTimeout(touchTimerRef.current);
    }
    
    // Start a short timer for tap detection
    touchTimerRef.current = window.setTimeout(() => {
      // If no movement was detected during this short period, it's likely a tap
      if (!moveDetectedRef.current) {
        onClick();
      }
      touchTimerRef.current = null;
    }, 120); // Shorter time makes it more responsive
  };

  // Improved touch move detection
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 0 || !touchStartPosRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const startX = touchStartPosRef.current.x;
    const startY = touchStartPosRef.current.y;
    
    // Calculate distance moved
    const dx = currentX - startX;
    const dy = currentY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If moved more than threshold, consider it a drag
    if (distance > TOUCH_MOVE_THRESHOLD) {
      moveDetectedRef.current = true;
      
      // Clear the tap timer if it's still active
      if (touchTimerRef.current !== null) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
      
      // Start drag if not already dragging
      if (!isDragging) {
        setIsDragging(true);
        onDragStart(e);
      }
    }
  };

  // Handle touch end with improved logic
  const handleTouchEnd = () => {
    const touchDuration = touchStartTimeRef.current 
      ? Date.now() - touchStartTimeRef.current
      : 0;
    
    // Clear any active timer
    if (touchTimerRef.current !== null) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    
    // If we were dragging, end the drag
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    } 
    // If it was a quick tap without much movement, and not already handled by the timer
    else if (touchDuration < 300 && !moveDetectedRef.current && touchTimerRef.current === null) {
      onClick();
    }
    
    // Reset refs
    touchStartTimeRef.current = null;
    touchStartPosRef.current = null;
    moveDetectedRef.current = false;
  };

  // For touch devices only - no desktop click/mouse support needed
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
      aria-label={`Island with value ${island.value}`}
    >
      <span className={`${textColorClass} font-medium`}>
        {island.value}
      </span>
    </button>
  );
};

export default React.memo(Island);
