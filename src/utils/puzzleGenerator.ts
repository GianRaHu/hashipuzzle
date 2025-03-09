import { Island, Puzzle, Bridge, generateId, canConnect } from './gameLogic';

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

// Generate a new puzzle with optional seed
export const generatePuzzle = (
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master', 
  seed?: number
): Puzzle => {
  const { size, islandCount, maxValue } = difficultySettings[difficulty];
  
  // Use provided seed or generate a random one
  const puzzleSeed = seed || Math.floor(Math.random() * 1000000);
  const random = seededRandom(puzzleSeed);
  
  // Create empty grid
  const grid: (Island | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
  
  // Place islands using seeded random
  const islands: Island[] = [];
  
  while (islands.length < islandCount) {
    const row = Math.floor(random() * size);
    const col = Math.floor(random() * size);
    
    // Skip if position already has an island
    if (grid[row][col]) continue;
    
    const island: Island = {
      id: generateId(),
      row,
      col,
      value: 0, // Will be set later
      connectedTo: []
    };
    
    islands.push(island);
    grid[row][col] = island;
  }
  
  // Connect islands to form a valid puzzle
  const bridges: Bridge[] = [];
  const remainingIslands = [...islands];
  
  // Start with a random island
  const usedIslands = [remainingIslands.pop()!];
  
  // Connect all islands to ensure the puzzle is connected
  while (remainingIslands.length > 0) {
    let connected = false;
    const nextIsland = remainingIslands[remainingIslands.length - 1];
    
    // Try to connect this island to any used island
    for (const usedIsland of usedIslands) {
      if (canConnect(nextIsland, usedIsland, islands, bridges)) {
        const bridgeCount = random() < 0.3 ? 2 : 1;
        
        const bridge: Bridge = {
          id: generateId(),
          startIslandId: usedIsland.id,
          endIslandId: nextIsland.id,
          count: bridgeCount as 1 | 2,
          orientation: usedIsland.row === nextIsland.row ? 'horizontal' : 'vertical'
        };
        
        bridges.push(bridge);
        
        // Update connections
        usedIsland.connectedTo.push(nextIsland.id);
        nextIsland.connectedTo.push(usedIsland.id);
        
        if (bridgeCount === 2) {
          usedIsland.connectedTo.push(nextIsland.id);
          nextIsland.connectedTo.push(usedIsland.id);
        }
        
        connected = true;
        break;
      }
    }
    
    // If we couldn't connect, try another island
    if (!connected) {
      // Move this island to the end and try again later
      remainingIslands.unshift(remainingIslands.pop()!);
      continue;
    }
    
    // Add to used islands
    usedIslands.push(remainingIslands.pop()!);
  }
  
  // Add some additional bridges randomly to make the puzzle more complex
  for (let i = 0; i < islandCount / 2; i++) {
    const island1 = islands[Math.floor(random() * islands.length)];
    const island2 = islands[Math.floor(random() * islands.length)];
    
    if (island1.id !== island2.id && canConnect(island1, island2, islands, bridges)) {
      const existingBridge = bridges.find(
        b => (b.startIslandId === island1.id && b.endIslandId === island2.id) || 
             (b.startIslandId === island2.id && b.endIslandId === island1.id)
      );
      
      if (!existingBridge) {
        const bridgeCount = random() < 0.3 ? 2 : 1;
        
        const bridge: Bridge = {
          id: generateId(),
          startIslandId: island1.id,
          endIslandId: island2.id,
          count: bridgeCount as 1 | 2,
          orientation: island1.row === island2.row ? 'horizontal' : 'vertical'
        };
        
        bridges.push(bridge);
        
        // Update connections
        island1.connectedTo.push(island2.id);
        island2.connectedTo.push(island1.id);
        
        if (bridgeCount === 2) {
          island1.connectedTo.push(island2.id);
          island2.connectedTo.push(island1.id);
        }
      } else if (existingBridge.count === 1) {
        existingBridge.count = 2;
        
        // Update connections
        island1.connectedTo.push(island2.id);
        island2.connectedTo.push(island1.id);
      }
    }
  }
  
  // Calculate final island values based on connections
  islands.forEach(island => {
    island.value = island.connectedTo.length;
    island.connectedTo = [];  // Reset for gameplay
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
