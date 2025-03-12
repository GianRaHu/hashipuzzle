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

export type Move = {
  startIslandId: string;
  endIslandId: string;
  previousBridgeCount: number;
  timestamp: number;
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
  seed?: number;
  moveHistory: Move[];
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

// Check if the puzzle is solved
export const checkPuzzleSolved = (puzzle: Puzzle): boolean => {
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

// Toggle a bridge between two islands
export const toggleBridge = (island1: Island, island2: Island, puzzle: Puzzle): Puzzle => {
  if (!canConnect(island1, island2, puzzle.islands, puzzle.bridges)) {
    return puzzle;
  }
  
  const newPuzzle = { ...puzzle };
  
  // Initialize moveHistory if it doesn't exist
  if (!newPuzzle.moveHistory) {
    newPuzzle.moveHistory = [];
  }
  
  // Find existing bridge if any
  const existingBridgeIndex = newPuzzle.bridges.findIndex(
    b => (b.startIslandId === island1.id && b.endIslandId === island2.id) || 
         (b.startIslandId === island2.id && b.endIslandId === island1.id)
  );

  // Record the move before making changes
  const prevBridgeCount = existingBridgeIndex === -1 ? 0 : newPuzzle.bridges[existingBridgeIndex].count;
  const move: Move = {
    startIslandId: island1.id,
    endIslandId: island2.id,
    previousBridgeCount: prevBridgeCount,
    timestamp: Date.now()
  };
  
  // Add move to history
  newPuzzle.moveHistory.push(move);
  
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
    
    // Add connections
    newPuzzle.islands = newPuzzle.islands.map(island => {
      if (island.id === island1.id || island.id === island2.id) {
        const otherIslandId = island.id === island1.id ? island2.id : island1.id;
        return {
          ...island,
          connectedTo: [...island.connectedTo, otherIslandId]
        };
      }
      return island;
    });
  } else if (newPuzzle.bridges[existingBridgeIndex].count === 1) {
    // Upgrade to double bridge
    newPuzzle.bridges[existingBridgeIndex].count = 2;
    
    // Add second connection
    newPuzzle.islands = newPuzzle.islands.map(island => {
      if (island.id === island1.id || island.id === island2.id) {
        const otherIslandId = island.id === island1.id ? island2.id : island1.id;
        return {
          ...island,
          connectedTo: [...island.connectedTo, otherIslandId]
        };
      }
      return island;
    });
  } else {
    // Remove bridge completely
    newPuzzle.bridges = newPuzzle.bridges.filter((_, index) => index !== existingBridgeIndex);
    
    // Remove all connections
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
  
  // Update puzzle solved state
  newPuzzle.solved = checkPuzzleSolved(newPuzzle);
  if (newPuzzle.solved && !puzzle.solved) {
    newPuzzle.endTime = Date.now();
  }
  
  return newPuzzle;
};

// Undo the last move
export const undoLastMove = (puzzle: Puzzle): Puzzle => {
  if (!puzzle.moveHistory?.length) {
    return puzzle;
  }

  const newPuzzle = { ...puzzle };
  const lastMove = newPuzzle.moveHistory[newPuzzle.moveHistory.length - 1];
  
  // Find the islands involved
  const startIsland = getIslandById(newPuzzle.islands, lastMove.startIslandId);
  const endIsland = getIslandById(newPuzzle.islands, lastMove.endIslandId);

  if (!startIsland || !endIsland) {
    return puzzle;
  }

  // Find the current bridge
  const bridgeIndex = newPuzzle.bridges.findIndex(
    b => (b.startIslandId === lastMove.startIslandId && b.endIslandId === lastMove.endIslandId) ||
         (b.startIslandId === lastMove.endIslandId && b.endIslandId === lastMove.startIslandId)
  );

  // Current bridge count (0 if no bridge exists)
  const currentBridgeCount = bridgeIndex === -1 ? 0 : newPuzzle.bridges[bridgeIndex].count;

  if (bridgeIndex !== -1) {
    if (lastMove.previousBridgeCount === 0) {
      // Remove the bridge that was added
      newPuzzle.bridges = newPuzzle.bridges.filter((_, index) => index !== bridgeIndex);
      
      // Remove all connections
      newPuzzle.islands = newPuzzle.islands.map(island => {
        if (island.id === startIsland.id || island.id === endIsland.id) {
          return {
            ...island,
            connectedTo: island.connectedTo.filter(id => 
              id !== (island.id === startIsland.id ? endIsland.id : startIsland.id)
            )
          };
        }
        return island;
      });
    } else {
      // Restore to previous count
      newPuzzle.bridges[bridgeIndex] = {
        ...newPuzzle.bridges[bridgeIndex],
        count: lastMove.previousBridgeCount
      };
      
      // Update connections based on previous count
      newPuzzle.islands = newPuzzle.islands.map(island => {
        if (island.id === startIsland.id || island.id === endIsland.id) {
          const otherIslandId = island.id === startIsland.id ? endIsland.id : startIsland.id;
          const currentConnections = island.connectedTo.filter(id => id !== otherIslandId);
          const connectionsToAdd = Array(lastMove.previousBridgeCount).fill(otherIslandId);
          return {
            ...island,
            connectedTo: [...currentConnections, ...connectionsToAdd]
          };
        }
        return island;
      });
    }
  }

  // Remove the last move from history
  newPuzzle.moveHistory = newPuzzle.moveHistory.slice(0, -1);
  
  // Update puzzle solved state
  newPuzzle.solved = checkPuzzleSolved(newPuzzle);
  if (!newPuzzle.solved && puzzle.solved) {
    newPuzzle.endTime = undefined;
  }

  return newPuzzle;
};
