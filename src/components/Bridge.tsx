
import React from 'react';
import { Bridge as BridgeType, Island } from '../utils/gameLogic';

interface BridgeProps {
  bridge: BridgeType;
  startIsland: Island;
  endIsland: Island;
  gridSize: { rows: number; cols: number };
  animate?: boolean;
  onClick?: () => void;
}

const Bridge: React.FC<BridgeProps> = ({ bridge, startIsland, endIsland, gridSize, animate = true, onClick }) => {
  const cellSizeX = 100 / gridSize.cols;
  const cellSizeY = 100 / gridSize.rows;
  
  const bridgeStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'hsl(var(--gameAccent)/0.8)',
    transition: 'all 0.3s ease',
    zIndex: 5
  };
  
  const isHorizontal = bridge.orientation === 'horizontal';
  const isSingleBridge = bridge.count === 1;
  
  // Determine node radius as a percentage of cell size based on grid size
  const getNodeRadiusPercent = () => {
    const minGridSize = Math.min(gridSize.rows, gridSize.cols);
    if (minGridSize <= 6) return 14; // Increased from 12
    if (minGridSize <= 8) return 12; // Increased from 10
    if (minGridSize <= 10) return 10; // Increased from 8
    if (minGridSize <= 12) return 8;  // Increased from 7
    return 7; // Increased from 6
  };
  
  // Node radius as a percentage of cell size for better scaling
  const nodeRadiusPercent = getNodeRadiusPercent();
  
  if (isHorizontal) {
    const minCol = Math.min(startIsland.col, endIsland.col);
    const maxCol = Math.max(startIsland.col, endIsland.col);
    const width = (maxCol - minCol) * cellSizeX;
    const xPos = minCol * cellSizeX + cellSizeX / 2;
    const yPos = startIsland.row * cellSizeY + cellSizeY / 2;
    
    // Calculate bridge start and end positions to avoid overlapping with islands
    const nodeOffsetX = (nodeRadiusPercent / 100) * cellSizeX;
    const adjustedWidth = width - (nodeOffsetX * 2);
    const adjustedPos = xPos + nodeOffsetX;
    
    // Reduced spacing between bridges
    const firstBridgeOffset = isSingleBridge ? 0 : 0.4;
    const secondBridgeOffset = 0.4;
    
    const firstBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${adjustedPos}%`,
      top: `${yPos - firstBridgeOffset}%`,
      width: animate ? '0%' : `${adjustedWidth}%`,
      height: '2px',
      transform: 'translateY(-50%)',
      cursor: 'pointer'
    };
    
    const secondBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${adjustedPos}%`,
      top: `${yPos + secondBridgeOffset}%`,
      width: bridge.count === 2 && animate ? '0%' : `${adjustedWidth}%`,
      height: '2px',
      transform: 'translateY(-50%)',
      opacity: bridge.count === 2 ? 1 : 0,
      cursor: 'pointer'
    };
    
    return (
      <div className="bridge-container" onClick={onClick}>
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
      </div>
    );
  } else {
    const minRow = Math.min(startIsland.row, endIsland.row);
    const maxRow = Math.max(startIsland.row, endIsland.row);
    const height = (maxRow - minRow) * cellSizeY;
    const xPos = startIsland.col * cellSizeX + cellSizeX / 2;
    const yPos = minRow * cellSizeY + cellSizeY / 2;
    
    // Calculate bridge start and end positions to avoid overlapping with islands
    const nodeOffsetY = (nodeRadiusPercent / 100) * cellSizeY;
    const adjustedHeight = height - (nodeOffsetY * 2);
    const adjustedPos = yPos + nodeOffsetY;
    
    // Reduced spacing between bridges
    const firstBridgeOffset = isSingleBridge ? 0 : 0.4;
    const secondBridgeOffset = 0.4;
    
    const firstBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${xPos - firstBridgeOffset}%`,
      top: `${adjustedPos}%`,
      width: '2px',
      height: animate ? '0%' : `${adjustedHeight}%`,
      transform: 'translateX(-50%)',
      cursor: 'pointer'
    };
    
    const secondBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${xPos + secondBridgeOffset}%`,
      top: `${adjustedPos}%`,
      width: '2px',
      height: bridge.count === 2 && animate ? '0%' : `${adjustedHeight}%`,
      transform: 'translateX(-50%)',
      opacity: bridge.count === 2 ? 1 : 0,
      cursor: 'pointer'
    };
    
    return (
      <div className="bridge-container" onClick={onClick}>
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
      </div>
    );
  }
};

export default Bridge;
