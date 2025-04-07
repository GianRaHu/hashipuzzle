
// Difficulty settings - defines parameters for each difficulty level
export const difficultySettings = {
  easy: {
    size: { rows: 10, cols: 7 },
    islandCount: 12,
    maxValue: 3,
    advancedTactics: false
  },
  medium: {
    size: { rows: 12, cols: 8 },
    islandCount: 20,
    maxValue: 4,
    advancedTactics: false
  },
  hard: {
    size: { rows: 14, cols: 10 },
    islandCount: 30,
    maxValue: 5,
    advancedTactics: true
  },
  expert: {
    size: { rows: 16, cols: 12 },
    islandCount: 40,
    maxValue: 6,
    advancedTactics: true
  }
};

// Custom grid size options for the UI
export const customGridSizeOptions = [
  { label: "8x6", value: { rows: 8, cols: 6 } },
  { label: "10x7", value: { rows: 10, cols: 7 } },
  { label: "12x8", value: { rows: 12, cols: 8 } },
  { label: "14x10", value: { rows: 14, cols: 10 } },
  { label: "16x12", value: { rows: 16, cols: 12 } },
  { label: "18x13", value: { rows: 18, cols: 13 } },
  { label: "20x15", value: { rows: 20, cols: 15 } }
];
