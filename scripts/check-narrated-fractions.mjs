/** Real compiled native player + recorded audio. No model calls or learner account. */
import { createServer } from 'node:http';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { chromium, expect } from '@playwright/test';
const root = resolve(import.meta.dirname, '..');
const lesson = process.argv.includes('--multiplication') ? 'multiplication' : 'fractions';
const work = join(root, 'data/narrated-' + lesson + '/browser-check');
mkdirSync(work, { recursive: true });
const manifest = JSON.parse(
  readFileSync(join(root, `lib/curriculum/${lesson}-media.json`), 'utf8'),
);
const story = JSON.parse(
  readFileSync(join(root, `lib/curriculum/${lesson}-storyboard.json`), 'utf8'),
);
const html = readFileSync(join(root, 'public', manifest.asset));
const server = createServer((_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.end(html);
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const address = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const errors = [];
const results = [];
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 840 } });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', (route) =>
    route.request().url().startsWith(address) ? route.continue() : route.abort(),
  );
  for (const chapter of manifest.chapters) {
    await page.goto('about:blank');
    await page.goto(`${address}#chapter=${chapter.id}`);
    await expect(page.getByRole('button', { name: '播放讲解', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '播放讲解', exact: true }).click();
    await expect(page.getByRole('button', { name: '暂停讲解', exact: true })).toBeVisible();
    await page.waitForTimeout(1400);
    const active = await page
      .locator('audio')
      .evaluateAll((nodes) => nodes.filter((a) => !a.paused && a.currentTime > 0).length);
    if (!active) throw new Error(`Recorded audio did not play: ${chapter.id}`);
    const decoded = await page.locator('audio').evaluateAll(async (nodes) => {
      const src = nodes.find((a) => !a.paused && a.currentTime > 0).currentSrc;
      const context = new AudioContext();
      try {
        const buffer = await context.decodeAudioData(await (await fetch(src)).arrayBuffer());
        const samples = buffer.getChannelData(0);
        let squares = 0;
        for (const value of samples) squares += value * value;
        return { seconds: buffer.duration, rms: Math.sqrt(squares / samples.length) };
      } finally {
        await context.close();
      }
    });
    if (decoded.seconds < 1 || decoded.rms < 0.001)
      throw new Error('Recorded speech is empty or silent');
    await page.getByRole('button', { name: '暂停讲解', exact: true }).click();
    const paused = Number(await page.locator('output').getAttribute('data-frame'));
    await page.waitForTimeout(350);
    if (Number(await page.locator('output').getAttribute('data-frame')) !== paused)
      throw new Error('Picture advanced while paused');
    if (await page.locator('audio').evaluateAll((nodes) => nodes.some((a) => !a.paused)))
      throw new Error('Audio continued while paused');
    for (const shot of story.chapters.find((c) => c.id === chapter.id).shots) {
      const timing = manifest.shots.find((s) => s.id === shot.id);
      const target = timing.audioStart + 20;
      await page.getByRole('slider', { name: '讲解进度' }).evaluate((input, value) => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(
          input,
          String(value),
        );
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, target);
      await expect(page.locator('output')).toHaveAttribute('data-frame', String(target));
      await expect(page.getByRole('heading', { name: shot.title, exact: true })).toBeVisible();
      await expect(page.getByText(shot.text, { exact: true }).first()).toBeVisible();
      if (manifest.captionLayout === 'below-player') {
        for (const width of [960, 640, 390]) {
          await page.setViewportSize({ width, height: 900 });
          const layout = await page.locator('[data-lesson-caption]').evaluate((caption) => {
            const board = caption.previousElementSibling.getBoundingClientRect();
            const text = caption.getBoundingClientRect();
            return {
              below: text.top >= board.bottom - 1,
              fits: caption.scrollHeight <= caption.clientHeight + 1,
              overflow: document.documentElement.scrollWidth > innerWidth,
            };
          });
          if (!layout.below || !layout.fits || layout.overflow)
            throw new Error(`Caption overlaps or clips: ${shot.id} at ${width}px`);
        }
        await page.setViewportSize({ width: 960, height: 840 });
      }
      await page.screenshot({ path: join(work, `${shot.id}.png`) });
    }
    await page.getByRole('button', { name: '播放讲解', exact: true }).click();
    await page.waitForTimeout(650);
    const frame = Number(await page.locator('output').getAttribute('data-frame'));
    const audio = await page
      .locator('audio')
      .evaluateAll((nodes) =>
        nodes.filter((a) => !a.paused).map((a) => ({ time: a.currentTime, src: a.currentSrc })),
      );
    const shot = manifest.shots.find((s) => frame >= s.start && frame <= s.end);
    const expected = (frame - shot.audioStart) / 30;
    if (!audio.some((a) => Math.abs(a.time - expected) < 0.6))
      throw new Error(`Audio seek out of sync: ${chapter.id}`);
    await page.getByRole('button', { name: '从头再看', exact: true }).click();
    await expect(page.locator('output')).toHaveAttribute('data-frame', String(chapter.start));
    await page.getByRole('slider', { name: '讲解进度' }).evaluate((input, value) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(
        input,
        String(value),
      );
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, chapter.end - 3);
    await page.getByRole('button', { name: '播放讲解', exact: true }).click();
    await expect(page.getByRole('button', { name: '播放讲解', exact: true })).toBeVisible();
    await expect(page.locator('output')).toHaveAttribute('data-frame', String(chapter.end));
    if (chapter.id === 'explain') {
      await page.getByRole('button', { name: '全屏观看', exact: true }).click();
      await expect
        .poll(() => page.evaluate(() => document.fullscreenElement?.tagName))
        .toBe('HTML');
      await expect(page.getByRole('button', { name: '从头再看', exact: true })).toBeVisible();
      await page.evaluate(() => document.exitFullscreen());
    }
    await page.getByRole('slider', { name: '讲解进度' }).press('End');
    await expect(page.locator('output')).toHaveAttribute('data-frame', String(chapter.end));
    // Clicking play at the end restarts only this chapter.
    await page.getByRole('button', { name: '播放讲解', exact: true }).click();
    await page.waitForTimeout(200);
    if (Number(await page.locator('output').getAttribute('data-frame')) > chapter.start + 25)
      throw new Error('Replay crossed chapter boundary');
    await page.getByRole('button', { name: '暂停讲解', exact: true }).click();
    await page.setViewportSize({ width: 390, height: 430 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
      throw new Error('Phone width overflow');
    await page.screenshot({ path: join(work, `${chapter.id}-mobile.png`), fullPage: true });
    await page.setViewportSize({ width: 960, height: 840 });
    results.push({
      chapter: chapter.id,
      audioPlayed: true,
      pause: true,
      seek: true,
      shots: story.chapters.find((c) => c.id === chapter.id).shots.length,
    });
  }
  if (manifest.version >= 5) {
    for (const chapter of story.chapters)
      for (const shot of chapter.shots) {
        const timing = manifest.shots.find((item) => item.id === shot.id);
        await page.goto('about:blank');
        await page.goto(`${address}#chapter=${chapter.id}`);
        await page.getByRole('slider', { name: '讲解进度' }).evaluate((input, value) => {
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(
            input,
            String(value),
          );
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }, timing.audioEnd - 4);
        await page.getByRole('button', { name: '播放讲解', exact: true }).click();
        const turn = page.getByRole('region', { name: '停下来想一想' });
        await expect(turn).toBeVisible();
        const stopped = await page.locator('output').getAttribute('data-frame');
        await page.waitForTimeout(650);
        await expect(page.locator('output')).toHaveAttribute('data-frame', stopped);
        if (await page.locator('audio').evaluateAll((nodes) => nodes.some((node) => !node.paused)))
          throw new Error('Teacher kept talking at a thinking stop');
        await expect(turn.getByRole('button', { name: '准备好啦，继续' })).toBeDisabled();
        const prompt = shot.pause;
        if (prompt.kind === 'groups') {
          await turn.getByRole('button', { name: '我摆好啦' }).click();
          await expect(turn.getByText(prompt.hint, { exact: true })).toBeVisible();
          for (let i = 1; i <= prompt.groups; i++)
            for (let j = 0; j < prompt.each; j++)
              await turn.getByRole('button', { name: new RegExp(`^小盒${i}，`) }).click();
          await turn.getByRole('button', { name: '我摆好啦' }).click();
        } else {
          await turn
            .getByRole('button', {
              name: prompt.options[(prompt.answer + 1) % prompt.options.length],
              exact: true,
            })
            .click();
          await expect(turn.getByText(prompt.hint, { exact: true })).toBeVisible();
          if (prompt.friend) {
            await turn
              .getByRole('button', { name: `听${prompt.friend.name}怎么想`, exact: true })
              .click();
            await expect(
              turn.getByText(`${prompt.friend.name}：${prompt.friend.text}`, { exact: true }),
            ).toBeVisible();
            await expect
              .poll(() =>
                turn.locator('audio').evaluate((node) => !node.paused && node.currentTime > 0),
              )
              .toBe(true);
          }
          await turn
            .getByRole('button', { name: prompt.options[prompt.answer], exact: true })
            .click();
        }
        if (prompt.friend?.misconception) {
          await expect(turn.getByRole('button', { name: '准备好啦，继续' })).toBeDisabled();
          await turn.getByRole('button', { name: '听老师帮忙检查' }).click();
          await expect(
            turn.getByText('小海老师：' + prompt.friend.correction, { exact: true }),
          ).toBeVisible();
          await expect
            .poll(() => turn.locator('audio').evaluate((n) => !n.paused && n.currentTime > 0))
            .toBe(true);
          await turn.getByRole('button', { name: '我看懂老师的纠正啦' }).click();
        }
        await expect(turn.getByText(prompt.success, { exact: true })).toBeVisible();
        await page.setViewportSize({ width: 390, height: 844 });
        if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
          throw new Error('Thinking game phone overflow');
        await page.screenshot({
          path: join(work, `${shot.id}-thinking-mobile.png`),
          fullPage: true,
        });
        await turn.getByRole('button', { name: '准备好啦，继续' }).click();
        await expect(turn).toHaveCount(0);
        if (
          await page
            .locator('audio')
            .evaluateAll((nodes) =>
              nodes.some((node) => !node.paused && node.closest('.thinking-turn')),
            )
        )
          throw new Error('Companion voice continued over teaching');
      }
    console.log(
      'All eight automatic stops, gentle retries, two counter games and three recorded companion replies passed.',
    );
  }
  if (errors.length) throw new Error('Native player runtime errors: ' + errors.join(';'));
  console.log(JSON.stringify({ passed: true, results }));
} catch (error) {
  console.error('Player errors:', errors);
  throw error;
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
