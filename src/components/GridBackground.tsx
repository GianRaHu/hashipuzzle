
import React from 'react';
import { Island } from '../utils/gameLogic';

interface GridBackgroundProps {
  gridWidth: number;
  gridHeight: number;
  islands: Island[];
}

const GridBackground: React.FC<GridBackgroundProps> = ({ gridWidth, gridHeight, islands }) => {
  // Create a grid with dots at each position
  const gridDots = [];
  
  // Calculate cell sizes based on grid dimensions
  const cellWidth = 100 / gridWidth;
  const cellHeight = 100 / gridHeight;
  
  // Generate the grid dots
  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      // Check if there's an island at this position
      const hasIsland = islands.some(island => island.row === row && island.col === col);
      
      // Only render dots where there's no island
      if (!hasIsland) {
        const xPos = col * cellWidth + cellWidth / 2;
        const yPos = row * cellHeight + cellHeight / 2;
        
        gridDots.push(
          <div 
            key={`dot-${row}-${col}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-muted-foreground/20"
            style={{
              left: `${xPos}%`,
              top: `${yPos}%`,
              transform: 'translate(-50%, -50%)'
            }}
            aria-hidden="true"
          />
        );
      }
    }
  }
  
  return (
    <div className="absolute inset-0">
      {gridDots}
    </div>
  );
};

export default React.memo(GridBackground);
