
import React from 'react';
import { Island as IslandType } from '../utils/gameLogic';

interface IslandProps {
  island: IslandType;
  isSelected: boolean;
  onClick: () => void;
  gridSize: number;
}

const Island: React.FC<IslandProps> = ({ island, isSelected, onClick, gridSize }) => {
  // Calculate the size and position
  const cellSize = 100 / gridSize;
  const xPos = island.col * cellSize + cellSize / 2;
  const yPos = island.row * cellSize + cellSize / 2;
  
  // Connection completeness (for visual feedback)
  const connectionsNeeded = island.value;
  const actualConnections = island.connectedTo.length;
  const completeness = actualConnections / connectionsNeeded;
  
  // Determine visual state
  let stateClass = '';
  if (isSelected) {
    stateClass = 'hashi-island-selected scale-110';
  } else if (actualConnections === connectionsNeeded) {
    stateClass = 'bg-primary/20 text-primary font-bold';
  } else if (actualConnections > 0) {
    stateClass = 'bg-secondary/80';
  }

  // Handle touch and click
  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event bubbling
    onClick();
  };

  return (
    <button
      type="button"
      className={`hashi-island ${stateClass} ${
        actualConnections > connectionsNeeded ? 'bg-destructive/20 text-destructive' : ''
      }`}
      style={{
        position: 'absolute',
        left: `${xPos}%`,
        top: `${yPos}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10, // Ensure islands are above bridges and can be clicked
        minWidth: '2.5rem', // Ensure minimum touch target size
        minHeight: '2.5rem' // Ensure minimum touch target size
      }}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      aria-label={`Island with value ${island.value}`}
    >
      {island.value}
    </button>
  );
};

export default Island;
