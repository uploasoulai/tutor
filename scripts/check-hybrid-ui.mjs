/** Isolated component interaction/visual check. APIs are mocked; no learner account is used. */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { chromium, expect } from '@playwright/test';
const root = resolve(import.meta.dirname, '..');
const work = join(root, 'data/hybrid-ui-check');
mkdirSync(work, { recursive: true });
const pilotRequire = createRequire(join(root, 'data/video-lesson-pilot/package.json'));
const { build } = pilotRequire('esbuild');
const questions = [
  {
    id: 'cnm_p226_q1',
    prompt: '把一个圆平均分成 4 份，涂了其中 3 份。涂色部分是这个圆的几分之几？',
  },
  {
    id: 'cnm_p226_q3',
    prompt: '把一根绳子平均分成 10 段，用去 7 段。用去的是这根绳子的几分之几？',
  },
];
await build({
  stdin: {
    contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import {HybridFractionsLesson} from './components/learning/hybrid-fractions-lesson'; createRoot(document.getElementById('app')).render(<HybridFractionsLesson questions={${JSON.stringify(questions)}}/>);`,
    resolveDir: root,
    loader: 'tsx',
  },
  bundle: true,
  outfile: join(work, 'app.js'),
  platform: 'browser',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [
    {
      name: 'local-next-link',
      setup(api) {
        api.onResolve({ filter: /^next\/link$/ }, () => ({ path: 'link', namespace: 'local' }));
        api.onLoad({ filter: /.*/, namespace: 'local' }, () => ({
          contents:
            'import React from "react"; export default function Link({children,...props}) { return <a {...props}>{children}</a> }',
          loader: 'tsx',
          resolveDir: root,
        }));
      },
    },
  ],
});
const css = readdirSync(join(root, '.next/static/chunks'))
  .filter((name) => name.endsWith('.css'))
  .map((name) => readFileSync(join(root, '.next/static/chunks', name), 'utf8'))
  .join('\n');
const html =
  '<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/test.css"><div id="app"></div><script src="/app.js"></script></html>';
const server = createServer((request, response) => {
  const path = new URL(request.url, 'http://localhost').pathname;
  if (path === '/app.js') {
    response.setHeader('Content-Type', 'application/javascript');
    response.end(readFileSync(join(work, 'app.js')));
  } else if (path === '/test.css') {
    response.setHeader('Content-Type', 'text/css');
    response.end(css);
  } else if (
    path === '/lessons/fractions-intro-v1.html' ||
    path === '/lessons/fractions-narrated-v2.html'
  ) {
    response.setHeader('Content-Type', 'text/html');
    response.end(readFileSync(join(root, 'public', path)));
  } else if (path === '/favicon.ico' || path.startsWith('/_next/')) {
    response.writeHead(404);
    response.end();
  } else {
    response.setHeader('Content-Type', 'text/html');
    response.end(html);
  }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const address = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
let phase = 'question';
let correct = [];
let writeRequests = 0;
try {
  await page.route('**/api/china-curriculum/**', async (route) => {
    const request = route.request();
    let result;
    if (request.method() === 'GET')
      result = {
        sessionId: '11111111-1111-4111-8111-111111111111',
        phase,
        correctQuestionIds: correct,
      };
    else {
      writeRequests += 1;
      const body = request.postDataJSON();
      if (request.url().endsWith('/attempt')) {
        const right = body.response === (body.questionId === 'cnm_p226_q1' ? '3/4' : '7/10');
        if (right) correct = [...new Set([...correct, body.questionId])];
        result = { correct: right };
      } else {
        if (body.phase) phase = body.phase;
        result = { sessionId: body.sessionId, phase };
      }
    }
    await route.fulfill({ json: { success: true, ...result } });
  });
  await page.goto(address);
  await page.getByRole('button', { name: '开始这节课' }).click();
  await expect(page.getByRole('button', { name: '看看分数是怎么来的' })).toBeDisabled();
  await page.getByRole('button', { name: '图形二', exact: true }).click();
  await expect(page.getByRole('button', { name: '看看分数是怎么来的' })).toBeDisabled();
  await page.getByRole('button', { name: '图形一', exact: true }).click();
  await page.getByRole('button', { name: '看看分数是怎么来的' }).click();
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(
    page.frameLocator('iframe').getByText('先确认：每份同样大', { exact: true }),
  ).toBeVisible();
  await page.frameLocator('iframe').getByRole('button', { name: '播放讲解', exact: true }).click();
  await expect(
    page.frameLocator('iframe').getByRole('button', { name: '暂停讲解', exact: true }),
  ).toBeVisible();
  await page.evaluate(() =>
    window.postMessage(
      { channel: 'coastaltutor-reviewed-video', version: 2, chapter: 'explain', event: 'error' },
      '*',
    ),
  );
  await expect(page.getByText('讲解暂时无法播放？可以先查看图解，课程仍能继续。')).toHaveCount(0);
  await page.getByRole('button', { name: '看不到或听不清？查看图解' }).click();
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.getByRole('button', { name: '回到配音讲解' }).click();
  await expect(
    page.frameLocator('iframe').getByRole('button', { name: '播放讲解', exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: join(work, 'desktop-video.png'), fullPage: true });
  await page.getByRole('button', { name: '我来动手试试' }).click();
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.getByRole('button', { name: /^第 1 份/ }).click();
  await page.getByRole('button', { name: /^第 2 份/ }).click();
  await page.getByRole('button', { name: '检查一下' }).click();
  await expect(page.getByRole('button', { name: /看看为什么这样写/ })).toHaveCount(0);
  await page.getByRole('button', { name: /^第 3 份/ }).click();
  await page.getByRole('button', { name: '检查一下' }).click();
  await expect(page.getByRole('button', { name: /^第 3 份/ })).toHaveCSS(
    'background-color',
    'rgb(101, 203, 176)',
  );
  await page.screenshot({ path: join(work, 'desktop-practice.png'), fullPage: true });
  await page.getByRole('button', { name: /看看为什么这样写/ }).click();
  await expect(page.locator('iframe')).toHaveAttribute('src', /chapter=reason$/);
  await page.getByRole('button', { name: /试试新的问题/ }).click();
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.getByLabel(questions[0].prompt).fill('2/4');
  await page.getByRole('button', { name: '提交答案' }).click();
  await expect(page.getByRole('button', { name: /请我的家教引导一下/ })).toBeVisible();
  await page.getByLabel(questions[0].prompt).fill('3/4');
  await page.getByRole('button', { name: '提交答案' }).click();
  await page.getByLabel(questions[1].prompt).fill('7/10');
  await page.getByRole('button', { name: '提交答案' }).click();
  await page.getByRole('button', { name: '看看今天的发现' }).click();
  await expect(page.locator('iframe')).toHaveAttribute('src', /chapter=recap$/);
  await page.getByRole('button', { name: '完成并保存学习记录' }).click();
  await expect(page.getByText('这次学习完成了！')).toBeVisible();
  const writesBeforeReview = writeRequests;
  await page.getByRole('button', { name: '回看讲解和操作' }).click();
  await expect(page.locator('iframe')).toHaveCount(1);
  await page.getByRole('button', { name: '我来动手试试' }).click();
  await page.getByRole('button', { name: /看看为什么这样写/ }).click();
  await page.getByRole('button', { name: /回看今天的发现/ }).click();
  await page.getByRole('button', { name: /结束回看/ }).click();
  await expect(page.getByText('这次学习完成了！')).toBeVisible();
  expect(writeRequests).toBe(writesBeforeReview);

  phase = 'practice';
  correct = [];
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${address}?sessionId=11111111-1111-4111-8111-111111111111`);
  await expect(page.getByRole('heading', { name: '请涂出这个整体的四分之三' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: join(work, 'mobile-practice.png'), fullPage: true });
  phase = 'video';
  await page.goto(`${address}?sessionId=11111111-1111-4111-8111-111111111111`);
  await expect(page.locator('iframe')).toHaveCount(1);
  await page.screenshot({ path: join(work, 'mobile-video.png'), fullPage: true });
  await page.route('**/lessons/fractions-narrated-v2.html*', (route) => route.abort());
  await page.goto(`${address}?sessionId=11111111-1111-4111-8111-111111111111`);
  await page.getByRole('button', { name: '看不到或听不清？查看图解' }).click();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: '先确认：每份同样大', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '我来动手试试' }).click();
  await expect(page.getByRole('heading', { name: '请涂出这个整体的四分之三' })).toBeVisible();
  console.log(
    'Hybrid UI checks passed: six steps, recorded player, fallback stops playback, spoofed message ignored, practice gate, mistake handoff, assessment/recap, read-only replay, resume, mobile width.',
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
