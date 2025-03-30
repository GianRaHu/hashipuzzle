
import React from 'react';
import { Island } from '../utils/gameLogic';

interface GridBackgroundProps {
  gridSize: { width: number, height: number };
  islands: Island[];
}

const GridBackground: React.FC<GridBackgroundProps> = ({ gridSize, islands }) => {
  const gridLines = [];
  const { width, height } = gridSize;
  
  // Create grid lines
  for (let row = 0; row < height; row++) {
    gridLines.push(
      <line 
        key={`h-${row}`}
        x1="0%" 
        y1={`${(row / height) * 100}%`}
        x2="100%" 
        y2={`${(row / height) * 100}%`}
        className="stroke-border/10"
        strokeWidth="1"
      />
    );
  }
  
  for (let col = 0; col < width; col++) {
    gridLines.push(
      <line 
        key={`v-${col}`}
        x1={`${(col / width) * 100}%`}
        y1="0%" 
        x2={`${(col / width) * 100}%`}
        y2="100%"
        className="stroke-border/10"
        strokeWidth="1"
      />
    );
  }
  
  return (
    <svg className="absolute inset-0 w-full h-full">
      {gridLines}
    </svg>
  );
};

export default GridBackground;
