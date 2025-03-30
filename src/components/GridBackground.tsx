
import React from 'react';
import { Island } from '../utils/gameLogic';

interface GridBackgroundProps {
  gridSize: { rows: number; cols: number };
  islands: Island[];
}

const GridBackground: React.FC<GridBackgroundProps> = ({ gridSize, islands }) => {
  // Create a grid with dots at each position
  const gridDots = [];
  
  // Generate the grid dots
  for (let row = 0; row < gridSize.rows; row++) {
    for (let col = 0; col < gridSize.cols; col++) {
      // Check if there's an island at this position
      const hasIsland = islands.some(island => island.row === row && island.col === col);
      
      // Only render dots where there's no island
      if (!hasIsland) {
        // Calculate cell size (in percentage)
        const cellSizeX = 100 / gridSize.cols;
        const cellSizeY = 100 / gridSize.rows;
        
        const xPos = col * cellSizeX + cellSizeX / 2;
        const yPos = row * cellSizeY + cellSizeY / 2;
        
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
