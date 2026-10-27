// Requires Playwright and Edge; run against a local Vite server.
// PLAYWRIGHT_MODULE may point to an existing Playwright installation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
require('node:fs').mkdirSync('artifacts', { recursive: true });
const origin = process.env.APP_URL || 'http://127.0.0.1:5173';
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await context.addInitScript(() => {
      const Native = window.AudioContext;
      window.__audioStats = { starts: [], decodedBytes: 0 };
      window.AudioContext = class extends Native {
        constructor(options) { super(options); window.__audioContext = this; }
        createGain() { const g = super.createGain(); if (!window.__master) window.__master = g; return g; }
        createBufferSource() { const s = super.createBufferSource(); const start = s.start.bind(s); s.start = (...args) => { window.__audioStats.starts.push({ at: args[0], duration: s.buffer?.duration ?? 0 }); return start(...args); }; return s; }
        async decodeAudioData(...args) { const b = await super.decodeAudioData(...args); window.__audioStats.decodedBytes += b.length * b.numberOfChannels * 4; return b; }
      };
    });
    const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${origin}/#/free-play`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-piano-pitch]').count(), 88);
    await page.getByRole('button', { name: 'Enable piano', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.piano-keyboard')?.getAttribute('aria-disabled') === 'false', null, { timeout: 30000 });
    await page.evaluate(() => { const c = window.__audioContext; window.__analyser = c.createAnalyser(); window.__master.connect(window.__analyser); });
    await page.keyboard.down('a');
    assert.equal(await page.getByRole('button', { name: 'C4', exact: true }).getAttribute('aria-pressed'), 'true');
    await page.waitForTimeout(350);
    const rms = await page.evaluate(() => { const d = new Float32Array(window.__analyser.fftSize); window.__analyser.getFloatTimeDomainData(d); return Math.sqrt(d.reduce((s, v) => s + v * v, 0) / d.length); });
    assert(rms > 0.0001, 'No audible PCM output: ' + rms);
    await page.getByRole('button', { name: /Sustain/ }).click(); await page.keyboard.up('a');
    assert(await page.getByRole('button', { name: 'C4', exact: true }).evaluate(e => e.classList.contains('is-sustained')));
    await page.keyboard.down('a'); await page.getByRole('button', { name: /Sustain/ }).click();
    assert.equal(await page.getByRole('button', { name: 'C4', exact: true }).getAttribute('aria-pressed'), 'true');
    await page.keyboard.up('a'); await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.getByRole('button', { name: 'All', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: 'C#4', exact: true }).innerText(), 'C#4');
    await page.getByRole('slider', { name: 'Volume' }).focus(); await page.keyboard.press('Home');
    assert.equal(await page.getByRole('slider', { name: 'Volume' }).inputValue(), '0'); await page.keyboard.press('End');
    await page.getByRole('button', { name: 'Settings', exact: true }).click(); await page.keyboard.down('s');
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    assert.equal(await page.locator('.is-held').count(), 0); await page.keyboard.up('s');
    await page.screenshot({ path: 'artifacts/free-play-desktop.png', fullPage: true });
    const stats = await page.evaluate(() => window.__audioStats);
    const mobile = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
    const phone = await mobile.newPage(); phone.on('pageerror', e => errors.push(e.message));
    await phone.goto(`${origin}/#/free-play`, { waitUntil: 'networkidle' });
    assert.equal(await phone.locator('[data-piano-pitch]').count(), 26);
    await phone.getByRole('button', { name: 'Enable piano', exact: true }).click(); await phone.waitForFunction(() => document.querySelector('.piano-keyboard')?.getAttribute('aria-disabled') === 'false', null, { timeout: 30000 });
    const geometry = await phone.locator('.piano-keyboard').boundingBox();
    console.log(JSON.stringify({ rms, decodedMiB: stats.decodedBytes / 1024 / 1024, mobileKeyboard: geometry, viewport: 390, pageHeight: await phone.evaluate(() => document.documentElement.scrollHeight) }));
    assert(geometry.y + geometry.height < 390, 'Keyboard bottom is outside the phone viewport');
    await phone.screenshot({ path: 'artifacts/free-play-mobile.png' });
    await phone.bringToFront();
    await phone.evaluate(() => { window.__touchEvents = []; for (const type of ['pointerdown', 'pointercancel', 'blur']) window.addEventListener(type, event => window.__touchEvents.push({ type, pitch: event.target?.dataset?.pianoPitch, pointerId: event.pointerId }), true); });
    const cdp = await mobile.newCDPSession(phone);
    const point = async (pitch, id) => { const b = await phone.locator(`[data-piano-pitch="${pitch}"]`).boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height * 0.8, id }; };
    const c = await point(60, 1); const e = await point(64, 2); const g = await point(67, 3);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [c, e, g] });
    await phone.waitForFunction(() => document.querySelectorAll('.is-held').length === 3, null, { timeout: 2000 }).catch(async error => { console.log(await phone.evaluate(() => ({ touch: window.__touchEvents, coarse: matchMedia('(pointer:coarse)').matches, focus: document.hasFocus(), count: document.querySelectorAll('[data-piano-pitch]').length, held: document.querySelectorAll('.is-held').length, status: document.querySelector('.piano-keyboard')?.getAttribute('aria-disabled') }))); throw error; });
    assert.equal(await phone.locator('.is-held').count(), 3);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [e] });
    await phone.waitForFunction(() => document.querySelectorAll('.is-held').length === 2);
    assert.equal(await phone.locator('.is-held').count(), 2);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await phone.waitForFunction(() => document.querySelectorAll('.is-held').length === 0);
    assert.equal(await phone.locator('.is-held').count(), 0);
    await phone.getByRole('button', { name: 'Next octave' }).click(); assert.equal(await phone.locator('[data-piano-pitch="96"]').count(), 1);
    await phone.setViewportSize({ width: 390, height: 844 }); await phone.getByRole('heading', { name: 'Rotate to landscape to play' }).waitFor();
    await phone.screenshot({ path: 'artifacts/free-play-portrait.png' });
    await phone.setViewportSize({ width: 844, height: 390 }); await phone.getByRole('button', { name: 'Next octave' }).waitFor();
    assert.equal(await phone.locator('[data-piano-pitch="96"]').count(), 1);
    while (!(await phone.getByRole('button', { name: 'Previous octave' }).isDisabled())) await phone.getByRole('button', { name: 'Previous octave' }).click();
    assert.equal(await phone.locator('[data-piano-pitch="21"]').count(), 1);
    while (!(await phone.getByRole('button', { name: 'Next octave' }).isDisabled())) await phone.getByRole('button', { name: 'Next octave' }).click();
    assert.equal(await phone.locator('[data-piano-pitch="108"]').count(), 1);
    await phone.getByRole('button', { name: 'Settings', exact: true }).click();
    await phone.getByRole('button', { name: 'All', exact: true }).click();
    await phone.getByRole('button', { name: 'Settings', exact: true }).click();
    for (const [width, height] of [[667, 375], [568, 320], [932, 430]]) {
      await phone.setViewportSize({ width, height });
      await phone.locator('.piano-keyboard').waitFor();
      assert(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow ' + width);
      const bounds = await phone.locator('.piano-keyboard').boundingBox();
      assert(bounds.y + bounds.height <= height, 'Keyboard outside viewport at ' + width + '×' + height);
    }
    await page.bringToFront();
    await page.getByRole('link', { name: 'Auris Docta home', exact: true }).click();
    await page.waitForFunction(() => window.__audioContext.state === 'closed');
    await page.locator('.home-menu').waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'studio');
    await page.getByRole('heading', { name: 'Auris Docta home' }).waitFor({ state: 'attached' });
    await page.getByRole('link', { name: 'Practice', exact: true }).click();
    await page.getByText('Practice is not available yet.', { exact: false }).waitFor();
    await page.goto(origin + '/#/not-a-page');
    await page.getByText('PAGE NOT FOUND', { exact: true }).waitFor();
    assert.equal(await page.locator('.studio').count(), 0);
    await page.setViewportSize({ width: 568, height: 900 });
    await page.goto(origin + '/#/free-play');
    assert.equal(await page.locator('[data-piano-pitch]').count(), 88);
    assert.equal(await page.locator('.site-header, .site-footer').count(), 0);
    assert.deepEqual(errors, []);
    console.log('Passed: audio PCM, input, sustain/retrigger, settings, focus cleanup, multitouch, octave bounds, rotation, layouts, navigation/disposal, and unknown routes.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
