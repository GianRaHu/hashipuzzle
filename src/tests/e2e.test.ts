import { test, expect } from '@playwright/test';

test.describe('Game Functionality', () => {
  test('loads the main page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('The Hashi Puzzle');
  });

  test('can start a new game', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Play")');
    await expect(page.url()).toContain('/play');
  });

  test('game board is interactive', async ({ page }) => {
    await page.goto('/play');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await canvas.click({ position: { x: 100, y: 100 } });
  });
});
