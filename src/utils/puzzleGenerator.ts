
import { Island, Puzzle, Bridge, generateId } from './gameLogic';

// Difficulty settings
const difficultySettings = {
  easy: { size: 7, islandCount: 8, maxValue: 4 },
  medium: { size: 7, islandCount: 10, maxValue: 6 },
  hard: { size: 8, islandCount: 12, maxValue: 6 },
  expert: { size: 8, islandCount: 15, maxValue: 8 },
  master: { size: 9, islandCount: 18, maxValue: 8 }
};

// Seeded random number generator
const seededRandom = (seed: number) => {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
};

// Check if a position is valid for a new island
const isValidPosition = (
  row: number, 
  col: number, 
  grid: (Island | null)[][], 
  gridSize: number,
  bridgeGrid: number[][]
): boolean => {
  // Check if position is within grid
  if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
    return false;
  }
  
  // Check if position is already occupied by an island
  if (grid[row][col] !== null) {
    return false;
  }
  
  // Check if position is occupied by a bridge
  if (bridgeGrid[row][col] !== 0) {
    return false;
  }
  
  return true;
};

// Find possible connection targets for a given island
const findPossibleTargets = (
  island: Island,
  grid: (Island | null)[][],
  bridgeGrid: number[][],
  gridSize: number
): Island[] => {
  const targets: Island[] = [];
  const { row, col } = island;
  
  // Check right
  for (let c = col + 1; c < gridSize; c++) {
    if (bridgeGrid[row][c] < 0) break; // Path blocked by a bridge
    if (grid[row][c]) {
      targets.push(grid[row][c]!);
      break;
    }
  }
  
  // Check left
  for (let c = col - 1; c >= 0; c--) {
    if (bridgeGrid[row][c] < 0) break; // Path blocked by a bridge
    if (grid[row][c]) {
      targets.push(grid[row][c]!);
      break;
    }
  }
  
  // Check down
  for (let r = row + 1; r < gridSize; r++) {
    if (bridgeGrid[r][col] < 0) break; // Path blocked by a bridge
    if (grid[r][col]) {
      targets.push(grid[r][col]!);
      break;
    }
  }
  
  // Check up
  for (let r = row - 1; r >= 0; r--) {
    if (bridgeGrid[r][col] < 0) break; // Path blocked by a bridge
    if (grid[r][col]) {
      targets.push(grid[r][col]!);
      break;
    }
  }
  
  return targets;
};

// Mark the path between two islands as used by bridges
const markPath = (
  island1: Island,
  island2: Island,
  bridgeGrid: number[][],
  count: number = 1
): void => {
  if (island1.row === island2.row) {
    // Horizontal bridge
    const r = island1.row;
    const minCol = Math.min(island1.col, island2.col);
    const maxCol = Math.max(island1.col, island2.col);
    
    for (let c = minCol + 1; c < maxCol; c++) {
      // Use negative values to mark bridge paths
      // -1 for horizontal, -2 for vertical
      bridgeGrid[r][c] = -1;
    }
  } else {
    // Vertical bridge
    const c = island1.col;
    const minRow = Math.min(island1.row, island2.row);
    const maxRow = Math.max(island1.row, island2.row);
    
    for (let r = minRow + 1; r < maxRow; r++) {
      // Use negative values to mark bridge paths
      bridgeGrid[r][c] = -2;
    }
  }
};

// Generate a new puzzle with optional seed
export const generatePuzzle = (
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master', 
  seed?: number
): Puzzle => {
  const { size, islandCount, maxValue } = difficultySettings[difficulty];
  
  // Use provided seed or generate a random one
  const puzzleSeed = seed || Math.floor(Math.random() * 1000000);
  const random = seededRandom(puzzleSeed);
  
  // Create empty grid for islands
  const grid: (Island | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
  
  // Create grid to track bridge positions
  // 0 = empty, -1 = horizontal bridge, -2 = vertical bridge, positive = island value
  const bridgeGrid: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
  
  const islands: Island[] = [];
  const bridges: Bridge[] = [];
  
  // Step 1: Place first island randomly
  let startRow = Math.floor(random() * size);
  let startCol = Math.floor(random() * size);
  
  const firstIsland: Island = {
    id: generateId(),
    row: startRow,
    col: startCol,
    value: 0, // Will be incremented as bridges are added
    connectedTo: []
  };
  
  islands.push(firstIsland);
  grid[startRow][startCol] = firstIsland;
  bridgeGrid[startRow][startCol] = 1;
  
  // Step 2: Build the puzzle by adding islands and connecting them
  const connectedIslands = new Set<string>([firstIsland.id]);
  
  while (islands.length < islandCount) {
    // Get a random connected island to branch from
    const connectedArray = Array.from(connectedIslands);
    const sourceIsland = islands.find(
      island => island.id === connectedArray[Math.floor(random() * connectedArray.length)]
    )!;
    
    // Try to place a new island that can connect to the source island
    let placed = false;
    
    // Try each direction (randomize order)
    const directions = [
      [0, 1],  // right
      [1, 0],  // down
      [0, -1], // left
      [-1, 0]  // up
    ].sort(() => random() - 0.5);
    
    for (const [dr, dc] of directions) {
      if (placed) break;
      
      // Find the furthest valid position in this direction
      let distance = 1;
      let validPositions = [];
      
      while (true) {
        const newRow = sourceIsland.row + dr * distance;
        const newCol = sourceIsland.col + dc * distance;
        
        // Check if position is out of bounds
        if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) {
          break;
        }
        
        // Check if we hit another island
        if (grid[newRow][newCol] !== null) {
          break;
        }
        
        // Check if position is valid for a new island
        if (isValidPosition(newRow, newCol, grid, size, bridgeGrid)) {
          validPositions.push({ row: newRow, col: newCol, distance });
        }
        
        // If this position has a bridge, we can't go further
        if (bridgeGrid[newRow][newCol] !== 0) {
          break;
        }
        
        distance++;
      }
      
      if (validPositions.length > 0) {
        // Choose a random valid position, preferring those further away
        const { row, col } = validPositions[Math.floor(random() * validPositions.length)];
        
        // Create new island
        const newIsland: Island = {
          id: generateId(),
          row, 
          col,
          value: 0,
          connectedTo: []
        };
        
        // Determine bridge count (1 or 2)
        const bridgeCount = random() < 0.3 ? 2 : 1;
        
        // Create bridge
        const bridge: Bridge = {
          id: generateId(),
          startIslandId: sourceIsland.id,
          endIslandId: newIsland.id,
          count: bridgeCount as 1 | 2,
          orientation: dr === 0 ? 'horizontal' : 'vertical'
        };
        
        // Add new island and bridge
        islands.push(newIsland);
        bridges.push(bridge);
        
        // Update grid
        grid[row][col] = newIsland;
        bridgeGrid[row][col] = 1;
        
        // Mark path as used by bridges
        markPath(sourceIsland, newIsland, bridgeGrid);
        
        // Update island values
        sourceIsland.value += bridgeCount;
        newIsland.value += bridgeCount;
        
        // Add to connected islands
        connectedIslands.add(newIsland.id);
        
        placed = true;
      }
    }
    
    // If we couldn't place a new island, try connecting existing islands
    if (!placed && islands.length > 1) {
      let connected = false;
      
      // Try to connect random pairs of existing islands
      for (let attempts = 0; attempts < 10 && !connected; attempts++) {
        const island1 = islands[Math.floor(random() * islands.length)];
        const possibleTargets = findPossibleTargets(island1, grid, bridgeGrid, size);
        
        if (possibleTargets.length > 0) {
          const island2 = possibleTargets[Math.floor(random() * possibleTargets.length)];
          
          // Check if adding more bridges would exceed maxValue
          if (island1.value >= maxValue || island2.value >= maxValue) {
            continue;
          }
          
          // Determine bridge count (1 or 2)
          const existingBridge = bridges.find(
            b => (b.startIslandId === island1.id && b.endIslandId === island2.id) || 
                 (b.startIslandId === island2.id && b.endIslandId === island1.id)
          );
          
          if (existingBridge) {
            if (existingBridge.count === 2 || island1.value >= maxValue - 1 || island2.value >= maxValue - 1) {
              continue;
            }
            
            // Upgrade to double bridge
            existingBridge.count = 2;
            island1.value += 1;
            island2.value += 1;
            connected = true;
          } else {
            const bridgeCount = (island1.value < maxValue - 1 && island2.value < maxValue - 1 && random() < 0.3) ? 2 : 1;
            
            // Create new bridge
            const bridge: Bridge = {
              id: generateId(),
              startIslandId: island1.id,
              endIslandId: island2.id,
              count: bridgeCount as 1 | 2,
              orientation: island1.row === island2.row ? 'horizontal' : 'vertical'
            };
            
            bridges.push(bridge);
            
            // Mark path as used by bridges
            markPath(island1, island2, bridgeGrid);
            
            // Update island values
            island1.value += bridgeCount;
            island2.value += bridgeCount;
            connected = true;
          }
        }
      }
      
      // If we still couldn't connect, just place a new random island
      if (!connected) {
        let maxAttempts = 100;
        while (maxAttempts > 0) {
          const row = Math.floor(random() * size);
          const col = Math.floor(random() * size);
          
          if (isValidPosition(row, col, grid, size, bridgeGrid)) {
            const newIsland: Island = {
              id: generateId(),
              row, 
              col,
              value: 0,
              connectedTo: []
            };
            
            islands.push(newIsland);
            grid[row][col] = newIsland;
            bridgeGrid[row][col] = 1;
            break;
          }
          
          maxAttempts--;
        }
      }
    }
    
    // If we've tried everything and can't add more islands, break out
    if (islands.length === islandCount || islands.length === size * size) {
      break;
    }
  }
  
  // Reset connectedTo arrays for gameplay
  islands.forEach(island => {
    island.connectedTo = [];
  });
  
  // Create the actual game puzzle with no bridges initially
  return {
    id: generateId(),
    difficulty,
    size,
    islands,
    bridges: [],
    solved: false,
    startTime: Date.now(),
    seed: puzzleSeed
  };
};

// Generate a daily challenge
export const generateDailyChallenge = (date: Date = new Date()): Puzzle => {
  // Use the date as seed to generate a consistent puzzle for the day
  const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  
  // Simple deterministic seed from date string
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed = ((seed << 5) - seed) + dateString.charCodeAt(i);
    seed = seed & seed;  // Convert to 32bit integer
  }
  
  // Use seed to determine difficulty
  const difficulties: ('easy' | 'medium' | 'hard' | 'expert' | 'master')[] = ['easy', 'medium', 'hard', 'expert', 'master'];
  const difficultyIndex = Math.abs(seed) % 5;
  const difficulty = difficulties[difficultyIndex];
  
  // Generate puzzle with selected difficulty and seed
  const puzzle = generatePuzzle(difficulty, Math.abs(seed));
  puzzle.id = `daily-${dateString}`;
  
  return puzzle;
};
