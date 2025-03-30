// Generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Island type
export interface Island {
  id: string;
  row: number;
  col: number;
  value: number;
  connectedTo?: string[];
}

// Bridge type
export interface Bridge {
  id: string;
  startIslandId: string;
  endIslandId: string;
  count: 1 | 2;
  orientation: 'horizontal' | 'vertical';
}

// Grid size type
export interface GridSize {
  width: number;
  height: number;
}

// Puzzle type
export interface Puzzle {
  id: string;
  difficulty: string;
  size: GridSize;
  islands: Island[];
  bridges: Bridge[];
  solved: boolean;
  startTime?: number;
  endTime?: number;
  seed?: number;
  requiresAdvancedTactics?: boolean;
}

// Check if two islands can be connected with a bridge
export const canConnect = (
  island1: Island,
  island2: Island,
  islands: Island[],
  bridges: Bridge[]
): boolean => {
  // Can only connect in same row or column
  if (island1.row !== island2.row && island1.col !== island2.col) {
    return false;
  }
  
  // Check for islands or bridges in between
  if (island1.row === island2.row) {
    // Horizontal check
    const row = island1.row;
    const startCol = Math.min(island1.col, island2.col);
    const endCol = Math.max(island1.col, island2.col);
    
    // Check for islands in between
    for (const island of islands) {
      if (island.row === row && 
          island.col > startCol && 
          island.col < endCol && 
          island.id !== island1.id && 
          island.id !== island2.id) {
        return false;
      }
    }
    
    // Check for crossing bridges
    for (const bridge of bridges) {
      if (bridge.orientation === 'vertical') {
        const bridgeStart = getIslandById(islands, bridge.startIslandId);
        const bridgeEnd = getIslandById(islands, bridge.endIslandId);
        
        if (bridgeStart && bridgeEnd) {
          const bridgeCol = bridgeStart.col;
          const bridgeStartRow = Math.min(bridgeStart.row, bridgeEnd.row);
          const bridgeEndRow = Math.max(bridgeStart.row, bridgeEnd.row);
          
          if (bridgeCol > startCol && bridgeCol < endCol && 
              row > bridgeStartRow && row < bridgeEndRow) {
            return false;
          }
        }
      }
    }
  } else {
    // Vertical check
    const col = island1.col;
    const startRow = Math.min(island1.row, island2.row);
    const endRow = Math.max(island1.row, island2.row);
    
    // Check for islands in between
    for (const island of islands) {
      if (island.col === col && 
          island.row > startRow && 
          island.row < endRow && 
          island.id !== island1.id && 
          island.id !== island2.id) {
        return false;
      }
    }
    
    // Check for crossing bridges
    for (const bridge of bridges) {
      if (bridge.orientation === 'horizontal') {
        const bridgeStart = getIslandById(islands, bridge.startIslandId);
        const bridgeEnd = getIslandById(islands, bridge.endIslandId);
        
        if (bridgeStart && bridgeEnd) {
          const bridgeRow = bridgeStart.row;
          const bridgeStartCol = Math.min(bridgeStart.col, bridgeEnd.col);
          const bridgeEndCol = Math.max(bridgeStart.col, bridgeEnd.col);
          
          if (bridgeRow > startRow && bridgeRow < endRow && 
              col > bridgeStartCol && col < bridgeEndCol) {
            return false;
          }
        }
      }
    }
  }
  
  return true;
};

// Toggle a bridge between two islands
export const toggleBridge = (
  island1: Island,
  island2: Island,
  puzzle: Puzzle
): Puzzle => {
  // Check if islands are already connected
  const existingBridge = getBridgeBetweenIslands(island1, island2, puzzle.bridges);
  
  if (existingBridge) {
    // Remove existing bridge
    const updatedBridges = puzzle.bridges.filter(bridge => bridge.id !== existingBridge.id);
    
    // Update island values
    island1.value -= existingBridge.count;
    island2.value -= existingBridge.count;
    
    return {
      ...puzzle,
      bridges: updatedBridges,
      islands: puzzle.islands.map(island => {
        if (island.id === island1.id) {
          return { ...island, value: island1.value };
        } else if (island.id === island2.id) {
          return { ...island, value: island2.value };
        }
        return island;
      })
    };
  } else {
    // Create a new bridge
    if (island1.value < 8 && island2.value < 8) {
      const newBridge: Bridge = {
        id: generateId(),
        startIslandId: island1.id,
        endIslandId: island2.id,
        count: 1,
        orientation: island1.row === island2.row ? 'horizontal' : 'vertical'
      };
      
      // Update island values
      island1.value += 1;
      island2.value += 1;
      
      return {
        ...puzzle,
        bridges: [...puzzle.bridges, newBridge],
        islands: puzzle.islands.map(island => {
          if (island.id === island1.id) {
            return { ...island, value: island1.value };
          } else if (island.id === island2.id) {
            return { ...island, value: island2.value };
          }
          return island;
        })
      };
    }
  }
  
  return puzzle;
};

// Get an island by its ID
export const getIslandById = (islands: Island[], id: string): Island | undefined => {
  return islands.find(island => island.id === id);
};

// Get a bridge between two islands, if it exists
export const getBridgeBetweenIslands = (island1: Island, island2: Island, bridges: Bridge[]): Bridge | undefined => {
  return bridges.find(bridge => 
    (bridge.startIslandId === island1.id && bridge.endIslandId === island2.id) ||
    (bridge.startIslandId === island2.id && bridge.endIslandId === island1.id)
  );
};

// Check if the puzzle is solved
export const checkPuzzleSolved = (puzzle: Puzzle): boolean => {
  for (const island of puzzle.islands) {
    if (island.value !== 8) {
      // Get the number of bridges connected to this island
      let connectedBridges = 0;
      for (const bridge of puzzle.bridges) {
        if (bridge.startIslandId === island.id || bridge.endIslandId === island.id) {
          connectedBridges += bridge.count;
        }
      }
      
      if (connectedBridges !== island.value) {
        return false;
      }
    }
  }
  
  return true;
};
