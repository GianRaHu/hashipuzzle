
import React from 'react';
import { Bridge as BridgeType, Island } from '../utils/gameLogic';

interface BridgeProps {
  bridge: BridgeType;
  startIsland: Island;
  endIsland: Island;
  gridWidth: number;
  gridHeight: number;
  animate?: boolean;
}

const Bridge: React.FC<BridgeProps> = ({ 
  bridge, 
  startIsland, 
  endIsland, 
  gridWidth,
  gridHeight,
  animate = false
}) => {
  // Calculate cell sizes based on grid dimensions
  const cellWidth = 100 / gridWidth;
  const cellHeight = 100 / gridHeight;
  
  // Calculate positions for islands (in percentage)
  const startX = startIsland.col * cellWidth + cellWidth / 2;
  const startY = startIsland.row * cellHeight + cellHeight / 2;
  const endX = endIsland.col * cellWidth + cellWidth / 2;
  const endY = endIsland.row * cellHeight + cellHeight / 2;
  
  // Bridge styles
  let width, height, left, top, transform;
  
  if (bridge.orientation === 'horizontal') {
    // For horizontal bridges
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    width = `${maxX - minX}%`;
    height = bridge.count === 1 ? '2px' : '5px';
    left = `${minX}%`;
    top = `${startY}%`;
    transform = 'translateY(-50%)';
  } else {
    // For vertical bridges
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);
    width = bridge.count === 1 ? '2px' : '5px';
    height = `${maxY - minY}%`;
    left = `${startX}%`;
    top = `${minY}%`;
    transform = 'translateX(-50%)';
  }
  
  // Double bridge styles (for count = 2)
  let secondBridgeStyle = {};
  if (bridge.count === 2) {
    if (bridge.orientation === 'horizontal') {
      secondBridgeStyle = {
        position: 'absolute',
        width: '100%',
        height: '2px',
        top: '3px',
        left: 0,
        backgroundColor: 'hsl(var(--primary))'
      };
    } else {
      secondBridgeStyle = {
        position: 'absolute',
        width: '2px',
        height: '100%',
        left: '3px',
        top: 0,
        backgroundColor: 'hsl(var(--primary))'
      };
    }
  }
  
  // Animation class for drawing effect
  const animationClass = animate ? 'animate-bridge-draw' : '';
  
  return (
    <div
      className={`absolute bg-primary z-0 ${animationClass}`}
      style={{
        width,
        height,
        left,
        top,
        transform,
        transformOrigin: bridge.orientation === 'horizontal' ? 'left center' : 'center top',
      }}
    >
      {bridge.count === 2 && <div style={secondBridgeStyle} />}
    </div>
  );
};

export default Bridge;
