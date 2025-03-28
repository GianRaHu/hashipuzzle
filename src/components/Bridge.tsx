import React from 'react';
import { Bridge as BridgeType, Island as IslandType } from '../utils/gameLogic';

interface BridgeProps {
  bridge: BridgeType;
  startIsland: IslandType;
  endIsland: IslandType;
  gridSize: number;
  animate?: boolean;
}

const NODE_RADIUS = 30; // Adjust this value based on your node size

const Bridge: React.FC<BridgeProps> = ({ bridge, startIsland, endIsland, gridSize, animate = true }) => {
  // Calculate the angle of the bridge relative to the start island
  const angle = Math.atan2(
    endIsland.row - startIsland.row,
    endIsland.col - startIsland.col
  );

  // Calculate the offset to the edge of the island circle 
  const offsetX = NODE_RADIUS * Math.cos(angle);
  const offsetY = NODE_RADIUS * Math.sin(angle);

  // Adjust the start and end points to the edge of the islands
  const startX = (startIsland.col + 0.5) * 100 / gridSize + offsetX * 100 / (gridSize * window.innerWidth);
  const startY = (startIsland.row + 0.5) * 100 / gridSize + offsetY * 100 / (gridSize * window.innerHeight);
  const endX = (endIsland.col + 0.5) * 100 / gridSize - offsetX * 100 / (gridSize * window.innerWidth);
  const endY = (endIsland.row + 0.5) * 100 / gridSize - offsetY * 100 / (gridSize * window.innerHeight);

  const bridgeStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'hsl(var(--gameAccent)/0.8)',
    transition: 'all 0.3s ease',
    zIndex: 5
  };

  const lineProps = {
    stroke: 'black',
    strokeWidth: '2',
  };

  const isHorizontal = bridge.orientation === 'horizontal';
  const isSingleBridge = bridge.count === 1;

  // Shared styles for both horizontal and vertical bridges
  const sharedStyle: React.CSSProperties = {
    ...bridgeStyle,
    width: isHorizontal ? '100%' : '2px',
    height: isHorizontal ? '2px' : '100%',
    transform: isHorizontal ? 'translateY(-50%)' : 'translateX(-50%)',
  };

  const firstBridgeStyle: React.CSSProperties = {
    ...sharedStyle,
    left: isHorizontal ? `${startX}%` : `${startX - (isSingleBridge ? 0 : 0.5)}%`,
    top: isHorizontal ? `${startY - (isSingleBridge ? 0 : 0.5)}%` : `${startY}%`,
  };

  const secondBridgeStyle: React.CSSProperties = {
    ...sharedStyle,
    left: isHorizontal ? `${startX}%` : `${startX + 0.5}%`,
    top: isHorizontal ? `${startY + 0.5}%` : `${startY}%`,
    opacity: bridge.count === 2 ? 1 : 0,
  };

  return (
    <>
      <line
        x1={`${startX}%`}
        y1={`${startY}%`}
        x2={`${endX}%`}
        y2={`${endY}%`}
        {...lineProps}
      />
      {bridge.count === 2 && (
        <line
          x1={`${startX + offsetX / gridSize}%`}
          y1={`${startY + offsetY / gridSize}%`}
          x2={`${endX + offsetX / gridSize}%`}
          y2={`${endY + offsetY / gridSize}%`}
          {...lineProps}
          opacity={0.7}
        />
      )}
    </>
  );
};

export default Bridge;
