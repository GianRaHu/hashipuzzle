
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
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master';
  size: number;
  islands: Island[];
  bridges: Bridge[];
  solved: boolean;
  startTime?: number;
  endTime?: number;
  seed?: number;  // Added seed for reproducible puzzles
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
    
    // Update island connections - add one connection for each island
    const updatedIslands = newPuzzle.islands.map(island => {
      if (island.id === island1.id) {
        return {
          ...island,
          connectedTo: [...island.connectedTo, island2.id]
        };
      } else if (island.id === island2.id) {
        return {
          ...island,
          connectedTo: [...island.connectedTo, island1.id]
        };
      }
      return island;
    });
    
    newPuzzle.islands = updatedIslands;
  } else {
    const bridge = newPuzzle.bridges[existingBridgeIndex];
    
    if (bridge.count === 1) {
      // Upgrade to double bridge
      newPuzzle.bridges[existingBridgeIndex] = {
        ...bridge,
        count: 2
      };
      
      // Update island connections - add another connection for each island
      const updatedIslands = newPuzzle.islands.map(island => {
        if (island.id === island1.id) {
          return {
            ...island,
            connectedTo: [...island.connectedTo, island2.id]
          };
        } else if (island.id === island2.id) {
          return {
            ...island,
            connectedTo: [...island.connectedTo, island1.id]
          };
        }
        return island;
      });
      
      newPuzzle.islands = updatedIslands;
    } else {
      // Remove bridge completely
      newPuzzle.bridges = newPuzzle.bridges.filter((_, index) => index !== existingBridgeIndex);
      
      // Update island connections - remove ALL connections between these islands
      const updatedIslands = newPuzzle.islands.map(island => {
        if (island.id === island1.id) {
          return {
            ...island,
            connectedTo: island.connectedTo.filter(id => id !== island2.id)
          };
        } else if (island.id === island2.id) {
          return {
            ...island,
            connectedTo: island.connectedTo.filter(id => id !== island1.id)
          };
        }
        return island;
      });
      
      newPuzzle.islands = updatedIslands;
    }
  }
  
  // Check if puzzle is solved
  newPuzzle.solved = checkPuzzleSolved(newPuzzle);
  
  // If solved, set the end time
  if (newPuzzle.solved && !puzzle.solved) {
    newPuzzle.endTime = Date.now();
  }
  
  return newPuzzle;
};

// Check if the puzzle is solved
export const checkPuzzleSolved = (puzzle: Puzzle): boolean => {
  // A puzzle is solved when all islands have exactly the correct number of connections
  return puzzle.islands.every(island => {
    // Calculate the current number of bridges connected to this island
    const connections = countIslandConnections(island, puzzle.bridges);
    return connections === island.value;
  });
};

// Count the actual number of bridges connected to an island
export const countIslandConnections = (island: Island, bridges: Bridge[]): number => {
  return bridges.reduce((count, bridge) => {
    if (bridge.startIslandId === island.id || bridge.endIslandId === island.id) {
      return count + bridge.count;
    }
    return count;
  }, 0);
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
