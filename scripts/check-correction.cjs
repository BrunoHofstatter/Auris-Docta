// Run against Vite, using the same optional Playwright installation as check-practice.cjs.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
require('node:fs').mkdirSync('artifacts', { recursive: true });
const origin = process.env.APP_URL || 'http://127.0.0.1:5173';
async function prepare(browser, viewport, touch = false, fullscreenFallback = false) {
  const context = await browser.newContext({ viewport, hasTouch: touch, isMobile: touch });
  await context.addInitScript(({ fallback }) => {
    localStorage.setItem('auris-practice-setup', JSON.stringify({
      categories: ['chords'], chords: ['major'], octaves: [4], tonic: 'C', keyMode: 'none',
      bpm: 60, lengthUnit: 'items', length: 3, playback: 'simultaneous', spread: 'medium',
      direction: 'ascending', inversions: 'root', mode: 'full',
    }));
    Math.random = () => 0;
    if (fallback) Element.prototype.requestFullscreen = () => Promise.reject(new Error('Fullscreen unavailable'));
    window.__sourceStarts = 0;
    const Native = window.AudioContext;
    window.AudioContext = class extends Native {
      createBufferSource() {
        const source = super.createBufferSource(), start = source.start.bind(source);
        source.start = (...args) => { window.__sourceStarts++; return start(...args); };
        return source;
      }
    };
  }, { fallback: fullscreenFallback });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/#/practice`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Start exercise', exact: true }).click();
  assert.equal(await page.locator('.practice-roll').count(), 0, 'Solution leaked before submission');
  await page.getByRole('button', { name: 'Enable piano', exact: true }).click();
  await page.getByRole('button', { name: 'Play', exact: true }).waitFor();
  for (const [index, answer] of ['C4 E4 A4', 'C4 E4 G4', 'C5 E4 G4'].entries()) {
    if (index) await page.getByRole('button', { name: 'Next group', exact: true }).click();
    await page.getByLabel('Practice options', { exact: true }).click();
    await page.getByRole('textbox', { name: 'Typed answer', exact: true }).fill(answer);
    await page.getByRole('button', { name: 'Apply notes', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await page.locator('.practice-review-player').waitFor();
  await page.waitForTimeout(100);
  return { page, errors, context };
}
async function fits(page) {
  const metrics = await page.evaluate(() => ({ w: innerWidth, h: innerHeight, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight }));
  assert(metrics.sw <= metrics.w && metrics.sh <= metrics.h + 1, JSON.stringify(metrics));
  assert.equal(await page.locator('[data-review-key]').count(), 88);
}
async function fullscreen(page, native) {
  const before = Number(await page.getByRole('slider', { name: 'Playback position' }).inputValue());
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click();
  await page.locator('.practice-review-player.is-fullscreen').waitFor();
  await page.waitForTimeout(100);
  const box = await page.locator('.practice-review-player').boundingBox();
  const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, native: !!document.fullscreenElement }));
  assert.equal(viewport.native, native);
  assert(box.x <= 1 && box.y <= 1 && Math.abs(box.width - viewport.width) <= 1 && Math.abs(box.height - viewport.height) <= 1, 'Fullscreen did not fill viewport');
  assert.equal(Number(await page.getByRole('slider', { name: 'Playback position' }).inputValue()), before);
  await fits(page);
  // Only the player is visible at the header/footer positions.
  assert(await page.evaluate(() => document.querySelector('.practice-review-player').contains(document.elementFromPoint(20, 20))));
}
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const { page, errors } = await prepare(browser, { width: 1366, height: 900 });
    await fits(page);
    assert.equal(await page.locator('.practice-falling-note.is-correct').count(), 7);
    assert.equal(await page.locator('.practice-falling-note.is-missing').count(), 2);
    assert.equal(await page.locator('.practice-falling-note.is-extra').count(), 2);
    assert.equal(await page.locator('.practice-falling-note.is-extra text').first().textContent(), '× A4');
    assert.match(await page.locator('.practice-falling-note.is-extra rect').nth(1).getAttribute('fill'), /url/);
    const source = page.locator('.practice-falling-note.is-correct[data-pitch="60"][data-start="1"]');
    const before = Number(await source.locator('rect').getAttribute('y'));
    await page.getByRole('slider', { name: 'Playback position' }).fill('0.5');
    assert(Number(await source.locator('rect').getAttribute('y')) > before, 'Seeking did not move notes downward');
    await page.getByRole('slider', { name: 'Playback position' }).fill('0');
    assert.equal(Number(await source.locator('rect').getAttribute('y')), before, 'Backward seek did not restore note positions');
    await page.locator('.practice-falling-note.is-extra').first().click();
    await page.getByRole('status').filter({ hasText: 'A4 · Your wrong answer' }).waitFor();
    await page.locator('.practice-note-detail').click();
    await page.screenshot({ path: 'artifacts/correction-desktop.png' });
    const startsBeforePlay = await page.evaluate(() => window.__sourceStarts);
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.waitForTimeout(250);
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    assert(Number(await page.getByRole('slider', { name: 'Playback position' }).inputValue()) > 0);
    assert.equal((await page.evaluate(() => window.__sourceStarts)) - startsBeforePlay, 9, 'Wrong answer notes entered source audio');
    await fullscreen(page, true);
    await page.screenshot({ path: 'artifacts/correction-fullscreen-desktop.png' });
    await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).click();
    await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).waitFor();
    await fullscreen(page, true);
    await page.evaluate(() => document.exitFullscreen());
    await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    assert.equal(await page.locator('.practice-roll').count(), 0);
    assert.deepEqual(errors, []);
    for (const viewport of [{ width: 844, height: 390 }, { width: 568, height: 320 }]) {
      const mobile = await prepare(browser, viewport, true, true);
      await fits(mobile.page);
      await mobile.page.screenshot({ path: `artifacts/correction-${viewport.width}.png` });
      await mobile.page.getByRole('slider', { name: 'Playback position' }).fill('1.25');
      await fullscreen(mobile.page, false);
      await mobile.page.screenshot({ path: `artifacts/correction-fullscreen-${viewport.width}.png` });
      await mobile.page.keyboard.press('Escape');
      await mobile.page.getByRole('button', { name: 'Enter fullscreen', exact: true }).waitFor();
      assert.equal(await mobile.page.getByRole('slider', { name: 'Playback position' }).inputValue(), '1.25');
      assert.deepEqual(mobile.errors, []);
      await mobile.context.close();
    }
    console.log(JSON.stringify({ passed: true, checks: ['88-key full-width correction', 'green/yellow and striped red labels', 'forward/backward scrub', 'note inspection', 'source-only audio', 'native fullscreen and browser exit', 'fullscreen fallback and Escape', 'state preservation', 'desktop and two mobile landscape sizes'], pageErrors: [] }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
