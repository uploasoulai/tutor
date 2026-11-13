/** Isolated component interaction/visual check. APIs are mocked; no learner account is used. */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { chromium, expect } from '@playwright/test';
const root = resolve(import.meta.dirname, '..');
const work = join(root, 'data/multiplication-ui-check');
mkdirSync(work, { recursive: true });
const pilotRequire = createRequire(join(root, 'data/video-lesson-pilot/package.json'));
const { build } = pilotRequire('esbuild');
const questions = [
  { id: 'cnm_p038_q2', prompt: '3 个 2 相加，和是多少？' },
  { id: 'cnm_p038_q3', prompt: '每组有 3 人，有这样的 4 组。一共有多少人？' },
];
await build({
  stdin: {
    contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import {MultiplicationPilot} from './components/learning/multiplication-pilot'; createRoot(document.getElementById('app')).render(<MultiplicationPilot questions={${JSON.stringify(questions)}} preview={new URLSearchParams(location.search).has('preview')}/>);`,
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
    path === '/lessons/multiplication-narrated-v2.html' ||
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
let phase = 'question',
  status = 'planned',
  exists = false,
  recordCreates = 0,
  writes = 0,
  correct = [];
const id = '22222222-2222-5222-a222-222222222222';
try {
  await page.route('**/api/**', async (route) => {
    const req = route.request();
    let result = { sessionId: id, phase, status, correctQuestionIds: correct };
    if (req.method() === 'POST') {
      const body = req.postDataJSON();
      if (req.url().includes('/attempt')) {
        if (body.learningSessionId !== id) throw new Error('Answer lost learner session');
        const right = body.response === (body.questionId === 'cnm_p038_q2' ? '6' : '12');
        if (right) correct = [...new Set([...correct, body.questionId])];
        writes++;
        result = { correct: right };
      } else if (body.action === 'bookmark') {
        if (!exists) {
          exists = true;
          recordCreates++;
          writes++;
        }
      } else if (body.action === 'start') {
        status = 'started';
        phase = 'question';
        writes++;
      } else {
        phase = body.phase ?? 'completed';
        if (body.action === 'complete') status = 'completed';
        writes++;
      }
      if (!req.url().includes('/attempt'))
        result = { sessionId: id, phase, status, correctQuestionIds: correct };
    }
    await route.fulfill({ json: { success: true, ...result } });
  });
  await page.goto(address);
  await expect(page.getByRole('heading', { name: '这节试课已存入你的学习档案' })).toBeVisible();
  if (recordCreates !== 1 || status !== 'planned') throw new Error('Bookmark claimed study');
  await page.goto(address);
  await expect(page.getByRole('heading', { name: '这节试课已存入你的学习档案' })).toBeVisible();
  if (recordCreates !== 1) throw new Error('Repeated opening duplicated profile record');
  await page.getByRole('button', { name: '开始二年级试课' }).click();
  await page.getByRole('button', { name: '图形二', exact: true }).click();
  await expect(page.getByRole('button', { name: '看老师讲一讲' })).toBeDisabled();
  await page.getByRole('button', { name: '图形一', exact: true }).click();
  await page.getByRole('button', { name: '看老师讲一讲' }).click();
  await expect(page.locator('iframe')).toHaveAttribute(
    'src',
    /multiplication-narrated-v2.html#chapter=explain$/,
  );
  await page.frameLocator('iframe').getByRole('button', { name: '播放讲解', exact: true }).click();
  await expect(
    page.frameLocator('iframe').getByRole('button', { name: '暂停讲解', exact: true }),
  ).toBeVisible();
  const room = page.getByRole('complementary', { name: '小海老师的立体教室' });
  await expect(room).toHaveAttribute('data-renderer', 'webgl');
  await expect(room).toHaveAttribute('data-speaking', 'true');
  await expect(page.locator('[data-classroom-screen="integrated"] iframe')).toHaveCount(1);
  await page
    .locator('[data-classroom-screen="integrated"]')
    .screenshot({ path: join(work, 'integrated-classroom.png') });
  await room.screenshot({ path: join(work, '3d-room.png') });
  await page.getByRole('button', { name: '切换专注模式' }).click();
  await expect(room).toHaveCount(0);
  await expect(
    page.frameLocator('iframe').getByRole('button', { name: '暂停讲解', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '进入虚拟教室' }).click();
  await expect(room).toHaveAttribute('data-renderer', 'webgl');
  await page.getByRole('button', { name: '我来摆一摆' }).click();
  await expect(page.getByRole('button', { name: '看看为什么这样写' })).toBeDisabled();
  await page.evaluate(() =>
    window.postMessage(
      { channel: 'coastaltutor-grouping', version: 1, event: 'progress', complete: true },
      '*',
    ),
  );
  await expect(page.getByRole('button', { name: '看看为什么这样写' })).toBeDisabled();
  const fillGroups = async () => {
    for (let i = 1; i <= 6; i++) {
      await page
        .frameLocator('iframe')
        .getByRole('button', { name: '第 ' + i + ' 个圆片', exact: true })
        .click();
      await page
        .frameLocator('iframe')
        .getByRole('button', { name: new RegExp('^第 ' + Math.ceil(i / 2) + ' 个盒子') })
        .click();
    }
  };
  await fillGroups();
  await expect(page.getByRole('button', { name: '看看为什么这样写' })).toBeEnabled();
  await page.frameLocator('iframe').getByRole('button', { name: '重新分一分' }).click();
  await expect(page.getByRole('button', { name: '看看为什么这样写' })).toBeDisabled();
  await fillGroups();
  await page.screenshot({ path: join(work, 'desktop-practice.png'), fullPage: true });
  await page.getByRole('button', { name: '看看为什么这样写' }).click();
  await expect(page.locator('iframe')).toHaveAttribute('src', /chapter=reason$/);
  await page.getByRole('button', { name: '试试两个新问题' }).click();
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.getByLabel(questions[0].prompt).fill('5');
  await page.getByRole('button', { name: '提交答案' }).click();
  await expect(page.getByRole('button', { name: /请我的家教引导一下/ })).toBeVisible();
  await page.getByLabel(questions[0].prompt).fill('6');
  await page.getByRole('button', { name: '提交答案' }).click();
  await page.getByLabel(questions[1].prompt).fill('12');
  await page.getByRole('button', { name: '提交答案' }).click();
  await page.getByRole('button', { name: '记住今天的发现' }).click();
  await expect(page.locator('iframe')).toHaveAttribute('src', /chapter=recap$/);
  await page.getByRole('button', { name: '完成并保存学习记录' }).click();
  await expect(page.getByRole('heading', { name: '二年级试课完成了！' })).toBeVisible();
  const previousWrites = writes;
  await page.getByRole('button', { name: '回看讲解和操作' }).click();
  await page.getByRole('button', { name: '我来摆一摆' }).click();
  await page.getByRole('button', { name: '看看为什么这样写' }).click();
  await page.getByRole('button', { name: '回看今天的发现' }).click();
  await page.getByRole('button', { name: '结束回看' }).click();
  if (writes !== previousWrites) throw new Error('Review created new attempts or progress writes');
  status = 'started';
  phase = 'practice';
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(address + '?sessionId=' + id);
  await expect(page.getByRole('heading', { name: '亲手摆出 3 个 2' })).toBeVisible();
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw new Error('Phone overflow');
  await page.screenshot({ path: join(work, 'mobile-practice.png'), fullPage: true });
  phase = 'video';
  await page.goto(address + '?sessionId=' + id);
  await expect(
    page.frameLocator('iframe').getByRole('button', { name: '播放讲解', exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: join(work, 'mobile-video.png'), fullPage: true });
  await page.unroute('**/api/**');
  await page.route('**/api/**', (route) =>
    route.fulfill({ status: 503, json: { success: false, error: '档案服务暂时不可用' } }),
  );
  await page.goto(address);
  await expect(page.getByRole('heading', { name: '暂时还没有保存这节试课' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '这节试课已存入你的学习档案' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '开始二年级试课' })).toBeDisabled();
  let previewCalls = 0;
  await page.unroute('**/api/**');
  await page.route('**/api/**', (route) => {
    previewCalls++;
    return route.fulfill({ status: 500, json: { success: false } });
  });
  await page.goto(address + '?preview=1');
  await page.getByRole('button', { name: '开始二年级体验' }).click();
  await page.getByRole('button', { name: '图形一', exact: true }).click();
  await page.getByRole('button', { name: '看老师讲一讲' }).click();
  await expect(page.getByRole('complementary', { name: '小海老师的立体教室' })).toHaveAttribute(
    'data-renderer',
    'webgl',
  );
  await page.getByRole('button', { name: '我来摆一摆' }).click();
  await fillGroups();
  await page.getByRole('button', { name: '看看为什么这样写' }).click();
  await page.getByRole('button', { name: '试试一个小问题' }).click();
  await page.getByRole('button', { name: '6', exact: true }).click();
  await page.getByRole('button', { name: '记住今天的发现' }).click();
  await page.getByRole('button', { name: '结束体验' }).click();
  await expect(page.getByRole('heading', { name: '二年级课堂体验完成了！' })).toBeVisible();
  if (previewCalls !== 0) throw new Error('Preview touched a learner API');
  // Device fallback keeps teaching usable without a graphics context.
  const fallbackPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await fallbackPage.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === 'webgl' ? null : original.call(this, type, ...args);
    };
  });
  await fallbackPage.goto(address + '?preview=1');
  await fallbackPage.getByRole('button', { name: '开始二年级体验' }).click();
  await fallbackPage.getByRole('button', { name: '图形一', exact: true }).click();
  await fallbackPage.getByRole('button', { name: '看老师讲一讲' }).click();
  await expect(fallbackPage.getByRole('img', { name: '微笑的小海老师' })).toBeVisible();
  await expect(
    fallbackPage.frameLocator('iframe').getByRole('button', { name: '播放讲解', exact: true }),
  ).toBeVisible();
  await fallbackPage.screenshot({ path: join(work, 'static-teacher-mobile.png'), fullPage: true });
  await fallbackPage.close();
  console.log(
    'Grade-2 UI passed: one saved profile reference, explicit start, six steps, actual grouping/clear gate, owner-session answers, Tutor handoff, review without writes, phone resume, real 3D teacher/focus, role-preview without learner API calls and static fallback.',
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
