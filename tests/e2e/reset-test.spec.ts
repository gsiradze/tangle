import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('Reset button zeroes the moves counter', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.addInitScript(() => {
    window.localStorage.setItem(
      'tangle:state:v1',
      JSON.stringify({
        version: 1,
        currentLevel: 4,
        progress: {
          '1': { stars: 3, bestMoves: 2 },
          '2': { stars: 3, bestMoves: 2 },
          '3': { stars: 3, bestMoves: 2 },
        },
        sessionCount: 3,
        onboardingCompleted: true,
      }),
    );
  });

  await page.setViewportSize({ width: 420, height: 820 });
  await page.goto('/');
  await page.getByRole('button', { name: /Play|Continue/i }).click({ force: true });
  const canvas = page.locator('#game-container canvas');
  await expect(canvas).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(500);

  const movesValue = async (): Promise<string> =>
    (await page
      .locator('span.font-mono.tabular-nums')
      .filter({ hasText: /^\d+$/ })
      .first()
      .textContent()) ?? '';

  expect(await movesValue()).toBe('0');

  const box = await canvas.boundingBox();
  if (!box) throw new Error('no box');
  const sx = box.x + box.width * 0.5;
  const sy = box.y + box.height * 0.15;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(sx + i * 6, sy + i * 8);
  }
  await page.mouse.up();
  await page.waitForTimeout(300);

  await page.getByRole('button', { name: 'Reset' }).click({ force: true });
  await page.waitForTimeout(300);

  expect(await movesValue()).toBe('0');
  expect(errors).toEqual([]);
});
