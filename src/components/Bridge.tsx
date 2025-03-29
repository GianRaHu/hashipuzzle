
import React from 'react';
import { Bridge as BridgeType, Island } from '../utils/gameLogic';

interface BridgeProps {
  bridge: BridgeType;
  startIsland: Island;
  endIsland: Island;
  gridSize: { width: number, height: number };
  animate?: boolean;
  onClick?: () => void;
  scaleFactor?: number;
}

const Bridge: React.FC<BridgeProps> = ({ 
  bridge, 
  startIsland, 
  endIsland, 
  gridSize, 
  animate = true,
  onClick,
  scaleFactor = 1
}) => {
  // Calculate the position and dimensions based on grid size
  const { orientation, count } = bridge;
  const cellWidth = 100 / gridSize.width;
  const cellHeight = 100 / gridSize.height;
  
  // Bridge thickness scales with grid size
  const baseThickness = Math.min(2, Math.min(cellWidth, cellHeight) * 0.15);
  const thickness = baseThickness * scaleFactor;
  
  // Increased island padding to prevent bridges from overlapping islands
  const islandPadding = Math.min(cellWidth, cellHeight) * 0.45 * scaleFactor;
  
  // Calculate bridge position
  let left, top, width, height;
  
  if (orientation === 'horizontal') {
    // Horizontal bridge
    const startCol = Math.min(startIsland.col, endIsland.col);
    const endCol = Math.max(startIsland.col, endIsland.col);
    
    // Position at the middle of the row
    top = `${startIsland.row * cellHeight + (cellHeight / 2) - (thickness / 2)}%`;
    
    // Start after the first island and end before the second island
    left = `${startCol * cellWidth + islandPadding}%`;
    width = `${(endCol - startCol) * cellWidth - (islandPadding * 2)}%`;
    height = `${thickness}%`;
    
    // For double bridges, adjust positioning
    if (count === 2) {
      return (
        <>
          <div 
            className={`absolute bg-foreground ${animate ? 'animate-fade-in' : ''} cursor-pointer`}
            style={{ 
              left, 
              top: `calc(${top} - ${thickness * 0.75}%)`, 
              width, 
              height: `${thickness}%`,
              zIndex: 1
            }}
            onClick={onClick}
          />
          <div 
            className={`absolute bg-foreground ${animate ? 'animate-fade-in' : ''} cursor-pointer`}
            style={{ 
              left, 
              top: `calc(${top} + ${thickness * 0.75}%)`, 
              width, 
              height: `${thickness}%`,
              zIndex: 1
            }}
            onClick={onClick}
          />
        </>
      );
    }
  } else {
    // Vertical bridge
    const startRow = Math.min(startIsland.row, endIsland.row);
    const endRow = Math.max(startIsland.row, endIsland.row);
    
    // Position at the middle of the column
    left = `${startIsland.col * cellWidth + (cellWidth / 2) - (thickness / 2)}%`;
    
    // Start after the first island and end before the second island
    top = `${startRow * cellHeight + islandPadding}%`;
    height = `${(endRow - startRow) * cellHeight - (islandPadding * 2)}%`;
    width = `${thickness}%`;
    
    // For double bridges, adjust positioning
    if (count === 2) {
      return (
        <>
          <div 
            className={`absolute bg-foreground ${animate ? 'animate-fade-in' : ''} cursor-pointer`}
            style={{ 
              top, 
              left: `calc(${left} - ${thickness * 0.75}%)`, 
              height, 
              width: `${thickness}%`,
              zIndex: 1
            }}
            onClick={onClick}
          />
          <div 
            className={`absolute bg-foreground ${animate ? 'animate-fade-in' : ''} cursor-pointer`}
            style={{ 
              top, 
              left: `calc(${left} + ${thickness * 0.75}%)`, 
              height, 
              width: `${thickness}%`,
              zIndex: 1
            }}
            onClick={onClick}
          />
        </>
      );
    }
  }
  
  return (
    <div 
      className={`absolute bg-foreground ${animate ? 'animate-fade-in' : ''} cursor-pointer`}
      style={{ left, top, width, height, zIndex: 1 }}
      onClick={onClick}
    />
  );
};

export default Bridge;
