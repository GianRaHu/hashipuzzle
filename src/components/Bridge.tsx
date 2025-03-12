
import React from 'react';
import { Bridge as BridgeType, Island } from '../utils/gameLogic';

interface BridgeProps {
  bridge: BridgeType;
  startIsland: Island;
  endIsland: Island;
  gridSize: number;
  animate?: boolean;
}

const Bridge: React.FC<BridgeProps> = ({ bridge, startIsland, endIsland, gridSize, animate = true }) => {
  const cellSize = 100 / gridSize;
  
  const bridgeStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'hsl(var(--gameAccent)/0.8)',
    transition: 'all 0.3s ease',
    zIndex: 5
  };
  
  const isHorizontal = bridge.orientation === 'horizontal';
  const isSingleBridge = bridge.count === 1;
  
  // Calculate island size based on grid size (smaller for larger grids)
  const islandRadius = Math.max(1.2, 3 - (gridSize * 0.1));
  
  if (isHorizontal) {
    const minCol = Math.min(startIsland.col, endIsland.col);
    const maxCol = Math.max(startIsland.col, endIsland.col);
    const width = (maxCol - minCol) * cellSize;
    const xPos = minCol * cellSize + cellSize / 2;
    const yPos = startIsland.row * cellSize + cellSize / 2;
    
    // Adjusted width to stop at the island rings
    const adjustedWidth = width - (cellSize * islandRadius / gridSize);
    const adjustedPos = xPos + (cellSize * islandRadius / (2 * gridSize));
    
    // Reduced spacing between bridges (0.3 instead of 0.5)
    const firstBridgeOffset = isSingleBridge ? 0 : 0.3;
    const secondBridgeOffset = 0.3;
    
    const firstBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${adjustedPos}%`,
      top: `${yPos - firstBridgeOffset}%`,
      width: animate ? '0%' : `${adjustedWidth}%`,
      height: '2px',
      transform: 'translateY(-50%)'
    };
    
    const secondBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${adjustedPos}%`,
      top: `${yPos + secondBridgeOffset}%`,
      width: bridge.count === 2 && animate ? '0%' : `${adjustedWidth}%`,
      height: '2px',
      transform: 'translateY(-50%)',
      opacity: bridge.count === 2 ? 1 : 0
    };
    
    return (
      <>
        <div 
          className={`hashi-bridge rounded-full transition-all ${animate ? 'animate-bridge-draw' : ''}`}
          style={firstBridgeStyle}
          aria-hidden="true"
        />
        {bridge.count === 2 && (
          <div 
            className={`hashi-bridge rounded-full transition-all ${animate ? 'animate-bridge-draw' : ''}`}
            style={secondBridgeStyle}
            aria-hidden="true"
          />
        )}
      </>
    );
  } else {
    const minRow = Math.min(startIsland.row, endIsland.row);
    const maxRow = Math.max(startIsland.row, endIsland.row);
    const height = (maxRow - minRow) * cellSize;
    const xPos = startIsland.col * cellSize + cellSize / 2;
    const yPos = minRow * cellSize + cellSize / 2;
    
    // Adjusted height to stop at the island rings
    const adjustedHeight = height - (cellSize * islandRadius / gridSize);
    const adjustedPos = yPos + (cellSize * islandRadius / (2 * gridSize));
    
    // Reduced spacing between bridges (0.3 instead of 0.5)
    const firstBridgeOffset = isSingleBridge ? 0 : 0.3;
    const secondBridgeOffset = 0.3;
    
    const firstBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${xPos - firstBridgeOffset}%`,
      top: `${adjustedPos}%`,
      width: '2px',
      height: animate ? '0%' : `${adjustedHeight}%`,
      transform: 'translateX(-50%)'
    };
    
    const secondBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${xPos + secondBridgeOffset}%`,
      top: `${adjustedPos}%`,
      width: '2px',
      height: bridge.count === 2 && animate ? '0%' : `${adjustedHeight}%`,
      transform: 'translateX(-50%)',
      opacity: bridge.count === 2 ? 1 : 0
    };
    
    return (
      <>
        <div 
          className={`hashi-bridge rounded-full transition-all ${animate ? 'animate-bridge-draw' : ''}`}
          style={firstBridgeStyle}
          aria-hidden="true"
        />
        {bridge.count === 2 && (
          <div 
            className={`hashi-bridge rounded-full transition-all ${animate ? 'animate-bridge-draw' : ''}`}
            style={secondBridgeStyle}
            aria-hidden="true"
          />
        )}
      </>
    );
  }
};

export default Bridge;
