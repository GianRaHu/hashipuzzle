
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
  
  // Common bridge styles
  const bridgeStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'hsl(var(--gameAccent))',
    transition: 'all 0.3s ease',
    zIndex: 5 // Lower than islands (10) to allow island clicks
  };
  
  const isHorizontal = bridge.orientation === 'horizontal';
  const isSingleBridge = bridge.count === 1;
  
  if (isHorizontal) {
    // Horizontal bridge
    const minCol = Math.min(startIsland.col, endIsland.col);
    const maxCol = Math.max(startIsland.col, endIsland.col);
    const width = (maxCol - minCol) * cellSize;
    const xPos = minCol * cellSize + cellSize / 2;
    const yPos = startIsland.row * cellSize + cellSize / 2;
    
    const firstBridgeOffset = isSingleBridge ? 0 : 2; // No offset for single, 2px up for double
    const secondBridgeOffset = 2; // 2px down for second bridge
    
    // For single bridge, center it
    const firstBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${xPos}%`,
      top: `${yPos - firstBridgeOffset}%`,
      width: animate ? '0%' : `${width}%`,
      height: '2px',
      transform: 'translateY(-50%)'
    };
    
    // For double bridge, space them slightly
    const secondBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${xPos}%`,
      top: `${yPos + secondBridgeOffset}%`,
      width: bridge.count === 2 && animate ? '0%' : `${width}%`,
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
    // Vertical bridge
    const minRow = Math.min(startIsland.row, endIsland.row);
    const maxRow = Math.max(startIsland.row, endIsland.row);
    const height = (maxRow - minRow) * cellSize;
    const xPos = startIsland.col * cellSize + cellSize / 2;
    const yPos = minRow * cellSize + cellSize / 2;
    
    const firstBridgeOffset = isSingleBridge ? 0 : 2; // No offset for single, 2px left for double
    const secondBridgeOffset = 2; // 2px right for second bridge
    
    // For single bridge, center it; for double bridge, offset left
    const firstBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${xPos - firstBridgeOffset}%`,
      top: `${yPos}%`,
      width: '2px',
      height: animate ? '0%' : `${height}%`,
      transform: 'translateX(-50%)'
    };
    
    // For double bridge, offset right
    const secondBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${xPos + secondBridgeOffset}%`,
      top: `${yPos}%`,
      width: '2px',
      height: bridge.count === 2 && animate ? '0%' : `${height}%`,
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
