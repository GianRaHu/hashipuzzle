
// Types for our game
export type Island = {
  id: string;
  row: number;
  col: number;
  value: number;
  connectedTo: string[];
};

export type Bridge = {
  id: string;
  startIslandId: string;
  endIslandId: string;
  count: 1 | 2;  // 1 or 2 bridges
  orientation: 'horizontal' | 'vertical';
};

export type Puzzle = {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  size: {
    rows: number;
    cols: number;
  };
  islands: Island[];
  bridges: Bridge[];
  solved: boolean;
  startTime?: number;
  endTime?: number;
  seed?: number;
  requiresAdvancedTactics?: boolean;
  allIslandsConnected?: boolean;
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Check if two islands can be connected
export const canConnect = (island1: Island, island2: Island, islands: Island[], bridges: Bridge[]): boolean => {
  // Can only connect if they're in the same row or column
  if (island1.row !== island2.row && island1.col !== island2.col) {
    return false;
  }
  
  // Check if already connected with 2 bridges (maximum)
  const existingBridge = bridges.find(
    b => (b.startIslandId === island1.id && b.endIslandId === island2.id) || 
         (b.startIslandId === island2.id && b.endIslandId === island1.id)
  );
  
  if (existingBridge && existingBridge.count === 2) {
    return false;
  }
  
  // Check if path is clear (no islands in between)
  if (island1.row === island2.row) {
    // Horizontal check
    const minCol = Math.min(island1.col, island2.col);
    const maxCol = Math.max(island1.col, island2.col);
    
    return !islands.some(island => 
      island.row === island1.row && 
      island.col > minCol && 
      island.col < maxCol
    );
  } else {
    // Vertical check
    const minRow = Math.min(island1.row, island2.row);
    const maxRow = Math.max(island1.row, island2.row);
    
    return !islands.some(island => 
      island.col === island1.col && 
      island.row > minRow && 
      island.row < maxRow
    );
  }
};

// Toggle a bridge between two islands
export const toggleBridge = (island1: Island, island2: Island, puzzle: Puzzle): Puzzle => {
  if (!canConnect(island1, island2, puzzle.islands, puzzle.bridges)) {
    return puzzle;
  }
  
  const newPuzzle = { ...puzzle };
  
  // Find existing bridge if any
  const existingBridgeIndex = newPuzzle.bridges.findIndex(
    b => (b.startIslandId === island1.id && b.endIslandId === island2.id) || 
         (b.startIslandId === island2.id && b.endIslandId === island1.id)
  );
  
  if (existingBridgeIndex === -1) {
    // Create new bridge
    const newBridge: Bridge = {
      id: generateId(),
      startIslandId: island1.id,
      endIslandId: island2.id,
      count: 1,
      orientation: island1.row === island2.row ? 'horizontal' : 'vertical'
    };
    
    newPuzzle.bridges.push(newBridge);
    
    // Update island connections
    newPuzzle.islands = newPuzzle.islands.map(island => {
      if (island.id === island1.id || island.id === island2.id) {
        return {
          ...island,
          connectedTo: [...island.connectedTo, island.id === island1.id ? island2.id : island1.id]
        };
      }
      return island;
    });
  } else {
    const bridge = newPuzzle.bridges[existingBridgeIndex];
    
    if (bridge.count === 1) {
      // Upgrade to double bridge
      newPuzzle.bridges[existingBridgeIndex] = {
        ...bridge,
        count: 2
      };
      
      // Add another connection
      newPuzzle.islands = newPuzzle.islands.map(island => {
        if (island.id === island1.id || island.id === island2.id) {
          return {
            ...island,
            connectedTo: [...island.connectedTo, island.id === island1.id ? island2.id : island1.id]
          };
        }
        return island;
      });
    } else {
      // Remove bridge completely
      newPuzzle.bridges = newPuzzle.bridges.filter((_, index) => index !== existingBridgeIndex);
      
      // Remove all connections between these islands
      newPuzzle.islands = newPuzzle.islands.map(island => {
        if (island.id === island1.id || island.id === island2.id) {
          return {
            ...island,
            connectedTo: island.connectedTo.filter(id => 
              id !== (island.id === island1.id ? island2.id : island1.id)
            )
          };
        }
        return island;
      });
    }
  }
  
  // Check if puzzle is solved
  const correctConnections = checkAllIslandsHaveCorrectConnections(newPuzzle);
  const allConnected = checkAllIslandsConnected(newPuzzle.islands);
  
  newPuzzle.allIslandsConnected = allConnected;
  newPuzzle.solved = correctConnections && allConnected;
  
  // If solved, set the end time
  if (newPuzzle.solved && !puzzle.solved) {
    newPuzzle.endTime = Date.now();
  }
  
  return newPuzzle;
};

// Check if all islands have the correct number of connections
export const checkAllIslandsHaveCorrectConnections = (puzzle: Puzzle): boolean => {
  return puzzle.islands.every(island => {
    const connections = puzzle.bridges.reduce((count, bridge) => {
      if (bridge.startIslandId === island.id || bridge.endIslandId === island.id) {
        return count + bridge.count;
      }
      return count;
    }, 0);
    
    return connections === island.value;
  });
};

// Check if all islands are connected to each other (one connected component)
export const checkAllIslandsConnected = (islands: Island[]): boolean => {
  if (islands.length === 0) return true;
  
  const visited = new Set<string>();
  const queue: string[] = [islands[0].id];
  visited.add(islands[0].id);
  
  while (queue.length > 0) {
    const currentIslandId = queue.shift()!;
    const currentIsland = islands.find(island => island.id === currentIslandId);
    
    if (currentIsland) {
      for (const connectedIslandId of currentIsland.connectedTo) {
        if (!visited.has(connectedIslandId)) {
          visited.add(connectedIslandId);
          queue.push(connectedIslandId);
        }
      }
    }
  }
  
  return visited.size === islands.length;
};

// Check if the puzzle is solved
export const checkPuzzleSolved = (puzzle: Puzzle): boolean => {
  const correctConnections = checkAllIslandsHaveCorrectConnections(puzzle);
  const allConnected = checkAllIslandsConnected(puzzle.islands);
  
  return correctConnections && allConnected;
};

// Helper to get an island by id
export const getIslandById = (islands: Island[], id: string): Island | undefined => {
  return islands.find(island => island.id === id);
};

// Helper to get bridge between two islands
export const getBridgeBetweenIslands = (bridges: Bridge[], island1Id: string, island2Id: string): Bridge | undefined => {
  return bridges.find(
    b => (b.startIslandId === island1Id && b.endIslandId === island2Id) || 
         (b.startIslandId === island2Id && b.endIslandId === island1Id)
  );
};
