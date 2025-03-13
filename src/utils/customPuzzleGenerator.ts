import { v4 as uuidv4 } from 'uuid';
import { Island, Puzzle } from './gameLogic';

export function generateCustomPuzzle(seed: number, size: number, numIslands: number): Puzzle {
  // Use a simple PRNG to generate consistent results based on the seed
  let random = mulberry32(seed);

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

  const generatedPuzzle: Puzzle = {
    id: uuidv4(),
    size,
    islands,
    bridges: [],
    startTime: Date.now(),
    moveHistory: [],
    solved: false,
    seed: seed
  };

  return generatedPuzzle;
}

// Mulberry32 PRNG - Quick and decent quality
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}
