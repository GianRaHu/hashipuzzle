
// Difficulty settings - defines parameters for each difficulty level
export const difficultySettings = {
  easy: {
    size: { rows: 7, cols: 10 }, // 7x10 grid
    islandCount: 12, // Adjust based on grid size
    maxValue: 3,
    advancedTactics: false
  },
  medium: {
    size: { rows: 8, cols: 12 }, // 8x12 grid
    islandCount: 20, // Adjust based on grid size
    maxValue: 4,
    advancedTactics: false
  },
  hard: {
    size: { rows: 10, cols: 14 }, // 10x14 grid
    islandCount: 30, // Adjust based on grid size
    maxValue: 5,
    advancedTactics: true
  },
  expert: {
    size: { rows: 12, cols: 16 }, // 12x16 grid
    islandCount: 40, // Adjust based on grid size
    maxValue: 6,
    advancedTactics: true
  }
};

// Custom grid size options for the UI
export const customGridSizeOptions = [
  { label: "7x10", value: { rows: 7, cols: 10 } },
  { label: "8x12", value: { rows: 8, cols: 12 } },
  { label: "10x14", value: { rows: 10, cols: 14 } },
  { label: "12x16", value: { rows: 12, cols: 16 } },
  { label: "13x18", value: { rows: 13, cols: 18 } },
  { label: "15x20", value: { rows: 15, cols: 20 } }
];
