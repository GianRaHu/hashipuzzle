
// Difficulty settings - defines parameters for each difficulty level
export const difficultySettings = {
  easy: {
    size: { rows: 10, cols: 7 }, // Swapped from 7x10 to 10x7
    islandCount: 12, // Adjust based on grid size
    maxValue: 3,
    advancedTactics: false
  },
  medium: {
    size: { rows: 12, cols: 8 }, // Swapped from 8x12 to 12x8
    islandCount: 20, // Adjust based on grid size
    maxValue: 4,
    advancedTactics: false
  },
  hard: {
    size: { rows: 14, cols: 10 }, // Swapped from 10x14 to 14x10
    islandCount: 30, // Adjust based on grid size
    maxValue: 5,
    advancedTactics: true
  },
  expert: {
    size: { rows: 16, cols: 12 }, // Swapped from 12x16 to 16x12
    islandCount: 40, // Adjust based on grid size
    maxValue: 6,
    advancedTactics: true
  }
};

// Custom grid size options for the UI
export const customGridSizeOptions = [
  { label: "8x6", value: { rows: 8, cols: 6 } },  // Added new option
  { label: "10x7", value: { rows: 10, cols: 7 } },
  { label: "12x8", value: { rows: 12, cols: 8 } },
  { label: "14x10", value: { rows: 14, cols: 10 } },
  { label: "16x12", value: { rows: 16, cols: 12 } },
  { label: "18x13", value: { rows: 18, cols: 13 } },
  { label: "20x15", value: { rows: 20, cols: 15 } },
  { label: "24x18", value: { rows: 24, cols: 18 } }
];
