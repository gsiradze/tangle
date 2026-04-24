import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('drag a vertex on level 1', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.addInitScript(() => {
    window.localStorage.setItem(
      'tangle:state:v1',
      JSON.stringify({
        version: 1,
        currentLevel: 1,
        progress: {},
        sessionCount: 3,
        onboardingCompleted: true,
      }),
    );
  });

  await page.setViewportSize({ width: 420, height: 820 });
  await page.goto('/');
  await page.getByRole('button', { name: /Play|Continue/i }).click({ force: true });
  await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(500);

  const canvas = page.locator('#game-container canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas not measured');
  expect(box.width).toBeGreaterThan(300);
  expect(box.height).toBeLessThan(820);

  const gameW = 420;
  const gameH = 760;
  const padding = 40;
  const topVertexGameX = padding + 0.5 * (gameW - padding * 2);
  const topVertexGameY = padding + 0.1 * (gameH - padding * 2);
  const scale = box.width / gameW;
  const clickX = box.x + topVertexGameX * scale;
  const clickY = box.y + topVertexGameY * scale;

  const before = await canvas.screenshot();
  await page.mouse.move(clickX, clickY);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) {
    await page.mouse.move(clickX + i * 6, clickY + i * 4, { steps: 2 });
  }
  await page.mouse.up();
  await page.waitForTimeout(200);
  const after = await canvas.screenshot();

  expect(errors).toEqual([]);
  expect(Buffer.compare(before, after)).not.toBe(0);
});
