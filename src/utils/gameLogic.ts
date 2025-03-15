import { v4 as uuidv4 } from 'uuid';

export interface Island {
  id: string;
  row: number;
  col: number;
  value: number;
  connectedTo?: string[]; // Make this optional for backward compatibility
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
  difficulty?: string;
  startTime?: number;
  endTime?: number;
  moveHistory: string[];
  solved?: boolean;
  seed?: number;
  lastPlayed?: number;      // Add missing property
  lastPlayedTime?: number;  // Add missing property
  solution?: Bridge[];      // Add missing property
}

interface PuzzleConfig {
  size: number;
  minIslands: number;
  maxIslands: number;
  maxValue: number;
}

const DIFFICULTY_SETTINGS: Record<string, PuzzleConfig> = {
  easy: { size: 7, minIslands: 6, maxIslands: 8, maxValue: 4 },
  medium: { size: 8, minIslands: 8, maxIslands: 10, maxValue: 6 },
  hard: { size: 9, minIslands: 10, maxIslands: 12, maxValue: 8 },
  expert: { size: 10, minIslands: 12, maxIslands: 15, maxValue: 8 },
  master: { size: 12, minIslands: 15, maxIslands: 18, maxValue: 8 }
};

export function generatePuzzle(difficulty: string): Puzzle {
  const config = DIFFICULTY_SETTINGS[difficulty];
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

export function generatePuzzleWithSeed(seed: string): Puzzle {
  // Create a deterministic random number generator using the seed
  const seedHash = Array.from(seed).reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);

  let currentSeed = seedHash;
  const random = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  const size = Math.floor(random() * 4) + 7;
  const numIslands = Math.floor(random() * (size * 2)) + size;

  const islands: Island[] = [];
  const occupiedSpots = new Set<string>();

  while (islands.length < numIslands) {
    const row = Math.floor(random() * size);
    const col = Math.floor(random() * size);
    const key = `${row},${col}`;

    if (!occupiedSpots.has(key)) {
      const value = Math.floor(random() * 7) + 1;
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
    startTime: Date.now(),
    moveHistory: []
  };
}

export function canConnect(island1: Island, island2: Island, islands: Island[]): boolean {
  if (island1.row !== island2.row && island1.col !== island2.col) {
    return false;
  }

  // Check for islands between the two points
  const isHorizontal = island1.row === island2.row;
  const start = isHorizontal ? 
    Math.min(island1.col, island2.col) : 
    Math.min(island1.row, island2.row);
  const end = isHorizontal ? 
    Math.max(island1.col, island2.col) : 
    Math.max(island1.row, island2.row);

  return !islands.some(island => {
    if (island.id === island1.id || island.id === island2.id) return false;
    
    if (isHorizontal) {
      return island.row === island1.row && 
             island.col > start && 
             island.col < end;
    } else {
      return island.col === island1.col && 
             island.row > start && 
             island.row < end;
    }
  });
}

export function toggleBridge(island1: Island, island2: Island, puzzle: Puzzle): Puzzle {
  if (!canConnect(island1, island2, puzzle.islands)) {
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

  const updatedPuzzle = {
    ...puzzle,
    bridges: newBridges,
    moveHistory: [...puzzle.moveHistory, `${island1.id}-${island2.id}`]
  };
  
  // Check if puzzle is solved after this move
  updatedPuzzle.solved = isSolved(updatedPuzzle);
  
  return updatedPuzzle;
}

export function isSolved(puzzle: Puzzle): boolean {
  const connections = new Map<string, number>();
  
  puzzle.islands.forEach(island => {
    connections.set(island.id, 0);
  });

  puzzle.bridges.forEach(bridge => {
    connections.set(
      bridge.startIslandId,
      (connections.get(bridge.startIslandId) || 0) + bridge.count
    );
    connections.set(
      bridge.endIslandId,
      (connections.get(bridge.endIslandId) || 0) + bridge.count
    );
  });

  return Array.from(connections.entries()).every(([islandId, count]) => {
    const island = puzzle.islands.find(i => i.id === islandId);
    return island && count === island.value;
  });
}

export function undoLastMove(puzzle: Puzzle): Puzzle {
  if (!puzzle.moveHistory.length) return puzzle;
  
  const updatedPuzzle = {...puzzle};
  updatedPuzzle.moveHistory.pop();
  return {
    ...updatedPuzzle,
    solved: false
  };
}

// Add helper function that was missing in puzzleGenerator.ts
export function generateId(): string {
  return uuidv4();
}
