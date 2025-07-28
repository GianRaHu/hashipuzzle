
// Enhanced difficulty settings with better progression and balance
export const difficultySettings = {
  easy: {
    size: { rows: 8, cols: 6 },
    islandCount: 8,
    maxValue: 3,
    advancedTactics: false,
    description: "Perfect for beginners",
    estimatedTime: "0-2 minutes"
  },
  medium: {
    size: { rows: 10, cols: 8 },
    islandCount: 15,
    maxValue: 4,
    advancedTactics: false,
    description: "Getting more challenging",
    estimatedTime: "1-3 minutes"
  },
  hard: {
    size: { rows: 12, cols: 10 },
    islandCount: 25,
    maxValue: 5,
    advancedTactics: true,
    description: "For experienced players",
    estimatedTime: "2-5 minutes"
  },
  expert: {
    size: { rows: 14, cols: 12 },
    islandCount: 35,
    maxValue: 6,
    advancedTactics: true,
    description: "Master level challenge",
    estimatedTime: "2-10 minutes"
  }
};

// Enhanced custom grid size options for better mobile experience
export const customGridSizeOptions = [
  { label: "Small (6x5)", value: { rows: 6, cols: 5 }, description: "Quick puzzle" },
  { label: "Medium (8x6)", value: { rows: 8, cols: 6 }, description: "Balanced size" },
  { label: "Large (10x8)", value: { rows: 10, cols: 8 }, description: "More challenge" },
  { label: "Extra Large (12x10)", value: { rows: 12, cols: 10 }, description: "Expert size" },
  { label: "Massive (14x12)", value: { rows: 14, cols: 12 }, description: "Maximum challenge" }
];

// Difficulty progression rewards and achievements
export const difficultyRewards = {
  easy: {
    completionXP: 10,
    perfectTimeBonus: 5,
    achievements: ["First Steps", "Quick Learner"]
  },
  medium: {
    completionXP: 25,
    perfectTimeBonus: 10,
    achievements: ["Getting Better", "Steady Progress"]
  },
  hard: {
    completionXP: 50,
    perfectTimeBonus: 20,
    achievements: ["Advanced Player", "Logic Master"]
  },
  expert: {
    completionXP: 100,
    perfectTimeBonus: 40,
    achievements: ["Expert Solver", "Bridge Master", "Ultimate Challenge"]
  }
};
