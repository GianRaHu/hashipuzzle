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
  // Add Lovable script to the document
  const script = document.createElement('script');
  script.src = 'https://cdn.gpteng.co/gptengineer.js';
  script.type = 'module';
  document.body.appendChild(script);
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
