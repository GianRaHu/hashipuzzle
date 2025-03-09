
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

  // Optimize touch interaction with passive listeners
  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // On mobile, we want to handle events conservatively to avoid performance issues
    if (e.type === 'touchstart') {
      e.preventDefault(); // Prevent any browser-specific behaviors
      e.stopPropagation(); // Stop bubbling to parent elements
      
      // Add small delay to ensure we don't have double-triggers
      setTimeout(() => {
        onClick();
      }, 10);
    } else {
      onClick();
    }
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
        zIndex: 10, // Ensure islands are above bridges
        minWidth: '2.8rem', // Increased touch target size
        minHeight: '2.8rem', // Increased touch target size
        fontSize: '1.2rem', // Larger text for better visibility on mobile
        fontWeight: 600 // Bold numbers for better readability
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
