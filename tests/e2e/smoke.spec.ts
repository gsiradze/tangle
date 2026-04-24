import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('main menu shows, Play reveals Phaser canvas', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('img', { name: 'Tangle' })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /Play|Continue/i }).click({ force: true });
  await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10_000 });
});
