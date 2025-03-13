
import { v4 as uuidv4 } from 'uuid';

export interface Island {
  id: string;
  row: number;
  col: number;
  value: number;
  connectedTo?: string[]; // Added for Island.tsx
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
  seed?: string | number; // Add the seed property
  solved?: boolean; // Add solved property
  lastPlayedTime?: number; // Add lastPlayedTime property
  lastPlayed?: number; // Add lastPlayed property
}

// Difficulty settings for puzzles
export const DIFFICULTY_SETTINGS = {
  easy: { size: 7, islandCount: 8, maxValue: 4 },
  medium: { size: 7, islandCount: 10, maxValue: 6 },
  hard: { size: 8, islandCount: 12, maxValue: 6 },
  expert: { size: 8, islandCount: 15, maxValue: 8 },
  master: { size: 9, islandCount: 18, maxValue: 8 }
};

// Generate a unique ID
export function generateId(): string {
  return uuidv4();
}

export function undoLastMove(puzzle: Puzzle): Puzzle {
  const updatedPuzzle = { ...puzzle };
  
  if (updatedPuzzle.moveHistory.length > 0) {
    // Remove the last move from history
    updatedPuzzle.moveHistory.pop();
    
    // Recreate bridges based on remaining history
    updatedPuzzle.bridges = [];
    
    // Process each move in history to rebuild bridges
    updatedPuzzle.moveHistory.forEach(move => {
      const [startId, endId] = move.split('-');
      const startIsland = updatedPuzzle.islands.find(i => i.id === startId);
      const endIsland = updatedPuzzle.islands.find(i => i.id === endId);
      
      if (startIsland && endIsland) {
        const existingBridgeIndex = updatedPuzzle.bridges.findIndex(
          b => (b.startIslandId === startId && b.endIslandId === endId) ||
               (b.startIslandId === endId && b.endIslandId === startId)
        );
        
        if (existingBridgeIndex >= 0) {
          // Increment existing bridge
          updatedPuzzle.bridges[existingBridgeIndex].count++;
        } else {
          // Create new bridge
          updatedPuzzle.bridges.push({
            id: uuidv4(),
            startIslandId: startId,
            endIslandId: endId,
            count: 1,
            orientation: startIsland.row === endIsland.row ? 'horizontal' : 'vertical'
          });
        }
      }
    });
  }
  
  // Check if puzzle is still solved after undo
  updatedPuzzle.solved = isSolved(updatedPuzzle);
  
  return updatedPuzzle;
}

// Add toggleBridge and canConnect functions
export function toggleBridge(startIsland: Island, endIsland: Island, puzzle: Puzzle): Puzzle {
  const updatedPuzzle = { ...puzzle };
  
  // Create the move identifier
  const moveId = `${startIsland.id}-${endIsland.id}`;
  
  // Check if islands are in the same row or column
  const sameRow = startIsland.row === endIsland.row;
  const sameCol = startIsland.col === endIsland.col;
  
  if (!sameRow && !sameCol) {
    return puzzle; // Cannot connect diagonally
  }
  
  // Check for existing bridge between these islands
  const existingBridgeIndex = updatedPuzzle.bridges.findIndex(
    bridge => (bridge.startIslandId === startIsland.id && bridge.endIslandId === endIsland.id) ||
              (bridge.startIslandId === endIsland.id && bridge.endIslandId === startIsland.id)
  );
  
  if (existingBridgeIndex >= 0) {
    // Bridge exists, toggle its count (1->2->0)
    const bridge = updatedPuzzle.bridges[existingBridgeIndex];
    
    if (bridge.count === 1) {
      // Upgrade to double bridge
      bridge.count = 2;
      updatedPuzzle.moveHistory.push(moveId);
    } else {
      // Remove the bridge
      updatedPuzzle.bridges.splice(existingBridgeIndex, 1);
      
      // Remove the last two moves that created this double bridge
      const moveIndexes = updatedPuzzle.moveHistory
        .map((move, index) => move === moveId ? index : -1)
        .filter(index => index !== -1);
      
      if (moveIndexes.length >= 2) {
        // Remove the last two occurrences of this move
        updatedPuzzle.moveHistory.splice(moveIndexes[moveIndexes.length - 1], 1);
        updatedPuzzle.moveHistory.splice(moveIndexes[moveIndexes.length - 2], 1);
      }
    }
  } else {
    // Create new bridge
    updatedPuzzle.bridges.push({
      id: uuidv4(),
      startIslandId: startIsland.id,
      endIslandId: endIsland.id,
      count: 1,
      orientation: sameRow ? 'horizontal' : 'vertical'
    });
    
    // Add to move history
    updatedPuzzle.moveHistory.push(moveId);
  }
  
  // Check if puzzle is now solved
  updatedPuzzle.solved = isSolved(updatedPuzzle);
  
  return updatedPuzzle;
}

export function canConnect(island1: Island, island2: Island, islands: Island[], bridges: Bridge[]): boolean {
  // Can only connect if they're in the same row or column
  if (island1.row !== island2.row && island1.col !== island2.col) {
    return false;
  }
  
  // Check if there's a direct path between islands
  if (island1.row === island2.row) {
    // Horizontal check
    const row = island1.row;
    const minCol = Math.min(island1.col, island2.col);
    const maxCol = Math.max(island1.col, island2.col);
    
    // Check if there are islands in between
    const hasIslandBetween = islands.some(island => 
      island.id !== island1.id && 
      island.id !== island2.id &&
      island.row === row && 
      island.col > minCol && 
      island.col < maxCol
    );
    
    if (hasIslandBetween) {
      return false;
    }
  } else {
    // Vertical check
    const col = island1.col;
    const minRow = Math.min(island1.row, island2.row);
    const maxRow = Math.max(island1.row, island2.row);
    
    // Check if there are islands in between
    const hasIslandBetween = islands.some(island => 
      island.id !== island1.id && 
      island.id !== island2.id &&
      island.col === col && 
      island.row > minRow && 
      island.row < maxRow
    );
    
    if (hasIslandBetween) {
      return false;
    }
  }
  
  return true;
}

export function generatePuzzle(difficulty: string, seed?: string | number): Puzzle {
  // Generate a basic puzzle structure
  const settings = DIFFICULTY_SETTINGS[difficulty as keyof typeof DIFFICULTY_SETTINGS] || DIFFICULTY_SETTINGS.easy;
  
  const puzzle: Puzzle = {
    id: uuidv4(),
    size: settings.size,
    islands: [],
    bridges: [],
    difficulty,
    moveHistory: [],
    startTime: Date.now(),
    seed: seed || Date.now()
  };
  
  // Add a simple pattern of islands for testing
  for (let i = 0; i < settings.islandCount; i++) {
    const row = Math.floor(i / 3) * 2;
    const col = (i % 3) * 2;
    
    if (row < settings.size && col < settings.size) {
      puzzle.islands.push({
        id: uuidv4(),
        row,
        col,
        value: Math.min(1 + Math.floor(Math.random() * 3), settings.maxValue)
      });
    }
  }
  
  return puzzle;
}

export function isSolved(puzzle: Puzzle): boolean {
  // Check if all islands have the correct number of connections
  for (const island of puzzle.islands) {
    // Count bridges connected to this island
    let connectionCount = 0;
    
    for (const bridge of puzzle.bridges) {
      if (bridge.startIslandId === island.id || bridge.endIslandId === island.id) {
        connectionCount += bridge.count;
      }
    }
    
    // Island's value must match its connection count
    if (connectionCount !== island.value) {
      return false;
    }
  }
  
  // All islands properly connected, now check if the graph is fully connected
  if (puzzle.islands.length === 0) return true;
  
  // Simple BFS to check connectivity
  const visited = new Set<string>();
  const queue: string[] = [puzzle.islands[0].id];
  
  while (queue.length > 0) {
    const islandId = queue.shift()!;
    visited.add(islandId);
    
    // Find all bridges connected to this island
    for (const bridge of puzzle.bridges) {
      if (bridge.startIslandId === islandId) {
        if (!visited.has(bridge.endIslandId)) {
          queue.push(bridge.endIslandId);
        }
      } else if (bridge.endIslandId === islandId) {
        if (!visited.has(bridge.startIslandId)) {
          queue.push(bridge.startIslandId);
        }
      }
    }
  }
  
  // If all islands are visited, the graph is connected
  return visited.size === puzzle.islands.length;
}
