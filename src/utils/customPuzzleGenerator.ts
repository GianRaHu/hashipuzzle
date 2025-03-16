
import { Puzzle, generatePuzzle, generateId } from './gameLogic';

export const generateCustomPuzzle = (size: number, islandCount: number): Puzzle => {
  // For simplicity, we'll base this on the difficulty that most closely matches 
  // the requested size, but override the size property
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
  
  // Override the size and set custom properties
  puzzle.size = size;
  puzzle.difficulty = 'custom';
  
  // Add a custom identifier
  puzzle.id = generateId();
  
  return puzzle;
};
