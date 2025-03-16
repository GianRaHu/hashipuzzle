import { Puzzle, generatePuzzle } from './gameLogic';

export const generateCustomPuzzle = (size: number, islandCount: number): Puzzle => {
  // For simplicity, we'll just use the regular puzzle generator with a difficulty level
  // that most closely matches the requested size
  let difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master' = 'easy';
  
  if (size >= 10) {
    difficulty = 'master';
  } else if (size >= 9) {
    difficulty = 'expert'; 
  } else if (size >= 8) {
    difficulty = 'hard';
  } else if (size >= 7) {
    difficulty = 'medium';
  }
  
  const puzzle = generatePuzzle(difficulty);
  
  // Override the size in the puzzle object
  puzzle.size = size;
  
  return puzzle;
};

