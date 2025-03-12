export interface Island {
  id: string;
  row: number;
  col: number;
  value: number;
  connectedTo: string[]; // Island IDs this island is connected to
}

export interface Bridge {
  id: string;
  startIslandId: string;
  endIslandId: string;
  count: 1 | 2; // Single or double bridge
  orientation: 'horizontal' | 'vertical';
}

export interface Puzzle {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master' | 'custom'; // Added 'custom'
  size: number; // The puzzle size (used for square puzzles)
  width?: number; // Optional width for rectangular puzzles
  height?: number; // Optional height for rectangular puzzles
  islands: Island[];
  bridges: Bridge[];
  solved: boolean;
  startTime: number;
  endTime?: number;
  seed?: number;
}

// Helper function to generate a unique ID for islands and bridges
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Check if two islands can be connected
export const canConnect = (
  island1: Island,
  island2: Island,
  islands: Island[],
  bridges: Bridge[]
): boolean => {
  if (island1.id === island2.id) {
    return false;
  }

  if (island1.row !== island2.row && island1.col !== island2.col) {
    return false;
  }

  const existingBridges = bridges.filter(
    (bridge) =>
      (bridge.startIslandId === island1.id && bridge.endIslandId === island2.id) ||
      (bridge.startIslandId === island2.id && bridge.endIslandId === island1.id)
  );

  if (existingBridges.length >= 2) {
    return false;
  }

  if (!isPathClear(island1, island2, islands, bridges)) {
    return false;
  }

  return true;
};

// Toggle a bridge between two islands (add if not present, remove if present)
export const toggleBridge = (
  island1: Island,
  island2: Island,
  puzzle: Puzzle
): Puzzle => {
  const existingBridge = puzzle.bridges.find(
    (bridge) =>
      (bridge.startIslandId === island1.id && bridge.endIslandId === island2.id) ||
      (bridge.startIslandId === island2.id && bridge.endIslandId === island1.id)
  );

  if (existingBridge) {
    // Remove bridge
    const updatedBridges = puzzle.bridges.filter((bridge) => bridge.id !== existingBridge.id);
    const bridgeCountToRemove = existingBridge.count;

    const updatedIslands = puzzle.islands.map((island) => {
      if (island.id === island1.id || island.id === island2.id) {
        return {
          ...island,
          value: island.value - bridgeCountToRemove,
          connectedTo: island.connectedTo.filter(id => id !== island2.id && id !== island1.id)
        };
      }
      return island;
    });

    return {
      ...puzzle,
      islands: updatedIslands,
      bridges: updatedBridges
    };
  } else {
    // Add bridge
    if (island1.value < 8 && island2.value < 8) {
      const newBridge: Bridge = {
        id: generateId(),
        startIslandId: island1.id,
        endIslandId: island2.id,
        count: 1,
        orientation: island1.row === island2.row ? 'horizontal' : 'vertical',
      };

      const updatedIslands = puzzle.islands.map((island) => {
        if (island.id === island1.id || island.id === island2.id) {
          return {
            ...island,
            value: island.value + 1,
            connectedTo: [...island.connectedTo, island1.id === island.id ? island2.id : island1.id]
          };
        }
        return island;
      });

      return {
        ...puzzle,
        islands: updatedIslands,
        bridges: [...puzzle.bridges, newBridge]
      };
    }
  }

  return puzzle;
};

// Check if a path between two islands is clear of other islands and bridges
const isPathClear = (
  island1: Island,
  island2: Island,
  islands: Island[],
  bridges: Bridge[]
): boolean => {
  if (island1.row !== island2.row && island1.col !== island2.col) {
    return false;
  }

  if (island1.row === island2.row) {
    // Horizontal check
    const row = island1.row;
    const minCol = Math.min(island1.col, island2.col);
    const maxCol = Math.max(island1.col, island2.col);

    for (let col = minCol + 1; col < maxCol; col++) {
      if (islands.some((island) => island.row === row && island.col === col)) {
        return false;
      }
      if (bridges.some(bridge =>
        (bridge.startIslandId === island1.id || bridge.endIslandId === island1.id) &&
        (bridge.startIslandId === island2.id || bridge.endIslandId === island2.id)
      )) {
        return false;
      }
    }
  } else {
    // Vertical check
    const col = island1.col;
    const minRow = Math.min(island1.row, island2.row);
    const maxRow = Math.max(island1.row, island2.row);

    for (let row = minRow + 1; row < maxRow; row++) {
      if (islands.some((island) => island.col === col && island.row === row)) {
        return false;
      }
      if (bridges.some(bridge =>
        (bridge.startIslandId === island1.id || bridge.endIslandId === island1.id) &&
        (bridge.startIslandId === island2.id || bridge.endIslandId === island2.id)
      )) {
        return false;
      }
    }
  }

  return true;
};

// Get an island by its ID
export const getIslandById = (islands: Island[], islandId: string): Island | undefined => {
  return islands.find((island) => island.id === islandId);
};

// Check if the puzzle is solved
export const checkPuzzleSolved = (puzzle: Puzzle): boolean => {
  // Check if all islands have the correct number of bridges
  const allIslandsCorrect = puzzle.islands.every(island => {
    const connectedBridges = puzzle.bridges.filter(bridge =>
      bridge.startIslandId === island.id || bridge.endIslandId === island.id
    );
    const totalBridges = connectedBridges.reduce((sum, bridge) => sum + bridge.count, 0);
    return totalBridges === island.value;
  });

  if (!allIslandsCorrect) {
    return false;
  }

  // Check if all islands are connected (basic connectivity check)
  if (puzzle.islands.length === 0) {
    return true; // Consider an empty puzzle solved
  }

  const visited = new Set<string>();
  const stack: string[] = [puzzle.islands[0].id]; // Start from the first island

  while (stack.length > 0) {
    const islandId = stack.pop()!;
    if (visited.has(islandId)) {
      continue;
    }
    visited.add(islandId);

    const island = puzzle.islands.find(i => i.id === islandId)!;
    const connectedIslands = puzzle.bridges
      .filter(bridge => bridge.startIslandId === islandId || bridge.endIslandId === islandId)
      .map(bridge => (bridge.startIslandId === islandId ? bridge.endIslandId : bridge.startIslandId));

    connectedIslands.forEach(connectedIslandId => {
      if (!visited.has(connectedIslandId)) {
        stack.push(connectedIslandId);
      }
    });
  }

  // If all islands were visited, the puzzle is connected
  return visited.size === puzzle.islands.length;
};
