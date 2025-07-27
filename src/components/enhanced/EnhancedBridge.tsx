
import React from 'react';
import { Bridge as BridgeType, Island } from '../../utils/gameLogic';

interface EnhancedBridgeProps {
  bridge: BridgeType;
  startIsland: Island;
  endIsland: Island;
  gridSize: { rows: number; cols: number };
  isHighlighted?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

const EnhancedBridge: React.FC<EnhancedBridgeProps> = ({
  bridge,
  startIsland,
  endIsland,
  gridSize,
  isHighlighted = false,
  onClick,
  onRemove
}) => {
  const cellSizeX = 100 / gridSize.cols;
  const cellSizeY = 100 / gridSize.rows;
  
  const isHorizontal = bridge.orientation === 'horizontal';
  const isDouble = bridge.count === 2;
  
  // Bridge thickness optimized for portrait smartphones - made thinner
  const getBridgeThickness = () => {
    const gridArea = gridSize.rows * gridSize.cols;
    if (gridArea <= 42) return 2;
    if (gridArea <= 96) return 1.5;
    return 1;
  };

  const bridgeThickness = getBridgeThickness();
  const bridgeSpacing = isDouble ? bridgeThickness + 0.5 : 0;
  
  // Island radius optimized for portrait smartphones
  const getIslandRadius = () => {
    const gridArea = gridSize.rows * gridSize.cols;
    if (gridArea <= 42) return 20; // w-10 = 40px, radius = 20px
    if (gridArea <= 96) return 16; // w-8 = 32px, radius = 16px
    if (gridArea <= 140) return 14; // w-7 = 28px, radius = 14px
    if (gridArea <= 192) return 12; // w-6 = 24px, radius = 12px
    return 10; // w-5 = 20px, radius = 10px
  };

  const islandRadius = getIslandRadius();
  
  // Touch area optimized for portrait smartphones
  const getTouchAreaSize = () => {
    return 16; // Optimized for portrait smartphone touch
  };

  const touchAreaSize = getTouchAreaSize();

  if (isHorizontal) {
    const minCol = Math.min(startIsland.col, endIsland.col);
    const maxCol = Math.max(startIsland.col, endIsland.col);
    const bridgeLength = (maxCol - minCol) * cellSizeX;
    const xStart = minCol * cellSizeX + cellSizeX / 2;
    const yCenter = startIsland.row * cellSizeY + cellSizeY / 2;
    
    // Calculate actual bridge dimensions with island radius offset
    const radiusOffsetX = (islandRadius / window.innerWidth) * 100;
    const actualLength = bridgeLength - (radiusOffsetX * 2);
    const actualStart = xStart + radiusOffsetX;
    
    return (
      <div className="bridge-group">
        {/* Touch/Click area - invisible but larger for better interaction */}
        <div
          className="absolute cursor-pointer z-10"
          style={{
            left: `${actualStart}%`,
            top: `${yCenter}%`,
            width: `${actualLength}%`,
            height: `${touchAreaSize}px`,
            transform: `translate(0, -${touchAreaSize/2}px)`,
            backgroundColor: 'transparent'
          }}
          onClick={onClick}
          onDoubleClick={onRemove}
          aria-label={`${isDouble ? 'Double' : 'Single'} bridge, tap to toggle, double-tap to remove`}
        />
        
        {/* First bridge line */}
        <div
          className={`
            absolute bg-primary transition-all duration-300 rounded-full hover:bg-primary/90 hover:scale-105 animate-bridge-draw
            ${isHighlighted ? 'bg-primaryGlow shadow-xl ring-2 ring-primary scale-105' : 'hover:shadow-lg'}
            ${isDouble ? '' : 'z-5'}
          `}
          style={{
            left: `${actualStart}%`,
            top: `${yCenter - (isDouble ? bridgeSpacing/2 : 0)}%`,
            width: `${actualLength}%`,
            height: `${bridgeThickness}px`,
            transform: 'translateY(-50%)',
            zIndex: 5
          }}
        />
        
        {/* Second bridge line (for double bridges) */}
        {isDouble && (
          <div
            className={`
              absolute bg-primary transition-all duration-300 rounded-full hover:bg-primary/90 hover:scale-105 animate-bridge-draw
              ${isHighlighted ? 'bg-primaryGlow shadow-xl ring-2 ring-primary scale-105' : 'hover:shadow-lg'}
            `}
            style={{
              left: `${actualStart}%`,
              top: `${yCenter + bridgeSpacing/2}%`,
              width: `${actualLength}%`,
              height: `${bridgeThickness}px`,
              transform: 'translateY(-50%)',
              zIndex: 5
            }}
          />
        )}
      </div>
    );
  } else {
    // Vertical bridge
    const minRow = Math.min(startIsland.row, endIsland.row);
    const maxRow = Math.max(startIsland.row, endIsland.row);
    const bridgeLength = (maxRow - minRow) * cellSizeY;
    const yStart = minRow * cellSizeY + cellSizeY / 2;
    const xCenter = startIsland.col * cellSizeX + cellSizeX / 2;
    
    // Calculate actual bridge dimensions with island radius offset
    const radiusOffsetY = (islandRadius / window.innerHeight) * 100;
    const actualLength = bridgeLength - (radiusOffsetY * 2);
    const actualStart = yStart + radiusOffsetY;
    
    return (
      <div className="bridge-group">
        {/* Touch/Click area - invisible but larger for better interaction */}
        <div
          className="absolute cursor-pointer z-10"
          style={{
            left: `${xCenter}%`,
            top: `${actualStart}%`,
            width: `${touchAreaSize}px`,
            height: `${actualLength}%`,
            transform: `translate(-${touchAreaSize/2}px, 0)`,
            backgroundColor: 'transparent'
          }}
          onClick={onClick}
          onDoubleClick={onRemove}
          aria-label={`${isDouble ? 'Double' : 'Single'} bridge, tap to toggle, double-tap to remove`}
        />
        
        {/* First bridge line */}
        <div
          className={`
            absolute bg-primary transition-all duration-300 rounded-full hover:bg-primary/90 hover:scale-105 animate-bridge-draw
            ${isHighlighted ? 'bg-primaryGlow shadow-xl ring-2 ring-primary scale-105' : 'hover:shadow-lg'}
            ${isDouble ? '' : 'z-5'}
          `}
          style={{
            left: `${xCenter - (isDouble ? bridgeSpacing/2 : 0)}%`,
            top: `${actualStart}%`,
            width: `${bridgeThickness}px`,
            height: `${actualLength}%`,
            transform: 'translateX(-50%)',
            zIndex: 5
          }}
        />
        
        {/* Second bridge line (for double bridges) */}
        {isDouble && (
          <div
            className={`
              absolute bg-primary transition-all duration-300 rounded-full hover:bg-primary/90 hover:scale-105 animate-bridge-draw
              ${isHighlighted ? 'bg-primaryGlow shadow-xl ring-2 ring-primary scale-105' : 'hover:shadow-lg'}
            `}
            style={{
              left: `${xCenter + bridgeSpacing/2}%`,
              top: `${actualStart}%`,
              width: `${bridgeThickness}px`,
              height: `${actualLength}%`,
              transform: 'translateX(-50%)',
              zIndex: 5
            }}
          />
        )}
      </div>
    );
  }
};

export default React.memo(EnhancedBridge);
