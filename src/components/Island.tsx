
import React from 'react';
import { Island as IslandType } from '../utils/gameLogic';
import { cva } from 'class-variance-authority';

interface IslandProps {
  island: IslandType;
  isSelected: boolean;
  onClick: () => void;
  onDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onDragEnd: () => void;
  gridSize: { width: number, height: number };
  scaleFactor?: number;
}

// Calculate the status of an island based on its value and connections
const getIslandStatus = (island: IslandType): 'empty' | 'incomplete' | 'complete' | 'overconnected' => {
  const connectedBridges = island.connectedTo?.length || 0;
  
  if (connectedBridges === 0) return 'empty';
  if (connectedBridges < island.value) return 'incomplete';
  if (connectedBridges > island.value) return 'overconnected';
  return 'complete';
};

// Island component styling variants
const islandVariants = cva(
  "absolute flex items-center justify-center rounded-full transition-all cursor-pointer select-none touch-none",
  {
    variants: {
      status: {
        empty: "bg-background border-2 border-foreground text-foreground",
        incomplete: "bg-destructive text-destructive-foreground",
        complete: "bg-green-500 text-white",
        overconnected: "bg-yellow-500 text-white",
      },
      selected: {
        true: "ring-2 ring-offset-2 ring-primary ring-offset-background scale-110",
        false: "",
      },
    },
    defaultVariants: {
      status: "empty",
      selected: false,
    },
  }
);

const Island: React.FC<IslandProps> = ({ 
  island, 
  isSelected, 
  onClick, 
  onDragStart, 
  onDragEnd,
  gridSize,
  scaleFactor = 1
}) => {
  const status = getIslandStatus(island);
  
  // Calculate position based on grid size
  const cellWidth = 100 / gridSize.width;
  const cellHeight = 100 / gridSize.height;
  
  // Calculate island size based on grid size
  const baseSize = Math.min(cellWidth, cellHeight) * 0.7;
  const size = baseSize * scaleFactor;
  
  // Position the island in the center of its cell
  const left = `${island.col * cellWidth + (cellWidth - size) / 2}%`;
  const top = `${island.row * cellHeight + (cellHeight - size) / 2}%`;
  
  // Set font size based on grid size
  const fontSize = `${Math.max(size * 0.4, 1)}vmin`;
  
  // Handle mouse/touch events
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default to avoid issues on touch devices
    e.preventDefault();
    onDragStart(e);
  };
  
  const handlePointerUp = () => {
    onClick();
    onDragEnd();
  };
  
  // Add event handlers for desktop and mobile
  return (
    <div
      className={islandVariants({ status, selected: isSelected })}
      style={{ 
        left, 
        top, 
        width: `${size}%`, 
        height: `${size}%`,
        fontSize,
        zIndex: isSelected ? 5 : 2
      }}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      aria-label={`Island with value ${island.value}`}
    >
      {island.value}
    </div>
  );
};

export default Island;
