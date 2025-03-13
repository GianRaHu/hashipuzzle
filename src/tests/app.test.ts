import { describe, it, expect, beforeEach } from 'vitest';
import { GameBoard, Puzzle, generatePuzzle } from '../utils/gameLogic';
import { APP_CONFIG } from '../config/app.config';
import { initializeApp } from '../utils/initApp';

describe('Core Game Functionality', () => {
  let puzzle: Puzzle;
  
  beforeEach(() => {
    puzzle = generatePuzzle(6, 'medium');
  });

  it('generates valid puzzles', () => {
    expect(puzzle.islands.length).toBeGreaterThan(0);
    expect(puzzle.bridges.length).toBe(0);
    expect(puzzle.solved).toBe(false);
  });

  it('validates bridge placement', () => {
    const board = new GameBoard(puzzle);
    const firstIsland = puzzle.islands[0];
    const secondIsland = puzzle.islands[1];
    
    const canPlace = board.canPlaceBridge(firstIsland, secondIsland);
    expect(typeof canPlace).toBe('boolean');
  });
});

describe('App Configuration', () => {
  it('has valid configuration', () => {
    expect(APP_CONFIG.name).toBe('The Hashi Puzzle');
    expect(APP_CONFIG.version).toBeDefined();
    expect(APP_CONFIG.game.difficulties).toContain('medium');
  });
});

describe('Storage Functionality', () => {
  it('handles local storage operations', () => {
    const testKey = `${APP_CONFIG.storage.prefix}test`;
    localStorage.setItem(testKey, 'test');
    expect(localStorage.getItem(testKey)).toBe('test');
  });
});
