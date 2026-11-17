/** One real course/player with local recorded AAC and isolated learner API fixtures. */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { chromium, expect } from '@playwright/test';
const root = resolve(import.meta.dirname, '..'),
  work = join(root, 'data/prepared-pilot-ui');
mkdirSync(work, { recursive: true });
const catalog = JSON.parse(
    readFileSync(
      join(root, 'curriculum_data/china/prepared/grade2-multiplication-v1.json'),
      'utf8',
    ),
  ),
  source = catalog.lessons[0];
const lesson = {
  ...source,
  questions: source.questions.map(
    ({
      answer: _answer,
      explanation: _explanation,
      explanationAudioId: _explanationAudioId,
      ...q
    }) => q,
  ),
};
const { build } = createRequire(join(root, 'data/video-lesson-pilot/package.json'))('esbuild');
await build({
  stdin: {
    contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {PreparedCoursePlayer} from './components/learning/prepared-adventure';createRoot(document.getElementById('app')).render(<PreparedCoursePlayer lesson={${JSON.stringify(lesson)}} preview={new URLSearchParams(location.search).has('preview')}/>);`,
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
      name: 'next-link',
      setup(api) {
        api.onResolve({ filter: /^next\/link$/ }, () => ({ path: 'link', namespace: 'local' }));
        api.onLoad({ filter: /.*/, namespace: 'local' }, () => ({
          loader: 'js',
          resolveDir: root,
          contents:
            'import React from "react";export default function Link({children,prefetch,...props}){return React.createElement("a",props,children)}',
        }));
      },
    },
  ],
});
const css = readdirSync(join(root, '.next/static/chunks'))
  .filter((n) => n.endsWith('.css'))
  .map((n) => readFileSync(join(root, '.next/static/chunks', n), 'utf8'))
  .join('\n');
const server = createServer((req, res) => {
  if (req.url === '/app.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.end(readFileSync(join(work, 'app.js')));
  } else if (req.url === '/style.css') {
    res.setHeader('Content-Type', 'text/css');
    res.end(css);
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.end(
      '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"><main style="padding:16px;background:#fff9ed"><div id="app"></div></main><script src="/app.js"></script>',
    );
  }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }),
    errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  let starts = 0,
    report = null;
  await page.route('**/api/course-library**', (r) =>
    r.fulfill({ status: 404, json: { success: false } }),
  );
  await page.route('**/api/prepared-course-media/**', (r) => {
    const id = new URL(r.request().url()).pathname.split('/').at(-1);
    const asset = catalog.assets.find((a) => a.id === id);
    return asset
      ? r.fulfill({
          contentType: 'audio/mp4',
          body: readFileSync(join(root, 'data/resource-audit-20261116/r2-upload', id + '.m4a')),
        })
      : r.fulfill({ status: 404 });
  });
  await page.route('**/api/school-assessments**', async (route) => {
    const req = route.request();
    if (req.method() === 'GET') {
      return route.fulfill({
        json: { success: true, config: { preparedLessonId: source.id }, report },
      });
    }
    const data = req.postDataJSON();
    if (data.action === 'start') {
      starts++;
      return route.fulfill({ json: { success: true, id: '22222222-2222-4222-8222-222222222222' } });
    }
    expect(data.action).toBe('submit');
    const results = source.questions.map((q) => ({
      questionId: q.id,
      topicId: q.topicId,
      topicName: q.topicName,
      prompt: q.prompt,
      response: data.answers[q.id],
      answered: true,
      correct: data.answers[q.id] === q.answer,
      explanation: q.explanation,
      explanationAudioId: q.explanationAudioId,
    }));
    report = {
      correct: results.filter((r) => r.correct).length,
      total: 6,
      answered: 6,
      score: 83,
      results,
      topics: [],
    };
    return route.fulfill({ json: { success: true, report } });
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  await page.goto(base);
  await page.getByRole('button', { name: '开始我的探索' }).click();
  await expect(page.getByRole('img', { name: /两只小海豹/ })).toBeVisible();
  await page.screenshot({ path: join(work, 'story-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: '听老师说' }).click();
  await expect(page.getByRole('button', { name: '暂停声音' })).toBeVisible();
  await expect
    .poll(() => page.locator('audio').evaluate((a) => a.readyState))
    .toBeGreaterThanOrEqual(2);
  await page.getByRole('button', { name: '想明白了，下一小段 →' }).click();
  expect(await page.locator('audio').evaluate((a) => a.paused)).toBe(true);
  await page.getByRole('button', { name: '想明白了，下一小段 →' }).click();
  await page.getByRole('button', { name: '我来摆一摆 →' }).click();
  await page.getByRole('button', { name: '检查我的小任务' }).click();
  await expect(page.getByRole('status').filter({ hasText: '我们再看看' })).toBeVisible();
  await page.getByRole('button', { name: '再加一组' }).click();
  await page.getByRole('button', { name: '检查我的小任务' }).click();
  await expect(page.getByRole('status').filter({ hasText: '做到了' })).toBeVisible();
  await page.screenshot({ path: join(work, 'game-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: '我准备好，去试一试 →' }).click();
  for (const [i, q] of source.questions.entries()) {
    if (q.choices)
      await page
        .getByRole('radio', { name: q.choices.find((c) => c.key === q.answer).text, exact: true })
        .check();
    else
      await page.getByRole('textbox', { name: `第${i + 1}题答案` }).fill(i === 0 ? '0' : q.answer);
  }
  await page.getByRole('button', { name: '完成挑战，看看收获 ★' }).click();
  await expect(page.getByRole('heading', { name: '你完成了这次探索！' })).toBeVisible();
  await expect(page.locator('form[action="/api/learning/launch"]')).toHaveCount(1);
  await expect(page.locator('input[name="prompt"]')).toHaveValue(/我的回答：0/);
  await page.screenshot({ path: join(work, 'report-mobile.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: '你完成了这次探索！' })).toBeVisible();
  expect(starts).toBe(1);
  const ids = [...new Set(source.bindings.map((b) => b.assetId))];
  const decoded = await page.evaluate(async (ids) => {
    const context = new OfflineAudioContext(1, 1, 44100);
    const results = [];
    for (const id of ids) {
      const r = await fetch('/api/prepared-course-media/g2-multiply-01-v1/' + id);
      const b = await context.decodeAudioData(await r.arrayBuffer());
      const values = b.getChannelData(0);
      results.push({
        duration: b.duration,
        energy: values.reduce((n, v) => n + v * v, 0) / values.length,
      });
    }
    return results;
  }, ids);
  expect(decoded).toHaveLength(23);
  expect(decoded.every((b) => b.duration > 0.1 && b.energy > 0.000001)).toBe(true);
  expect(errors).toEqual([]);
  console.log(
    'Prepared pilot UI passed: story art, paused short narration, retry encouragement, conserved counters, six-question submission, own report resume, Socratic handoff, mobile width and 23 decoded non-silent recordings. No cloud/AI/production learner writes.',
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
