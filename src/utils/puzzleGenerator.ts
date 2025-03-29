
import { Island, Puzzle, Bridge, generateId } from './gameLogic';

// Difficulty settings - defines parameters for each difficulty level
const difficultySettings = {
  easy: { size: 7, islandCount: 8, maxValue: 4, advancedTactics: false },
  medium: { size: 7, islandCount: 11, maxValue: 6, advancedTactics: false },
  hard: { size: 8, islandCount: 15, maxValue: 8, advancedTactics: true },
  expert: { size: 9, islandCount: 18, maxValue: 8, advancedTactics: true }
};

// Seeded random number generator for reproducible puzzles
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
  bridgeMap: Map<string, boolean>
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
  const key = `${row},${col}`;
  if (bridgeMap.has(key)) {
    return false;
  }
  
  return true;
};

// Mark path between islands as used by bridges
const markPath = (
  island1: Island,
  island2: Island,
  bridgeMap: Map<string, boolean>
): void => {
  if (island1.row === island2.row) {
    // Horizontal bridge
    const r = island1.row;
    const minCol = Math.min(island1.col, island2.col);
    const maxCol = Math.max(island1.col, island2.col);
    
    for (let c = minCol + 1; c < maxCol; c++) {
      bridgeMap.set(`${r},${c}`, true);
    }
  } else {
    // Vertical bridge
    const c = island1.col;
    const minRow = Math.min(island1.row, island2.row);
    const maxRow = Math.max(island1.row, island2.row);
    
    for (let r = minRow + 1; r < maxRow; r++) {
      bridgeMap.set(`${r},${c}`, true);
    }
  }
};

// Check if a path between islands is clear
const isPathClear = (
  island1: Island,
  island2: Island,
  islands: Island[],
  bridgeMap: Map<string, boolean>
): boolean => {
  // Can only connect if they're in the same row or column
  if (island1.row !== island2.row && island1.col !== island2.col) {
    return false;
  }
  
  if (island1.row === island2.row) {
    // Horizontal check
    const r = island1.row;
    const minCol = Math.min(island1.col, island2.col);
    const maxCol = Math.max(island1.col, island2.col);
    
    // Check for islands in between
    const hasIslandBetween = islands.some(island => 
      island.row === r && island.col > minCol && island.col < maxCol
    );
    
    if (hasIslandBetween) {
      return false;
    }
    
    // Check for bridges in between
    for (let c = minCol + 1; c < maxCol; c++) {
      if (bridgeMap.has(`${r},${c}`)) {
        return false;
      }
    }
  } else {
    // Vertical check
    const c = island1.col;
    const minRow = Math.min(island1.row, island2.row);
    const maxRow = Math.max(island1.row, island2.row);
    
    // Check for islands in between
    const hasIslandBetween = islands.some(island => 
      island.col === c && island.row > minRow && island.row < maxRow
    );
    
    if (hasIslandBetween) {
      return false;
    }
    
    // Check for bridges in between
    for (let r = minRow + 1; r < maxRow; r++) {
      if (bridgeMap.has(`${r},${c}`)) {
        return false;
      }
    }
  }
  
  return true;
};

// Find possible islands to connect to
const findConnectableIslands = (
  targetIsland: Island,
  islands: Island[],
  bridgeMap: Map<string, boolean>,
  maxValue: number
): Island[] => {
  return islands.filter(island => 
    island.id !== targetIsland.id && 
    island.value < maxValue && 
    targetIsland.value < maxValue &&
    isPathClear(targetIsland, island, islands, bridgeMap)
  );
};

// Create complex island connections that might require logical deduction
const createAdvancedTacticsConnection = (
  islands: Island[],
  bridges: { startIslandId: string, endIslandId: string, count: 1 | 2, orientation: 'horizontal' | 'vertical' }[],
  grid: (Island | null)[][],
  bridgeMap: Map<string, boolean>,
  random: () => number,
  maxValue: number
): boolean => {
  // Find islands that could be part of a logical deduction chain
  const candidateIslands = islands.filter(island => island.value < maxValue - 1);
  if (candidateIslands.length < 3) return false;
  
  // Pick a chain of islands that will require logical deduction
  const startIsland = candidateIslands[Math.floor(random() * candidateIslands.length)];
  
  // Find islands that can connect to our start island
  const connectable = findConnectableIslands(startIsland, islands, bridgeMap, maxValue);
  if (connectable.length < 2) return false;
  
  // Pick two islands to connect to our start island
  const island1 = connectable[Math.floor(random() * connectable.length)];
  
  // Remove the first selected island and choose another
  const otherConnectable = connectable.filter(i => i.id !== island1.id);
  if (otherConnectable.length === 0) return false;
  
  const island2 = otherConnectable[Math.floor(random() * otherConnectable.length)];
  
  // Create a situation where the only solution requires deduction:
  // - Connect start island to both island1 and island2 with a single bridge each
  // - Make either island1 or island2 have a value that forces connection to the start island
  
  // Connect start island to island1
  bridges.push({
    startIslandId: startIsland.id,
    endIslandId: island1.id,
    count: 1,
    orientation: startIsland.row === island1.row ? 'horizontal' : 'vertical'
  });
  
  startIsland.value += 1;
  island1.value += 1;
  markPath(startIsland, island1, bridgeMap);
  
  // Connect start island to island2
  bridges.push({
    startIslandId: startIsland.id,
    endIslandId: island2.id,
    count: 1,
    orientation: startIsland.row === island2.row ? 'horizontal' : 'vertical'
  });
  
  startIsland.value += 1;
  island2.value += 1;
  markPath(startIsland, island2, bridgeMap);
  
  // Make one of the islands require an additional connection
  if (random() < 0.5 && island1.value < maxValue - 1) {
    island1.value += 1;
  } else if (island2.value < maxValue - 1) {
    island2.value += 1;
  }
  
  return true;
}

// Create a new puzzle using a step-by-step approach
export const generatePuzzle = (
  difficulty: 'easy' | 'medium' | 'hard' | 'expert', 
  seed?: number,
  customOptions?: {
    gridSize?: number,
    advancedTactics?: boolean
  }
): Puzzle => {
  console.log(`Generating puzzle with difficulty: ${difficulty}`);
  
  // Start with default settings for the difficulty
  let { size, islandCount, maxValue, advancedTactics } = difficultySettings[difficulty];
  
  // Apply custom options if provided
  if (customOptions) {
    if (customOptions.gridSize) {
      size = customOptions.gridSize;
      // Adjust island count based on grid size
      islandCount = Math.max(Math.floor(size * size * 0.25), islandCount);
    }
    
    if (customOptions.advancedTactics !== undefined) {
      advancedTactics = customOptions.advancedTactics;
    }
  }
  
  console.log(`Grid size: ${size}, Advanced tactics: ${advancedTactics}`);
  
  // Use provided seed or generate a random one
  const puzzleSeed = seed || Math.floor(Math.random() * 1000000);
  console.log(`Using seed: ${puzzleSeed}`);
  const random = seededRandom(puzzleSeed);
  
  // Create empty grid for islands
  const grid: (Island | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
  
  // Use a Map for bridge tracking (faster lookups)
  const bridgeMap = new Map<string, boolean>();
  
  const islands: Island[] = [];
  const bridgeConnections: {
    startIslandId: string;
    endIslandId: string;
    count: 1 | 2;
    orientation: 'horizontal' | 'vertical';
  }[] = [];
  
  // Step 1: Place first island
  let attempts = 0;
  let maxAttempts = 100;
  let success = false;
  
  while (attempts < maxAttempts && !success) {
    attempts++;
    
    // Clear previous state
    grid.forEach(row => row.fill(null));
    bridgeMap.clear();
    islands.length = 0;
    bridgeConnections.length = 0;
    
    // Place first island in a somewhat central position
    const centerOffset = Math.floor(size / 3);
    const startRow = Math.floor(random() * centerOffset) + centerOffset;
    const startCol = Math.floor(random() * centerOffset) + centerOffset;
    
    const firstIsland: Island = {
      id: generateId(),
      row: startRow,
      col: startCol,
      value: 0,
      connectedTo: []
    };
    
    islands.push(firstIsland);
    grid[startRow][startCol] = firstIsland;
    
    // Step 2: Add more islands and connect them
    while (islands.length < islandCount) {
      // 1. Select a random position for a new island
      let placed = false;
      let positionAttempts = 0;
      const maxPositionAttempts = 50;
      
      while (!placed && positionAttempts < maxPositionAttempts) {
        positionAttempts++;
        
        const row = Math.floor(random() * size);
        const col = Math.floor(random() * size);
        
        if (isValidPosition(row, col, grid, size, bridgeMap)) {
          const newIsland: Island = {
            id: generateId(),
            row,
            col,
            value: 0, 
            connectedTo: []
          };
          
          // 2. Try to connect new island to existing island(s)
          let connected = false;
          
          // Try to connect to existing islands
          for (const existingIsland of islands) {
            if (isPathClear(newIsland, existingIsland, islands, bridgeMap)) {
              // Can connect to this island
              const bridgeCount = Math.random() < 0.3 ? 2 : 1;
              
              // Create connection
              bridgeConnections.push({
                startIslandId: existingIsland.id,
                endIslandId: newIsland.id,
                count: bridgeCount as 1 | 2,
                orientation: newIsland.row === existingIsland.row ? 'horizontal' : 'vertical'
              });
              
              // Update island values
              existingIsland.value += bridgeCount;
              newIsland.value += bridgeCount;
              
              // Mark path as used
              markPath(existingIsland, newIsland, bridgeMap);
              
              connected = true;
              break;
            }
          }
          
          if (connected) {
            // Successfully placed and connected the island
            islands.push(newIsland);
            grid[row][col] = newIsland;
            placed = true;
          }
        }
      }
      
      // If we couldn't place a new island, try connecting existing islands more
      if (!placed) {
        let madeConnection = false;
        
        // Randomly try to add more connections between existing islands
        for (let i = 0; i < islands.length && !madeConnection; i++) {
          const island = islands[i];
          
          // Find islands that can be connected to this one
          const connectableIslands = findConnectableIslands(island, islands, bridgeMap, maxValue);
          
          if (connectableIslands.length > 0) {
            // Choose a random island to connect to
            const targetIsland = connectableIslands[Math.floor(random() * connectableIslands.length)];
            
            // Determine bridge count
            const bridgeCount = Math.random() < 0.3 ? 2 : 1;
            
            // Check if there's already a bridge between these islands
            const existingConnectionIndex = bridgeConnections.findIndex(
              conn => (conn.startIslandId === island.id && conn.endIslandId === targetIsland.id) ||
                      (conn.startIslandId === targetIsland.id && conn.endIslandId === island.id)
            );
            
            if (existingConnectionIndex !== -1) {
              // Already has a bridge, ensure we don't exceed max
              const existingConnection = bridgeConnections[existingConnectionIndex];
              if (existingConnection.count === 1 && 
                  island.value < maxValue && 
                  targetIsland.value < maxValue) {
                // Upgrade to double bridge
                existingConnection.count = 2;
                island.value += 1;
                targetIsland.value += 1;
                madeConnection = true;
              }
            } else {
              // Create new bridge
              bridgeConnections.push({
                startIslandId: island.id,
                endIslandId: targetIsland.id,
                count: bridgeCount as 1 | 2,
                orientation: island.row === targetIsland.row ? 'horizontal' : 'vertical'
              });
              
              // Update island values
              island.value += bridgeCount;
              targetIsland.value += bridgeCount;
              
              // Mark path as used
              markPath(island, targetIsland, bridgeMap);
              
              madeConnection = true;
            }
          }
        }
        
        // If we still couldn't make a connection, we're done with this puzzle attempt
        if (!madeConnection) {
          break;
        }
      }
      
      // If we've reached the target island count, we're done
      if (islands.length >= islandCount) {
        success = true;
        
        // For advanced tactics, create some logical deduction situations
        if (advancedTactics && islands.length > 5) {
          // Create 1-3 advanced tactics situations depending on grid size
          const numAdvancedSituations = Math.min(3, Math.floor(size / 4));
          
          for (let i = 0; i < numAdvancedSituations; i++) {
            createAdvancedTacticsConnection(islands, bridgeConnections, grid, bridgeMap, random, maxValue);
          }
        }
        
        break;
      }
    }
  }
  
  // If we couldn't generate a valid puzzle, just return a simple one
  if (!success) {
    console.log("Failed to generate ideal puzzle, creating a simple fallback");
    // Create a fallback puzzle with reduced complexity
    const reducedDifficulty = {
      size: Math.max(5, size - 2),
      islandCount: Math.max(4, islandCount - 4),
      maxValue: Math.max(3, maxValue - 2)
    };
    
    // Create a simple grid pattern
    const grid = Array(reducedDifficulty.size).fill(null).map(() => Array(reducedDifficulty.size).fill(null));
    const islands: Island[] = [];
    const bridgeConnections: any[] = [];
    
    // Add islands in a pattern
    for (let i = 0; i < reducedDifficulty.islandCount; i++) {
      const row = Math.floor(i / 3) * 2;
      const col = (i % 3) * 2;
      
      if (row < reducedDifficulty.size && col < reducedDifficulty.size) {
        const island: Island = {
          id: generateId(),
          row,
          col,
          value: 0,
          connectedTo: []
        };
        islands.push(island);
        grid[row][col] = island;
      }
    }
    
    // Connect adjacent islands
    for (let i = 0; i < islands.length; i++) {
      for (let j = i + 1; j < islands.length; j++) {
        const island1 = islands[i];
        const island2 = islands[j];
        
        if ((island1.row === island2.row && Math.abs(island1.col - island2.col) === 2) ||
            (island1.col === island2.col && Math.abs(island1.row - island2.row) === 2)) {
          
          const bridgeCount = (Math.random() < 0.3 && island1.value < 2 && island2.value < 2) ? 2 : 1;
          
          bridgeConnections.push({
            startIslandId: island1.id,
            endIslandId: island2.id,
            count: bridgeCount as 1 | 2,
            orientation: island1.row === island2.row ? 'horizontal' : 'vertical'
          });
          
          island1.value += bridgeCount;
          island2.value += bridgeCount;
        }
      }
    }
  }
  
  // Convert bridge connections to actual Bridge objects
  const bridges: Bridge[] = bridgeConnections.map(conn => ({
    id: generateId(),
    ...conn
  }));
  
  // Create the puzzle
  return {
    id: generateId(),
    difficulty,
    size,
    islands,
    bridges: [], // Start with no bridges for gameplay
    solved: false,
    startTime: Date.now(),
    seed: puzzleSeed,
    requiresAdvancedTactics: advancedTactics
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
  const difficulties: ('easy' | 'medium' | 'hard' | 'expert')[] = ['easy', 'medium', 'hard', 'expert'];
  const difficultyIndex = Math.abs(seed) % 4;
  const difficulty = difficulties[difficultyIndex];
  
  // Generate puzzle with selected difficulty and seed
  const puzzle = generatePuzzle(difficulty, Math.abs(seed));
  puzzle.id = `daily-${dateString}`;
  
  return puzzle;
};
