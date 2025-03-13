import { Island, Puzzle, Bridge } from './gameLogic';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate IDs
export const generateId = () => uuidv4();

// Generate a puzzle with custom parameters
export const generateCustomPuzzle = (
  seed: number,
  gridSize: number,
  islandCount: number
): Puzzle => {
  console.log(`Generating custom puzzle with seed: ${seed}, size: ${gridSize}, islands: ${islandCount}`);
  
  // Default values for safety
  const safeSeed = seed || Math.floor(Math.random() * 1000000);
  const safeGridSize = Math.min(Math.max(5, gridSize), 12); // Between 5 and 12
  const safeIslandCount = Math.min(Math.max(5, islandCount), safeGridSize * 2); // Reasonable number of islands
  
  // Seeded random number generator
  const seededRandom = () => {
    let s = safeSeed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  };
  
  const random = seededRandom();
  
  // Create grid matrix for island placement
  const grid: (Island | null)[][] = Array(safeGridSize).fill(null).map(() => Array(safeGridSize).fill(null));
  
  // Track bridge paths
  const bridgeMap = new Map<string, boolean>();
  
  const islands: Island[] = [];
  const bridgeConnections: {
    startIslandId: string;
    endIslandId: string;
    count: 1 | 2;
    orientation: 'horizontal' | 'vertical';
  }[] = [];
  
  // Place first island near center
  const centerOffset = Math.floor(safeGridSize / 3);
  const startRow = Math.floor(random() * centerOffset) + centerOffset;
  const startCol = Math.floor(random() * centerOffset) + centerOffset;
  
  const firstIsland: Island = {
    id: generateId(),
    row: startRow,
    col: startCol,
    value: 0
  };
  
  islands.push(firstIsland);
  grid[startRow][startCol] = firstIsland;
  
  // ... keep existing code
  
  // Create and return the puzzle
  return {
    id: `custom-${safeSeed}`,
    difficulty: 'custom',
    size: safeGridSize,
    islands,
    bridges: [], // Start with no bridges for gameplay
    moveHistory: [],
    startTime: Date.now(),
    seed: safeSeed
  };
};
