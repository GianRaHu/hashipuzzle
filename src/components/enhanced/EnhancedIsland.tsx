
import React, { useState, useRef, useCallback } from 'react';
import { Island as IslandType } from '../../utils/gameLogic';

interface EnhancedIslandProps {
  island: IslandType;
  isSelected: boolean;
  isHighlighted: boolean;
  isDragTarget: boolean;
  onClick: () => void;
  onDragStart: (event: React.TouchEvent | React.MouseEvent) => void;
  onDragEnd: () => void;
  gridSize: { rows: number; cols: number };
  showConnections?: boolean;
}

const EnhancedIsland: React.FC<EnhancedIslandProps> = ({
  island,
  isSelected,
  isHighlighted,
  isDragTarget,
  onClick,
  onDragStart,
  onDragEnd,
  gridSize,
  showConnections = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  
  // Optimized sizing for portrait smartphone - smaller islands for better bridge visibility
  const getIslandSize = () => {
    const gridArea = gridSize.rows * gridSize.cols;
    
    // Reduced island sizes for better bridge visibility
    if (gridArea <= 42) return { size: 'w-8 h-8', text: 'text-sm' };
    if (gridArea <= 96) return { size: 'w-7 h-7', text: 'text-xs' };
    if (gridArea <= 140) return { size: 'w-6 h-6', text: 'text-xs' };
    if (gridArea <= 192) return { size: 'w-5 h-5', text: 'text-[10px]' };
    return { size: 'w-4 h-4', text: 'text-[8px]' };
  };

  const { size, text } = getIslandSize();
  
  // Calculate position
  const cellSizeX = 100 / gridSize.cols;
  const cellSizeY = 100 / gridSize.rows;
  const xPos = island.col * cellSizeX + cellSizeX / 2;
  const yPos = island.row * cellSizeY + cellSizeY / 2;
  
  // Connection state styling - only colors, no numbers
  const getConnectionState = () => {
    const connectionsNeeded = island.value;
    const actualConnections = island.connectedTo.length;
    
    if (isSelected) {
      return {
        bg: 'bg-blue-500 dark:bg-blue-400',
        ring: 'ring-2 ring-blue-300 ring-offset-2 ring-offset-background',
        text: 'text-white'
      };
    }
    
    if (isDragTarget) {
      return {
        bg: 'bg-green-500 dark:bg-green-400',
        ring: 'ring-2 ring-green-300 ring-offset-2 ring-offset-background',
        text: 'text-white'
      };
    }
    
    if (isHighlighted) {
      return {
        bg: 'bg-amber-500 dark:bg-amber-400',
        ring: 'ring-2 ring-amber-300 ring-offset-1 ring-offset-background',
        text: 'text-white'
      };
    }
    
    if (actualConnections === 0) {
      return {
        bg: 'bg-slate-100 dark:bg-slate-700',
        ring: 'ring-1 ring-slate-300 dark:ring-slate-500',
        text: 'text-slate-900 dark:text-slate-100'
      };
    }
    
    if (actualConnections === connectionsNeeded) {
      return {
        bg: 'bg-green-100 dark:bg-green-900/40',
        ring: 'ring-1 ring-green-400 dark:ring-green-500',
        text: 'text-green-800 dark:text-green-200'
      };
    }
    
    if (actualConnections > connectionsNeeded) {
      return {
        bg: 'bg-red-100 dark:bg-red-900/40',
        ring: 'ring-1 ring-red-400 dark:ring-red-500',
        text: 'text-red-800 dark:text-red-200'
      };
    }
    
    return {
      bg: 'bg-orange-100 dark:bg-orange-900/40',
      ring: 'ring-1 ring-orange-400 dark:ring-orange-500',
      text: 'text-orange-800 dark:text-orange-200'
    };
  };

  const connectionState = getConnectionState();

  // Enhanced touch handling with better gesture detection
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setTouchStartTime(Date.now());
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragStartRef.current || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Start drag if moved more than 5px (optimized for portrait smartphone)
    if (distance > 5 && !isDragging) {
      setIsDragging(true);
      onDragStart(e);
    }
  }, [isDragging, onDragStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchDuration = Date.now() - touchStartTime;
    const wasDragging = isDragging;
    
    if (wasDragging) {
      setIsDragging(false);
      onDragEnd();
    } else if (touchDuration < 300) {
      // Quick tap
      onClick();
    }
    
    dragStartRef.current = null;
    setTouchStartTime(0);
  }, [isDragging, touchStartTime, onClick, onDragEnd]);

  // Mouse events for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    onDragStart(e);
  }, [onDragStart]);

  return (
    <div
      className={`
        ${size} 
        ${connectionState.bg} 
        ${connectionState.ring}
        rounded-full 
        flex items-center justify-center 
        font-bold 
        cursor-pointer 
        transition-all duration-300 
        transform-gpu
        hover:scale-110 hover:shadow-xl
        active:scale-95
        touch-manipulation
        select-none
        shadow-lg
        ${isDragging ? 'scale-110 z-50 shadow-2xl animate-gentle-pulse' : 'z-20'}
        ${isSelected ? 'animate-gentle-pulse scale-110' : ''}
        ${isDragTarget ? 'animate-gentle-bounce scale-115 shadow-2xl ring-4 ring-green-300' : ''}
        ${isHighlighted ? 'scale-105 shadow-xl' : ''}
      `}
      style={{
        position: 'absolute',
        left: `${xPos}%`,
        top: `${yPos}%`,
        transform: 'translate(-50%, -50%)',
        touchAction: 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={`Island ${island.value}, ${island.connectedTo.length}/${island.value} connections`}
    >
      <span className={`${text} ${connectionState.text} font-bold`}>
        {island.value}
      </span>
    </div>
  );
};

export default React.memo(EnhancedIsland);
