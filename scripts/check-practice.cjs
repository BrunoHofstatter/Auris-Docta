// Run against Vite with PLAYWRIGHT_MODULE pointing to an available Playwright install.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
require('node:fs').mkdirSync('artifacts', { recursive: true });
const origin = process.env.APP_URL || 'http://127.0.0.1:5173';
const defaults = {
  categories: ['note'], chords: ['major', 'minor'], octaves: [4, 5], tonic: 'C', keyMode: 'none',
  bpm: 60, lengthUnit: 'items', length: 3, playback: 'simultaneous', spread: 'medium',
  direction: 'ascending', inversions: 'root', mode: 'full',
};
async function fixture(context, settings = defaults) {
  await context.addInitScript(setup => {
    localStorage.setItem('auris-practice-setup', JSON.stringify(setup));
    Math.random = () => 0;
    const Native = window.AudioContext;
    window.__starts = [];
    window.AudioContext = class extends Native {
      constructor(options) { super(options); window.__audioContext = this; }
      createGain() { const gain = super.createGain(); if (!window.__master) window.__master = gain; return gain; }
      createBufferSource() {
        const source = super.createBufferSource(), start = source.start.bind(source);
        source.start = (...args) => { window.__starts.push(args); return start(...args); };
        return source;
      }
    };
  }, settings);
}
async function assertFits(page, label) {
  const metrics = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight }));
  assert(metrics.scrollWidth <= metrics.width, `${label}: horizontal overflow ${JSON.stringify(metrics)}`);
  assert(metrics.scrollHeight <= metrics.height + 1, `${label}: vertical overflow ${JSON.stringify(metrics)}`);
  const bounds = await page.locator('.practice-keyboard').count() ? await page.locator('.practice-keyboard').boundingBox() : null;
  if (bounds) assert(bounds.y >= 0 && bounds.y + bounds.height <= metrics.height, `${label}: piano outside viewport`);
}
async function enable(page, touch = false) {
  await page.getByRole('button', { name: 'Enable piano', exact: true })[touch ? 'tap' : 'click']();
  await page.getByRole('button', { name: 'Play', exact: true }).waitFor({ timeout: 30000 });
}
async function typed(page, notes, touch = false) {
  await page.getByLabel('Practice options', { exact: true })[touch ? 'tap' : 'click']();
  await page.getByRole('textbox', { name: 'Typed answer', exact: true }).fill(notes);
  await page.getByRole('button', { name: 'Apply notes', exact: true })[touch ? 'tap' : 'click']();
}
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [];
  try {
    const desktop = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await fixture(desktop);
    const page = await desktop.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/#/practice`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Set up your listening' }).waitFor();
    await page.screenshot({ path: 'artifacts/practice-setup-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'Chords', exact: true }).click();
    await page.getByRole('button', { name: 'Configure', exact: true }).click();
    assert.equal(await page.locator('.practice-chord').count(), 10);
    assert.equal(await page.locator('.practice-chord[aria-pressed="true"]').count(), 2);
    await page.screenshot({ path: 'artifacts/practice-chords-desktop.png', fullPage: true });
    await page.getByRole('button', { name: /Done ·/ }).click();
    await page.getByRole('button', { name: 'Chords', exact: true }).click();
    await page.getByRole('button', { name: 'Start exercise', exact: true }).click();
    assert.equal(await page.locator('[data-piano-pitch]').count(), 88);
    assert.equal(await page.locator('.practice-roll').count(), 0);
    await enable(page);
    await page.evaluate(() => { window.__analyser = window.__audioContext.createAnalyser(); window.__master.connect(window.__analyser); });
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.waitForTimeout(200);
    const rms = await page.evaluate(() => { const samples = new Float32Array(window.__analyser.fftSize); window.__analyser.getFloatTimeDomainData(samples); return Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length); });
    assert(rms > 0.0001, 'Generated exercise has no audible PCM output');
    assert.equal(await page.locator('.is-selected,.is-held').count(), 0, 'Source playback exposed pitches');
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    const pausedAt = Number(await page.getByRole('slider', { name: 'Playback position' }).inputValue());
    await page.waitForTimeout(100);
    assert.equal(Number(await page.getByRole('slider', { name: 'Playback position' }).inputValue()), pausedAt);
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
    const c = await page.getByRole('button', { name: 'C4', exact: true }).boundingBox();
    const e = await page.getByRole('button', { name: 'E4', exact: true }).boundingBox();
    await page.mouse.move(c.x + c.width / 2, c.y + c.height * .85); await page.mouse.down();
    await page.mouse.move(e.x + e.width / 2, e.y + e.height * .85); await page.mouse.up();
    assert.equal(await page.locator('.is-selected').count(), 0, 'Dragging selected answer notes');
    const starts = await page.evaluate(() => window.__starts.length);
    await page.getByRole('button', { name: 'C4', exact: true }).click({ position: { x: c.width / 2, y: c.height * .85 } });
    assert.equal(await page.locator('.is-selected').count(), 1);
    assert.equal(await page.evaluate(() => window.__starts.length), starts, 'Answer selection made sound');
    await page.getByRole('button', { name: 'Sound', exact: true }).click();
    await page.keyboard.down('a'); await page.waitForTimeout(100);
    assert.equal(await page.locator('.is-held').count(), 1);
    await page.keyboard.up('a');
    assert((await page.evaluate(() => window.__starts.length)) > starts);
    await page.getByRole('button', { name: 'Answer', exact: true }).click();
    assert.equal(await page.locator('.is-selected').count(), 1);
    await page.getByRole('button', { name: 'Next group', exact: true }).click();
    await typed(page, 'C4');
    await page.getByRole('button', { name: 'Next group', exact: true }).click();
    await typed(page, 'C4');
    await page.getByRole('button', { name: 'Group 2', exact: true }).click({ button: 'right' });
    await page.getByRole('button', { name: 'Insert before', exact: true }).click();
    assert.equal(await page.locator('.practice-group').count(), 4);
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Group 2 is empty' }).waitFor();
    await page.getByRole('button', { name: 'Group 2, empty', exact: true }).click({ button: 'right' });
    await page.getByRole('button', { name: 'Delete group', exact: true }).click();
    assert.equal(await page.locator('.practice-group').count(), 3);
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    assert.equal(await page.locator('.practice-group').count(), 4);
    await typed(page, 'C4');
    await page.getByRole('button', { name: 'Group 4', exact: true }).click({ button: 'right' });
    await page.getByRole('button', { name: 'Delete group', exact: true }).click();
    await page.screenshot({ path: 'artifacts/practice-answer-desktop.png' });
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await page.getByRole('heading', { name: 'All correct' }).waitFor();
    await page.locator('.practice-roll').waitFor();
    await assertFits(page, 'desktop review');
    await page.screenshot({ path: 'artifacts/practice-review-desktop.png' });
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.waitForTimeout(200);
    await page.getByRole('slider', { name: 'Playback position' }).fill('1.5');
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
    await page.getByLabel('Practice options', { exact: true }).click();
    await page.getByRole('combobox', { name: 'Playback speed' }).selectOption('0.5');
    await page.getByRole('checkbox', { name: 'Loop selected items' }).check();
    await page.getByRole('spinbutton', { name: 'To item', exact: true }).fill('2');
    await page.getByRole('spinbutton', { name: 'From item', exact: true }).fill('2');
    await page.getByLabel('Practice options', { exact: true }).click();
    assert.equal(await page.getByRole('slider', { name: 'Playback position' }).getAttribute('min'), '1');
    assert.equal(await page.getByRole('slider', { name: 'Playback position' }).getAttribute('max'), '2');
    const beforeLoop = await page.evaluate(() => window.__starts.length);
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.waitForTimeout(2350);
    assert((await page.evaluate(() => window.__starts.length)) >= beforeLoop + 2, 'Selected item did not loop at half speed');
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    assert.equal(await page.locator('.practice-roll').count(), 0);
    await page.getByRole('button', { name: 'Setup', exact: true }).click();
    await page.getByRole('button', { name: 'Chords', exact: true }).click();
    await page.getByRole('button', { name: 'Configure', exact: true }).click();
    await page.locator('.practice-chord').filter({ hasText: 'Caug' }).click();
    await page.getByRole('button', { name: /Done ·/ }).click();
    await page.getByRole('combobox', { name: 'Key mode' }).selectOption('major');
    assert.equal(await page.getByRole('button', { name: 'Start new exercise', exact: true }).isDisabled(), true);
    await page.getByRole('alert').filter({ hasText: 'Caug cannot fit' }).waitFor();
    await page.getByRole('link', { name: 'Auris Docta home', exact: true }).click();
    await page.waitForFunction(() => window.__audioContext.state === 'closed');

    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await fixture(mobile, { ...defaults, mode: 'step', categories: ['chords'], chords: ['major'], length: 2 });
    const phone = await mobile.newPage(); phone.on('pageerror', error => errors.push(error.message));
    await phone.goto(`${origin}/#/practice`, { waitUntil: 'networkidle' });
    await phone.screenshot({ path: 'artifacts/practice-setup-phone.png', fullPage: true });
    const cdp = await mobile.newCDPSession(phone);
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    console.log('Phone emulation', await phone.evaluate(() => ({ touch: navigator.maxTouchPoints, coarse: matchMedia('(pointer: coarse)').matches })));
    await phone.getByRole('button', { name: 'Start exercise', exact: true }).tap();
    await phone.getByRole('heading', { name: 'Rotate to landscape to practice' }).waitFor();
    await phone.setViewportSize({ width: 844, height: 390 });
    assert.equal(await phone.locator('.practice-group-window').count(), 0);
    await assertFits(phone, 'phone step');
    await enable(phone, true);
    await typed(phone, 'C4', true);
    await phone.getByRole('button', { name: 'Check', exact: true }).tap();
    await phone.getByRole('status').filter({ hasText: 'Incorrect. Try again.' }).waitFor();
    assert.equal(await phone.locator('.practice-step-solution').count(), 0);
    await phone.getByRole('button', { name: 'Reveal', exact: true }).tap();
    await phone.locator('.practice-step-solution').filter({ hasText: 'C4' }).waitFor();
    assert.equal(await phone.getByRole('button', { name: 'Next item →', exact: true }).count(), 0);
    await typed(phone, 'G4 E4 C4', true);
    await phone.getByRole('button', { name: 'Check', exact: true }).tap();
    await phone.getByRole('button', { name: 'Next item →', exact: true }).waitFor();
    await phone.screenshot({ path: 'artifacts/practice-step-phone.png' });
    await phone.getByRole('button', { name: 'Next item →', exact: true }).tap();
    assert.equal(await phone.locator('.practice-step-solution').count(), 0, 'Previous reveal leaked into next item');
    await typed(phone, 'C4 E4 G4', true);
    await phone.getByRole('button', { name: 'Check', exact: true }).tap();
    await phone.getByRole('button', { name: 'Finish', exact: true }).tap();
    await phone.getByRole('heading', { name: 'All correct' }).waitFor();
    await assertFits(phone, 'phone review');
    await phone.screenshot({ path: 'artifacts/practice-review-phone.png' });
    await phone.getByRole('button', { name: 'Setup', exact: true }).tap();
    await phone.getByRole('button', { name: 'Full sequence', exact: true }).tap();
    await phone.getByRole('button', { name: 'Start new exercise', exact: true }).tap();
    await typed(phone, 'C1 C4 E4 G4 C7', true);
    await phone.locator('[aria-label="Selected notes below window"]').filter({ hasText: 'C1' }).waitFor();
    await phone.locator('[aria-label="Selected notes above window"]').filter({ hasText: 'C7' }).waitFor();
    await phone.setViewportSize({ width: 390, height: 844 });
    await phone.getByRole('heading', { name: 'Rotate to landscape to practice' }).waitFor();
    await phone.setViewportSize({ width: 568, height: 320 });
    assert.equal(await phone.locator('.practice-answer-summary').innerText(), 'Group 1\nC1\nC4\nE4\nG4\nC7');
    await assertFits(phone, 'small phone full sequence');
    await phone.screenshot({ path: 'artifacts/practice-small-phone.png' });
    const box = await phone.getByRole('button', { name: 'Group 1', exact: true }).boundingBox();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2, id: 1 }] });
    await phone.waitForTimeout(650);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await phone.getByRole('button', { name: 'Insert before', exact: true }).waitFor();
    await phone.getByRole('button', { name: 'Insert before', exact: true }).tap();
    assert.equal(await phone.locator('.practice-group').count(), 2);
    await phone.getByRole('button', { name: 'Reveal', exact: true }).tap();
    await assertFits(phone, 'small phone solution');
    await phone.screenshot({ path: 'artifacts/practice-solution-small-phone.png' });
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ passed: true, checks: ['setup/chord configuration', 'key/range warnings', 'source visibility', 'silent taps/no drag', 'sound audition', 'typed answers', 'group insert/delete/undo', 'grading/review', 'audio pause/seek/disposal', 'step-by-step/reveal', 'portrait state preservation', 'offscreen labels', 'mobile long-press', '844×390 and 568×320 viewport fit'], pageErrors: errors }, null, 2));
  } catch (error) {
    for (const context of browser.contexts()) for (const page of context.pages()) {
      console.error(await page.evaluate(() => ({ url: location.href, text: document.body.innerText, coarse: matchMedia('(pointer: coarse)').matches, portrait: matchMedia('(orientation: portrait)').matches, width: innerWidth, height: innerHeight })));
      await page.screenshot({ path: `artifacts/practice-failure-${context === browser.contexts()[0] ? 'desktop' : 'phone'}.png`, fullPage: true });
    }
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
