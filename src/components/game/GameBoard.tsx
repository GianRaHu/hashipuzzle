
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { generatePuzzle, Puzzle, Island, canConnect, toggleBridge } from '@/utils/gameLogic';
import './GameBoard.css';

export const GameBoard: React.FC = () => {
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [selectedIsland, setSelectedIsland] = useState<Island | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize a demo puzzle
  useEffect(() => {
    const initPuzzle = () => {
      setIsLoading(true);
      const newPuzzle = generatePuzzle('easy');
      setPuzzle(newPuzzle);
      setIsLoading(false);
    };

    initPuzzle();
  }, []);

  const handleIslandClick = (island: Island) => {
    if (!puzzle) return;

    if (selectedIsland) {
      // If an island is already selected, try to connect them
      if (selectedIsland.id !== island.id && canConnect(selectedIsland, island, puzzle.islands)) {
        const updatedPuzzle = toggleBridge(selectedIsland, island, puzzle);
        setPuzzle(updatedPuzzle);
      }
      setSelectedIsland(null);
    } else {
      // Select this island
      setSelectedIsland(island);
    }
  };

  if (isLoading || !puzzle) {
    return (
      <div className="game-board">
        <h1>Hashi Puzzle</h1>
        <p>Loading puzzle...</p>
      </div>
    );
  }

  return (
    <div className="game-board">
      <h1>Hashi Puzzle</h1>
      
      <div className="relative bg-muted/20 border rounded-lg shadow-inner p-4 w-full max-w-md aspect-square">
        <div className="grid grid-cols-7 grid-rows-7 gap-0 h-full w-full relative">
          {/* Render bridges */}
          {puzzle.bridges.map((bridge) => {
            const startIsland = puzzle.islands.find(i => i.id === bridge.startIslandId);
            const endIsland = puzzle.islands.find(i => i.id === bridge.endIslandId);
            
            if (!startIsland || !endIsland) return null;
            
            const isHorizontal = bridge.orientation === 'horizontal';
            const startPos = isHorizontal 
              ? { x: startIsland.col, y: startIsland.row } 
              : { x: startIsland.col, y: startIsland.row };
            const endPos = isHorizontal 
              ? { x: endIsland.col, y: endIsland.row } 
              : { x: endIsland.col, y: endIsland.row };
              
            // Calculate grid positions (0-100%)
            const gridSize = 7; // Using easy puzzle size
            const startX = (startPos.x / gridSize) * 100 + '%';
            const startY = (startPos.y / gridSize) * 100 + '%';
            const endX = (endPos.x / gridSize) * 100 + '%';
            const endY = (endPos.y / gridSize) * 100 + '%';
            
            const bridgeStyle: React.CSSProperties = {
              position: 'absolute',
              backgroundColor: 'var(--text-color)',
              opacity: 0.7,
              zIndex: 1,
            };
            
            if (isHorizontal) {
              const minX = Math.min(startIsland.col, endIsland.col);
              const maxX = Math.max(startIsland.col, endIsland.col);
              const width = ((maxX - minX) / gridSize) * 100 + '%';
              
              return (
                <div 
                  key={bridge.id}
                  style={{
                    ...bridgeStyle,
                    left: (minX / gridSize) * 100 + '%',
                    top: (startIsland.row / gridSize) * 100 + '%',
                    width,
                    height: '2px',
                    marginTop: bridge.count === 2 ? '-3px' : '0',
                  }}
                />
              );
            } else {
              const minY = Math.min(startIsland.row, endIsland.row);
              const maxY = Math.max(startIsland.row, endIsland.row);
              const height = ((maxY - minY) / gridSize) * 100 + '%';
              
              return (
                <div 
                  key={bridge.id}
                  style={{
                    ...bridgeStyle,
                    left: (startIsland.col / gridSize) * 100 + '%',
                    top: (minY / gridSize) * 100 + '%',
                    width: '2px',
                    height,
                    marginLeft: bridge.count === 2 ? '-3px' : '0',
                  }}
                />
              );
            }
          })}
          
          {/* Render islands */}
          {puzzle.islands.map((island) => {
            const gridSize = 7; // Using easy puzzle size
            const xPos = (island.col / gridSize) * 100 + '%';
            const yPos = (island.row / gridSize) * 100 + '%';
            
            return (
              <div
                key={island.id}
                className={`absolute w-8 h-8 -ml-4 -mt-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold cursor-pointer ${
                  selectedIsland?.id === island.id ? 'ring-2 ring-primary-foreground' : ''
                }`}
                style={{
                  left: xPos,
                  top: yPos,
                  zIndex: 2,
                }}
                onClick={() => handleIslandClick(island)}
              >
                {island.value}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">
          Connect islands by building bridges between them. Each island must have exactly as many bridges as its number.
        </p>
        
        <div className="flex justify-center gap-4 mt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              const newPuzzle = generatePuzzle('easy');
              setPuzzle(newPuzzle);
              setSelectedIsland(null);
            }}
          >
            New Puzzle
          </Button>
          
          <Button onClick={() => navigate('/game/easy')}>
            Play Full Game
          </Button>
        </div>
      </div>
    </div>
  );
};
