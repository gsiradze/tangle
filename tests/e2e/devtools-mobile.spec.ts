import { expect, test } from '@playwright/test';

test.use({
  reducedMotion: 'reduce',
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  hasTouch: true,
  isMobile: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
});

test('iPhone-style mobile: touch drag on canvas vertex', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[c.e] ${msg.text()}`);
  });

  await page.addInitScript(() => {
    window.localStorage.setItem(
      'tangle:state:v1',
      JSON.stringify({
        version: 1,
        currentLevel: 3,
        progress: {
          '1': { stars: 3, bestMoves: 2 },
          '2': { stars: 3, bestMoves: 2 },
        },
        sessionCount: 3,
        onboardingCompleted: true,
      }),
    );
  });

  await page.goto('/');
  await page.getByRole('button', { name: /Play|Continue/i }).click({ force: true });
  const canvas = page.locator('#game-container canvas');
  await expect(canvas).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(600);

  const ta = await canvas.evaluate((el) => getComputedStyle(el).touchAction);
  console.log('canvas touch-action:', ta);

  await canvas.evaluate((el) => {
    const hits: string[] = [];
    (window as unknown as { __hits: string[] }).__hits = hits;
    (window as unknown as { __logMouse: boolean }).__logMouse = true;
    for (const type of [
      'pointerdown',
      'pointermove',
      'pointerup',
      'touchstart',
      'touchmove',
      'touchend',
      'mousedown',
    ]) {
      el.addEventListener(
        type,
        (e) => {
          const ev = e as PointerEvent;
          hits.push(`${type}(${ev.pointerType ?? ''})`);
        },
        { passive: true },
      );
    }
  });

  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas not measured');
  console.log('canvas box:', box);

  // Level 3 vertex positions vary; we just pick near the center-top area.
  // First tap anywhere on the canvas to see if events reach Phaser.
  const sx = box.x + box.width * 0.5;
  const sy = box.y + box.height * 0.5;

  await page.touchscreen.tap(sx, sy);
  await page.waitForTimeout(100);

  const hitsAfterTap = await page.evaluate(
    () => (window as unknown as { __hits?: string[] }).__hits ?? [],
  );
  console.log('events after tap:', hitsAfterTap);

  // Try drag
  const before = await canvas.screenshot();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: sx, y: sy - box.height * 0.35 }],
  });
  for (let i = 1; i <= 8; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: sx + i * 5, y: sy - box.height * 0.35 + i * 4 }],
    });
    await page.waitForTimeout(25);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(400);

  const after = await canvas.screenshot();
  const moved = Buffer.compare(before, after) !== 0;
  const finalHits = await page.evaluate(
    () => (window as unknown as { __hits?: string[] }).__hits ?? [],
  );
  console.log('final events on canvas:', finalHits.slice(0, 30));
  console.log('moved:', moved, 'errors:', errors);
});
