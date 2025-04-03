
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
    zIndex: 5,
    cursor: onClick ? 'pointer' : 'default'
  };
  
  const isHorizontal = bridge.orientation === 'horizontal';
  
  // Determine node radius as a percentage of cell size based on grid size
  const getNodeRadiusPercent = () => {
    const cellArea = (100 / gridSize.rows) * (100 / gridSize.cols); // Calculate cell area in percentage
    if (cellArea >= 250) return 14;      // Very large cells
    if (cellArea >= 150) return 12;      // Large cells
    if (cellArea >= 100) return 10;      // Medium cells
    if (cellArea >= 70) return 8;        // Small cells
    return 6;                            // Very small cells
  };
  
  // Get node radius as a percentage of cell size
  const nodeRadiusPercent = getNodeRadiusPercent();
  const nodeRadiusX = (nodeRadiusPercent / 100) * cellSizeX;
  const nodeRadiusY = (nodeRadiusPercent / 100) * cellSizeY;
  
  // Handle click with better detection area
  const handleBridgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };
  
  // Calculate bridge spacing as a fixed value (not percentage-based)
  const bridgeSpacing = 0.3; // Fixed small spacing value that works across grid sizes
  
  if (isHorizontal) {
    const minCol = Math.min(startIsland.col, endIsland.col);
    const maxCol = Math.max(startIsland.col, endIsland.col);
    const xPos = minCol * cellSizeX + cellSizeX / 2;
    const yPos = startIsland.row * cellSizeY + cellSizeY / 2;
    
    // Calculate bridge length
    const bridgeLength = (maxCol - minCol) * cellSizeX;
    
    // Adjust for node radius to prevent overlap
    const adjustedStartX = xPos + nodeRadiusX;
    const adjustedWidth = bridgeLength - (nodeRadiusX * 2);
    
    const firstBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${adjustedStartX}%`,
      top: `${yPos - bridgeSpacing}%`,
      width: animate ? '0%' : `${adjustedWidth}%`,
      height: '2px',
      transform: 'translateY(-50%)'
    };
    
    const secondBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${adjustedStartX}%`,
      top: `${yPos + bridgeSpacing}%`,
      width: bridge.count === 2 && animate ? '0%' : `${adjustedWidth}%`,
      height: '2px',
      transform: 'translateY(-50%)',
      opacity: bridge.count === 2 ? 1 : 0
    };
    
    return (
      <div className="bridge-container" onClick={handleBridgeClick}>
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
    const xPos = startIsland.col * cellSizeX + cellSizeX / 2;
    const yPos = minRow * cellSizeY + cellSizeY / 2;
    
    // Calculate bridge length
    const bridgeLength = (maxRow - minRow) * cellSizeY;
    
    // Adjust for node radius to prevent overlap
    const adjustedStartY = yPos + nodeRadiusY;
    const adjustedHeight = bridgeLength - (nodeRadiusY * 2);
    
    const firstBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${xPos - bridgeSpacing}%`,
      top: `${adjustedStartY}%`,
      width: '2px',
      height: animate ? '0%' : `${adjustedHeight}%`,
      transform: 'translateX(-50%)'
    };
    
    const secondBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${xPos + bridgeSpacing}%`,
      top: `${adjustedStartY}%`,
      width: '2px',
      height: bridge.count === 2 && animate ? '0%' : `${adjustedHeight}%`,
      transform: 'translateX(-50%)',
      opacity: bridge.count === 2 ? 1 : 0
    };
    
    return (
      <div className="bridge-container" onClick={handleBridgeClick}>
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
