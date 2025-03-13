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

// ... keep existing code (DIFFICULTY_SETTINGS and other constant definitions)

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

// ... keep existing code (findAllSolutions, generateValidPuzzle, generateBasicPuzzle, etc.)

export function generatePuzzle(difficulty: string, seed?: string | number): Puzzle {
  try {
    const puzzle = generateValidPuzzle(difficulty);
    if (seed) {
      puzzle.seed = seed;
    }
    return puzzle;
  } catch (error) {
    console.error('Error generating puzzle:', error);
    const puzzle = generateBasicPuzzle(difficulty);
    if (seed) {
      puzzle.seed = seed;
    }
    return puzzle;
  }
}

// ... keep existing code (toggleBridge, canConnect functions)

export function isSolved(puzzle: Puzzle): boolean {
  // ... keep existing code (isSolved function implementation)
  
  // Add this line at the end of the function to update the solved property
  puzzle.solved = true;
  return true; // or the original return logic if more complex
}
