/** Actual public components, local media, no learner APIs. Capture privacy-safe marketing assets. */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve, sep, extname } from 'node:path';
import { chromium, expect } from '@playwright/test';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '..');
const work = join(root, 'data/classroom-showcase');
const dist = join(work, 'dist');
mkdirSync(dist, { recursive: true });
mkdirSync(join(root, 'public/media'), { recursive: true });
const { build } = createRequire(join(root, 'data/video-lesson-pilot/package.json'))('esbuild');
await build({
  stdin: {
    contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import {ClassroomTour} from './components/learning/classroom-tour'; import {Home} from './components/marketing-home'; createRoot(document.getElementById('app')).render(location.pathname==='/'?<Home isAuthenticated={new URLSearchParams(location.search).has('signedIn')}/>:<ClassroomTour/>);`,
    resolveDir: root,
    loader: 'tsx',
  },
  bundle: true,
  outdir: dist,
  entryNames: 'app',
  splitting: true,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [
    {
      name: 'local-link',
      setup(api) {
        api.onResolve({ filter: /^next\/link$/ }, () => ({ path: 'link', namespace: 'local' }));
        api.onLoad({ filter: /.*/, namespace: 'local' }, () => ({
          contents: `import React from 'react'; export default function Link({children,...p}){return <a {...p}>{children}</a>}`,
          loader: 'tsx',
          resolveDir: root,
        }));
      },
    },
  ],
});
const css = readdirSync(join(root, '.next/static/chunks'))
  .filter((n) => n.endsWith('.css'))
  .map((n) => readFileSync(join(root, '.next/static/chunks', n), 'utf8'))
  .join('\n');
const html = `<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/tailwind.css"><link rel="stylesheet" href="/app.css"><div id="app"></div><script type="module" src="/app.js"></script></html>`;
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (path === '/tailwind.css') {
    res.setHeader('Content-Type', 'text/css');
    return res.end(css);
  }
  for (const directory of [dist, join(root, 'public')]) {
    const file = resolve(directory, '.' + path);
    if (!file.startsWith(directory + sep) || !existsSync(file)) continue;
    const type = {
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.html': 'text/html',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.webm': 'video/webm',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
    }[extname(file)];
    if (!type) continue;
    res.setHeader('Content-Type', type);
    return res.end(readFileSync(file));
  }
  if (path === '/' || path === '/classroom-preview') {
    res.setHeader('Content-Type', 'text/html');
    return res.end(html);
  }
  res.writeHead(404);
  res.end();
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 960 },
  recordVideo: { dir: join(work, 'recordings'), size: { width: 1280, height: 960 } },
});
const page = await context.newPage();
const captureStarted = Date.now();
let trimStart = 0;
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
let apiCalls = 0;
await context.route('**/*', (route) => {
  const url = route.request().url();
  if (url.includes('/api/')) apiCalls++;
  return url.startsWith(base) || url.startsWith('data:') ? route.continue() : route.abort();
});
const manifest = JSON.parse(
  readFileSync(join(root, 'lib/curriculum/multiplication-media.json'), 'utf8'),
);
const story = JSON.parse(
  readFileSync(join(root, 'lib/curriculum/multiplication-storyboard.json'), 'utf8'),
);
async function stopAt(id) {
  const timing = manifest.shots.find((s) => s.id === id);
  const frame = page.frameLocator('iframe');
  await frame.getByRole('slider', { name: '讲解进度' }).evaluate((node, value) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(
      node,
      String(value),
    );
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, timing.audioEnd - 4);
  await frame.getByRole('button', { name: '播放讲解', exact: true }).click();
  await expect(frame.getByRole('region', { name: '停下来想一想' })).toBeVisible();
  await page.locator('[data-classroom-screen]').scrollIntoViewIfNeeded();
  return frame.getByRole('region', { name: '停下来想一想' });
}
async function photo(name, target = page.locator('[data-classroom-screen]')) {
  const bytes = await target.screenshot();
  await sharp(bytes)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 83 })
    .toFile(join(root, 'public/images', name));
}
try {
  await page.goto(base + '/classroom-preview');
  const room = page.getByRole('complementary', { name: '小海老师的立体教室' });
  await expect(room).toHaveAttribute('data-renderer', 'webgl');
  await expect(page.locator('iframe')).toHaveAttribute('src', /v6.html/);
  await page.locator('[data-classroom-screen]').scrollIntoViewIfNeeded();
  trimStart = (Date.now() - captureStarted) / 1000 + 0.1;
  await page.waitForTimeout(1200);
  await photo('classroom-preview.webp');
  const turn = await stopAt('two-groups');
  await expect(room.locator('[data-raised-hand]')).toHaveCount(1);
  await turn.getByRole('button', { name: '两盒，一共2个', exact: true }).click();
  await turn.getByRole('button', { name: '听朵朵怎么想', exact: true }).click();
  await expect(turn.getByText(/朵朵：我猜/)).toBeVisible();
  await expect(turn.getByRole('button', { name: '准备好啦，继续' })).toBeDisabled();
  await photo('classmate-preview.webp');
  await page.waitForTimeout(2200);
  await turn.getByRole('button', { name: '听老师帮忙检查' }).click();
  await expect(room).toHaveAttribute('data-speaking', 'true');
  await expect
    .poll(() =>
      page
        .frameLocator('iframe')
        .locator('audio')
        .evaluateAll((nodes) => nodes.filter((n) => !n.paused).length),
    )
    .toBe(1);
  await page.waitForTimeout(4500); // A short actual operation clip, no fabricated animation or learner records.
  await turn.getByRole('button', { name: '我看懂老师的纠正啦' }).click();
  await turn.getByRole('button', { name: '两盒，每盒2个', exact: true }).click();
  await turn.getByRole('button', { name: '准备好啦，继续' }).click();
  const game = await stopAt('three-groups');
  for (let i = 1; i <= 3; i++)
    for (let j = 0; j < 2; j++)
      await game.getByRole('button', { name: new RegExp(`^小盒${i}，`) }).click();
  await game.getByRole('button', { name: '我摆好啦' }).click();
  await expect(
    game.getByText(story.chapters[0].shots[2].pause.success, { exact: true }),
  ).toBeVisible();
  await photo('game-preview.webp', game);
  await page.waitForTimeout(2200);
  const video = page.video();
  await context.close();
  const rawClip = join(work, 'raw-tour.webm');
  await video.saveAs(rawClip);
  const playwrightTools = join(process.env.LOCALAPPDATA, 'ms-playwright');
  const ffmpegFolder = readdirSync(playwrightTools).find((n) => n.startsWith('ffmpeg-'));
  if (!ffmpegFolder) throw new Error('Existing Playwright video tool is missing');
  execFileSync(
    join(playwrightTools, ffmpegFolder, 'ffmpeg-win64.exe'),
    [
      '-ss',
      String(trimStart),
      '-i',
      rawClip,
      '-an',
      '-c:v',
      'libvpx',
      '-b:v',
      '900k',
      '-y',
      join(root, 'public/media/classroom-tour.webm'),
    ],
    { stdio: 'pipe' },
  );
  const home = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await home.goto(base);
  await expect(home.getByRole('heading', { level: 1 })).toBeVisible();
  for (const title of ['School Learning', 'Personal AI Tutor', 'Interactive Classroom'])
    await expect(home.getByText(title, { exact: true })).toBeVisible();
  const clip = home.locator('video');
  await clip.evaluate((v) => v.play());
  await expect.poll(() => clip.evaluate((v) => v.videoWidth)).toBeGreaterThan(0);
  await expect.poll(() => clip.evaluate((v) => v.currentTime)).toBeGreaterThan(1);
  await clip.evaluate((v) => v.pause());
  await home.screenshot({ path: join(work, 'home-desktop.png'), fullPage: true });
  await home.getByRole('button', { name: 'Switch to English' }).click();
  await expect(home.getByRole('heading', { name: 'Choose your starting point.' })).toBeVisible();
  await home.getByRole('button', { name: '切换中文' }).click();
  await home.setViewportSize({ width: 390, height: 844 });
  if (await home.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw new Error('Home overflows on phone');
  await home.screenshot({ path: join(work, 'home-mobile.png'), fullPage: true });
  await home.goto(base + '/classroom-preview');
  await expect(home.getByRole('complementary', { name: '小海老师的立体教室' })).toBeVisible();
  if (await home.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw new Error('Preview overflows on phone');
  await home.screenshot({ path: join(work, 'preview-mobile.png'), fullPage: true });
  if (apiCalls || errors.length)
    throw new Error(
      'Public preview used learner API or crashed: ' + JSON.stringify({ apiCalls, errors }),
    );
  console.log(
    JSON.stringify({
      passed: true,
      publicLearnerApiCalls: apiCalls,
      actualScreenshots: 3,
      recordedSilentClip: true,
      teacherCorrectionAndSingleAudio: true,
      mobileAndLanguageToggle: true,
    }),
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
