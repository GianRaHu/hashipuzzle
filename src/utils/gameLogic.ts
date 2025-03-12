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

// Add the Move type to track game history
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
  seed?: number;  // Added seed for reproducible puzzles
  moveHistory: Move[];  // Add move history to track moves
};

// ... (keep existing helper functions) ...

// Add the undo function
export const undoLastMove = (puzzle: Puzzle): Puzzle => {
  if (!puzzle.moveHistory?.length) {
    return puzzle; // No moves to undo
  }

  const newPuzzle = { ...puzzle };
  const lastMove = newPuzzle.moveHistory[newPuzzle.moveHistory.length - 1];
  
  // Find the islands involved in the last move
  const startIsland = getIslandById(newPuzzle.islands, lastMove.startIslandId);
  const endIsland = getIslandById(newPuzzle.islands, lastMove.endIslandId);

  if (!startIsland || !endIsland) {
    return puzzle; // Invalid state, return unchanged
  }

  // Find the bridge to modify/remove
  const bridgeIndex = newPuzzle.bridges.findIndex(
    b => (b.startIslandId === lastMove.startIslandId && b.endIslandId === lastMove.endIslandId) ||
         (b.startIslandId === lastMove.endIslandId && b.endIslandId === lastMove.startIslandId)
  );

  // Update bridge state based on the previous state
  if (lastMove.previousBridgeCount === 0) {
    // Remove the bridge completely
    newPuzzle.bridges = newPuzzle.bridges.filter((_, index) => index !== bridgeIndex);
    
    // Remove connections between islands
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
    // Restore previous bridge count
    newPuzzle.bridges[bridgeIndex] = {
      ...newPuzzle.bridges[bridgeIndex],
      count: lastMove.previousBridgeCount as 1 | 2
    };

    // Update island connections accordingly
    if (lastMove.previousBridgeCount === 1) {
      newPuzzle.islands = newPuzzle.islands.map(island => {
        if (island.id === startIsland.id || island.id === endIsland.id) {
          const otherIslandId = island.id === startIsland.id ? endIsland.id : startIsland.id;
          return {
            ...island,
            connectedTo: [...new Set([...island.connectedTo, otherIslandId])]
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
  
  // If puzzle was solved but now isn't, clear the end time
  if (!newPuzzle.solved && puzzle.solved) {
    newPuzzle.endTime = undefined;
  }

  return newPuzzle;
};

// Modify the toggleBridge function to track moves
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
  
  // Record the move before making changes
  const move: Move = {
    startIslandId: island1.id,
    endIslandId: island2.id,
    previousBridgeCount: existingBridgeIndex === -1 ? 0 : newPuzzle.bridges[existingBridgeIndex].count,
    timestamp: Date.now()
  };

  // Initialize moveHistory if it doesn't exist
  if (!newPuzzle.moveHistory) {
    newPuzzle.moveHistory = [];
  }

  // Add move to history
  newPuzzle.moveHistory = [...newPuzzle.moveHistory, move];
  
  // ... (rest of the existing toggleBridge implementation) ...
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
  newPuzzle.solved = checkPuzzleSolved(newPuzzle);
  
  // If solved, set the end time
  if (newPuzzle.solved && !puzzle.solved) {
    newPuzzle.endTime = Date.now();
  }
  
  return newPuzzle;
};
