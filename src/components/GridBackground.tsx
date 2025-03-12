
import React from 'react';
import { Island } from '../utils/gameLogic';

interface GridBackgroundProps {
  gridSize: number;
  islands: Island[];
}

const GridBackground: React.FC<GridBackgroundProps> = ({ gridSize, islands }) => {
  // Create a grid with dots at each position
  const gridDots = [];
  
  // Calculate cell size (in percentage)
  const cellSize = 100 / gridSize;
  
  // Generate the grid dots
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Check if there's an island at this position
      const hasIsland = islands.some(island => island.row === row && island.col === col);
      
      // Only render dots where there's no island
      if (!hasIsland) {
        const xPos = col * cellSize + cellSize / 2;
        const yPos = row * cellSize + cellSize / 2;
        
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
