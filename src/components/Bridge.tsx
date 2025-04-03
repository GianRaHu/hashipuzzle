
import React from 'react';
import { Bridge as BridgeType, Island } from '../utils/gameLogic';
import { useMediaQuery } from '@/hooks/use-mobile';

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
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const bridgeStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'hsl(var(--gameAccent)/0.8)',
    transition: 'all 0.3s ease',
    zIndex: 5,
    cursor: onClick ? 'pointer' : 'default'
  };
  
  const isHorizontal = bridge.orientation === 'horizontal';
  
  // Dynamic bridge thickness based on grid size
  const getBridgeThickness = () => {
    if (isMobile) {
      return gridSize.rows > 7 ? 1 : 2; // Thinner on small mobile screens with many islands
    }
    return gridSize.rows > 7 ? 2 : 2; // Standard thickness otherwise
  };

  const bridgeThickness = getBridgeThickness();
  
  // Get node radius as a percentage of cell size (improved calculation)
  const getNodeRadiusPercent = () => {
    const cellArea = (100 / gridSize.rows) * (100 / gridSize.cols);
    if (cellArea >= 250) return 15;      // Very large cells
    if (cellArea >= 150) return 13;      // Large cells
    if (cellArea >= 100) return 11;      // Medium cells
    if (cellArea >= 70) return 9;        // Small cells
    return 7;                            // Very small cells
  };
  
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
  
  // Calculate bridge spacing based on grid size (smaller for larger grids)
  const getBridgeSpacing = () => {
    const baseSpacing = 0.2;
    if (gridSize.rows > 7 || gridSize.cols > 7) {
      return baseSpacing * 0.8; // Reduce spacing for larger grids
    }
    return baseSpacing;
  };
  
  const bridgeSpacing = getBridgeSpacing();
  
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
      height: `${bridgeThickness}px`,
      transform: 'translateY(-50%)'
    };
    
    const secondBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${adjustedStartX}%`,
      top: `${yPos + bridgeSpacing}%`,
      width: bridge.count === 2 && animate ? '0%' : `${adjustedWidth}%`,
      height: `${bridgeThickness}px`,
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
      width: `${bridgeThickness}px`,
      height: animate ? '0%' : `${adjustedHeight}%`,
      transform: 'translateX(-50%)'
    };
    
    const secondBridgeStyle: React.CSSProperties = {
      ...bridgeStyle,
      left: `${xPos + bridgeSpacing}%`,
      top: `${adjustedStartY}%`,
      width: `${bridgeThickness}px`,
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
