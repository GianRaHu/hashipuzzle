
import { Island, Puzzle, Bridge, generateId } from './gameLogic';

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
    value: 0,
    connectedTo: []
  };
  
  islands.push(firstIsland);
  grid[startRow][startCol] = firstIsland;
  
  // Function to check if position is valid for island placement
  const isValidPosition = (row: number, col: number): boolean => {
    // Check if within grid
    if (row < 0 || row >= safeGridSize || col < 0 || col >= safeGridSize) {
      return false;
    }
    
    // Check if already occupied
    if (grid[row][col] !== null) {
      return false;
    }
    
    // Check if occupied by bridge
    if (bridgeMap.has(`${row},${col}`)) {
      return false;
    }
    
    return true;
  };
  
  // Function to mark path between islands as used
  const markPath = (island1: Island, island2: Island): void => {
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
  
  // Function to check if path is clear
  const isPathClear = (island1: Island, island2: Island): boolean => {
    // Can only connect in same row or column
    if (island1.row !== island2.row && island1.col !== island2.col) {
      return false;
    }
    
    if (island1.row === island2.row) {
      // Horizontal check
      const r = island1.row;
      const minCol = Math.min(island1.col, island2.col);
      const maxCol = Math.max(island1.col, island2.col);
      
      // Check for islands in between
      for (let c = minCol + 1; c < maxCol; c++) {
        if (grid[r][c] !== null) {
          return false;
        }
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
      for (let r = minRow + 1; r < maxRow; r++) {
        if (grid[r][c] !== null) {
          return false;
        }
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
  
  // Try to add remaining islands and connect them
  let attempts = 0;
  let maxAttempts = 1000;
  
  while (islands.length < safeIslandCount && attempts < maxAttempts) {
    attempts++;
    
    // Try to place new island
    const row = Math.floor(random() * safeGridSize);
    const col = Math.floor(random() * safeGridSize);
    
    if (isValidPosition(row, col)) {
      // Find if we can connect to any existing island
      let connectedTo = null;
      
      for (const existingIsland of islands) {
        if (isPathClear(existingIsland, { row, col, id: '', value: 0, connectedTo: [] })) {
          connectedTo = existingIsland;
          break;
        }
      }
      
      if (connectedTo) {
        // Create new island and connect
        const newIsland: Island = {
          id: generateId(),
          row,
          col,
          value: 0,
          connectedTo: []
        };
        
        // Determine bridge count (1 or 2)
        const bridgeCount = Math.random() < 0.3 ? 2 : 1;
        
        // Add bridge connection
        bridgeConnections.push({
          startIslandId: connectedTo.id,
          endIslandId: newIsland.id,
          count: bridgeCount as 1 | 2,
          orientation: row === connectedTo.row ? 'horizontal' : 'vertical'
        });
        
        // Update island values
        connectedTo.value += bridgeCount;
        newIsland.value += bridgeCount;
        
        // Mark path as used
        markPath(connectedTo, newIsland);
        
        // Add new island
        islands.push(newIsland);
        grid[row][col] = newIsland;
      }
    }
  }
  
  // Add additional connections between existing islands
  for (let i = 0; i < safeIslandCount; i++) {
    // Try to add more connections
    for (let j = 0; j < islands.length; j++) {
      for (let k = j + 1; k < islands.length; k++) {
        const island1 = islands[j];
        const island2 = islands[k];
        
        if (island1 !== island2 && isPathClear(island1, island2)) {
          // Determine if we should add a bridge
          if (Math.random() < 0.3) {
            // Determine bridge count
            const bridgeCount = Math.random() < 0.3 ? 2 : 1;
            
            // Add bridge connection
            bridgeConnections.push({
              startIslandId: island1.id,
              endIslandId: island2.id,
              count: bridgeCount as 1 | 2,
              orientation: island1.row === island2.row ? 'horizontal' : 'vertical'
            });
            
            // Update island values
            island1.value += bridgeCount;
            island2.value += bridgeCount;
            
            // Mark path as used
            markPath(island1, island2);
          }
        }
      }
    }
  }
  
  // Convert bridge connections to Bridge objects
  const bridges: Bridge[] = bridgeConnections.map(conn => ({
    id: generateId(),
    ...conn
  }));
  
  // Create and return the puzzle
  return {
    id: `custom-${safeSeed}`,
    difficulty: 'custom',
    size: safeGridSize,
    islands,
    bridges: [], // Start with no bridges for gameplay
    solved: false,
    startTime: Date.now(),
    seed: safeSeed
  };
};
