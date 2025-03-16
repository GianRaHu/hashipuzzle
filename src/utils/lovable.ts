
import { Puzzle } from './gameLogic';

export interface LovableConfig {
  username: string;
  timestamp: string;
  projectId: string;
}

export const LOVABLE_CONFIG: LovableConfig = {
  username: 'GianRaHu',
  timestamp: '2025-03-13 09:18:19',
  projectId: 'thehashipuzzle'
};

export function initializeLovable() {
  // GPT Engineer script is already added in index.html
  console.log('Lovable initialized with latest version');
  
  // Wait for GPT Engineer to be ready
  if (window.gptengineer) {
    window.gptengineer.ready().then(() => {
      console.log('GPT Engineer is ready');
    });
  }
}

export function savePuzzleToLovable(puzzle: Puzzle) {
  if (window.gptengineer) {
    window.gptengineer.save('currentPuzzle', puzzle);
  }
}

export function loadPuzzleFromLovable(): Promise<Puzzle | null> {
  return new Promise((resolve) => {
    if (window.gptengineer) {
      window.gptengineer.load('currentPuzzle').then((puzzle: Puzzle | null) => {
        resolve(puzzle);
      });
    } else {
      resolve(null);
    }
  });
}
