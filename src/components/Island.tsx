
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
  
  // Determine visual state
  let stateClass = '';
  if (isSelected) {
    stateClass = 'ring-2 ring-gameAccent ring-offset-2 ring-offset-background bg-gameAccent text-white';
  } else if (actualConnections === connectionsNeeded) {
    stateClass = 'bg-primary/20 text-primary font-bold';
  } else if (actualConnections > 0) {
    stateClass = 'bg-secondary/80';
  }

  // Handle all interactions to prevent delays
  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      type="button"
      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-foreground transition-all duration-300 ${stateClass} ${
        actualConnections > connectionsNeeded ? 'bg-destructive/20 text-destructive' : ''
      }`}
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
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      aria-label={`Island with value ${island.value}`}
    >
      {island.value}
    </button>
  );
};

export default React.memo(Island);
