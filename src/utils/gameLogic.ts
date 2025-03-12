import { v4 as uuidv4 } from 'uuid';

export interface Island {
  id: string;
  row: number;
  col: number;
  value: number;
}

export interface Bridge {
  id: string;
  startIslandId: string;
  endIslandId: string;
  count: number;
  orientation: 'horizontal' | 'vertical';
}

export interface Puzzle {
  id: string;
  size: number;
  islands: Island[];
  bridges: Bridge[];
  difficulty: string;
  startTime?: number;
  endTime?: number;
  moveHistory: string[];
  solution?: Bridge[]; // Store the unique solution
}

const DIFFICULTY_SETTINGS = {
  easy: { size: 7, minIslands: 6, maxIslands: 8, maxValue: 4 },
  medium: { size: 8, minIslands: 8, maxIslands: 10, maxValue: 6 },
  hard: { size: 9, minIslands: 10, maxIslands: 12, maxValue: 8 },
  expert: { size: 10, minIslands: 12, maxIslands: 15, maxValue: 8 },
  master: { size: 12, minIslands: 15, maxIslands: 18, maxValue: 8 }
};

function findAllSolutions(puzzle: Puzzle): Bridge[][] {
  const solutions: Bridge[][] = [];
  const remainingBridges: Bridge[] = [];
  const currentBridges: Bridge[] = [];

  // Create all possible bridges
  puzzle.islands.forEach((island1, i) => {
    puzzle.islands.slice(i + 1).forEach((island2) => {
      if (island1.row === island2.row || island1.col === island2.col) {
        // Check if bridge would cross any islands
        const wouldCross = puzzle.islands.some(island3 => {
          if (island3.id === island1.id || island3.id === island2.id) return false;
          
          if (island1.row === island2.row) {
            return island3.row === island1.row && 
                   island3.col > Math.min(island1.col, island2.col) && 
                   island3.col < Math.max(island1.col, island2.col);
          } else {
            return island3.col === island1.col && 
                   island3.row > Math.min(island1.row, island2.row) && 
                   island3.row < Math.max(island1.row, island2.row);
          }
        });

        if (!wouldCross) {
          remainingBridges.push({
            id: `${island1.id}-${island2.id}`,
            startIslandId: island1.id,
            endIslandId: island2.id,
            count: 0,
            orientation: island1.row === island2.row ? 'horizontal' : 'vertical'
          });
        }
      }
    });
  });

  function isValidSolution(bridges: Bridge[]): boolean {
    const islandConnections = new Map<string, number>();
    
    puzzle.islands.forEach(island => {
      islandConnections.set(island.id, 0);
    });

    bridges.forEach(bridge => {
      const count = bridge.count;
      islandConnections.set(
        bridge.startIslandId, 
        (islandConnections.get(bridge.startIslandId) || 0) + count
      );
      islandConnections.set(
        bridge.endIslandId, 
        (islandConnections.get(bridge.endIslandId) || 0) + count
      );
    });

    return Array.from(islandConnections.entries()).every(
      ([islandId, count]) => {
        const island = puzzle.islands.find(i => i.id === islandId);
        return island && count === island.value;
      }
    );
  }

  function findSolutions(currentIndex: number) {
    if (currentIndex === remainingBridges.length) {
      if (isValidSolution(currentBridges)) {
        solutions.push([...currentBridges]);
      }
      return;
    }

    const bridge = remainingBridges[currentIndex];
    const maxBridges = 2;

    for (let count = 0; count <= maxBridges; count++) {
      const newBridge = { ...bridge, count };
      currentBridges.push(newBridge);
      
      const isValid = puzzle.islands.every(island => {
        const connectedBridges = currentBridges.filter(
          b => b.startIslandId === island.id || b.endIslandId === island.id
        );
        const currentConnections = connectedBridges.reduce((sum, b) => sum + b.count, 0);
        const remainingPossibleConnections = (remainingBridges.length - currentIndex - 1) * 2;
        return currentConnections <= island.value && 
               (currentConnections + remainingPossibleConnections) >= island.value;
      });

      if (isValid) {
        findSolutions(currentIndex + 1);
      }
      
      currentBridges.pop();
    }
  }

  findSolutions(0);
  return solutions;
}

function generateValidPuzzle(difficulty: string): Puzzle {
  const config = DIFFICULTY_SETTINGS[difficulty as keyof typeof DIFFICULTY_SETTINGS];
  if (!config) throw new Error('Invalid difficulty level');

  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const puzzle = generateBasicPuzzle(difficulty);
    const solutions = findAllSolutions(puzzle);

    if (solutions.length === 1) {
      return {
        ...puzzle,
        solution: solutions[0]
      };
    }

    attempts++;
  }

  throw new Error('Failed to generate a puzzle with a unique solution');
}

function generateBasicPuzzle(difficulty: string): Puzzle {
  const config = DIFFICULTY_SETTINGS[difficulty as keyof typeof DIFFICULTY_SETTINGS];
  if (!config) throw new Error('Invalid difficulty level');

  const { size, minIslands, maxIslands, maxValue } = config;
  const numIslands = Math.floor(Math.random() * (maxIslands - minIslands + 1)) + minIslands;

  const islands: Island[] = [];
  const occupiedSpots = new Set<string>();

  // Place islands
  while (islands.length < numIslands) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    const key = `${row},${col}`;

    if (!occupiedSpots.has(key)) {
      const value = Math.floor(Math.random() * (maxValue - 1)) + 1;
      islands.push({
        id: uuidv4(),
        row,
        col,
        value
      });
      occupiedSpots.add(key);
    }
  }

  return {
    id: uuidv4(),
    size,
    islands,
    bridges: [],
    difficulty,
    startTime: Date.now(),
    moveHistory: []
  };
}

export function generatePuzzle(difficulty: string): Puzzle {
  try {
    return generateValidPuzzle(difficulty);
  } catch (error) {
    console.error('Error generating puzzle:', error);
    return generateBasicPuzzle(difficulty);
  }
}

export function toggleBridge(island1: Island, island2: Island, puzzle: Puzzle): Puzzle {
  if (!canConnect(island1, island2, puzzle.islands, puzzle.bridges)) {
    return puzzle;
  }

  const existingBridgeIndex = puzzle.bridges.findIndex(
    bridge => (bridge.startIslandId === island1.id && bridge.endIslandId === island2.id) ||
              (bridge.startIslandId === island2.id && bridge.endIslandId === island1.id)
  );

  const newBridges = [...puzzle.bridges];
  
  if (existingBridgeIndex >= 0) {
    const bridge = newBridges[existingBridgeIndex];
    if (bridge.count === 2) {
      newBridges.splice(existingBridgeIndex, 1);
    } else {
      newBridges[existingBridgeIndex] = {
        ...bridge,
        count: bridge.count + 1
      };
    }
  } else {
    newBridges.push({
      id: uuidv4(),
      startIslandId: island1.id,
      endIslandId: island2.id,
      count: 1,
      orientation: island1.row === island2.row ? 'horizontal' : 'vertical'
    });
  }

  return {
    ...puzzle,
    bridges: newBridges,
    moveHistory: [...puzzle.moveHistory, `${island1.id}-${island2.id}`]
  };
}

export function canConnect(island1: Island, island2: Island, islands: Island[], bridges: Bridge[]): boolean {
  // Must be in same row or column
  if (island1.row !== island2.row && island1.col !== island2.col) {
    return false;
  }

  // Check for existing bridges reaching maximum
  const existingBridge = bridges.find(
    bridge => (bridge.startIslandId === island1.id && bridge.endIslandId === island2.id) ||
              (bridge.startIslandId === island2.id && bridge.endIslandId === island1.id)
  );
  if (existingBridge && existingBridge.count >= 2) {
    return false;
  }

  // Check for islands between proposed connection
  const isBlocked = islands.some(island => {
    if (island.id === island1.id || island.id === island2.id) return false;

    if (island1.row === island2.row) {
      return island.row === island1.row &&
             island.col > Math.min(island1.col, island2.col) &&
             island.col < Math.max(island1.col, island2.col);
    } else {
      return island.col === island1.col &&
             island.row > Math.min(island1.row, island2.row) &&
             island.row < Math.max(island1.row, island2.row);
    }
  });

  return !isBlocked;
}

export function isSolved(puzzle: Puzzle): boolean {
  // Check against stored solution if available
  if (puzzle.solution) {
    const currentBridges = new Set(
      puzzle.bridges.map(bridge => `${bridge.startIslandId}-${bridge.endIslandId}-${bridge.count}`)
    );

    const solutionBridges = new Set(
      puzzle.solution.map(bridge => `${bridge.startIslandId}-${bridge.endIslandId}-${bridge.count}`)
    );

    return (
      currentBridges.size === solutionBridges.size &&
      Array.from(currentBridges).every(bridge => solutionBridges.has(bridge))
    );
  }

  // Fallback to basic validation
  const islandConnections = new Map<string, number>();

  puzzle.islands.forEach(island => {
    islandConnections.set(island.id, 0);
  });

  puzzle.bridges.forEach(bridge => {
    islandConnections.set(
      bridge.startIslandId,
      (islandConnections.get(bridge.startIslandId) || 0) + bridge.count
    );
    islandConnections.set(
      bridge.endIslandId,
      (islandConnections.get(bridge.endIslandId) || 0) + bridge.count
    );
  });

  return Array.from(islandConnections.entries()).every(
    ([islandId, count]) => {
      const island = puzzle.islands.find(i => i.id === islandId);
      return island && count === island.value;
    }
  );
}
