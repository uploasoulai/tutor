/** Actual learner components; isolated mock APIs, no account or production data. */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { chromium, expect } from '@playwright/test';
const root = resolve(import.meta.dirname, '..'),
  work = join(root, 'data/library-assessment-ui');
mkdirSync(work, { recursive: true });
const { build } = createRequire(join(root, 'data/video-lesson-pilot/package.json'))('esbuild');
await build({
  stdin: {
    contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {AssessmentSpace} from './components/learning/assessment-space';import {CourseLibraryBoard} from './components/learning/course-library-board';const p=new URLSearchParams(location.search);createRoot(document.getElementById('app')).render(p.has('library')?<CourseLibraryBoard/>:<AssessmentSpace preview={p.has('preview')}/>);`,
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
      name: 'link',
      setup(api) {
        api.onResolve({ filter: /^next\/link$/ }, () => ({ path: 'link', namespace: 'local' }));
        api.onLoad({ filter: /.*/, namespace: 'local' }, () => ({
          loader: 'js',
          contents:
            'import React from "react";export default function Link({children,prefetch,...props}){return React.createElement("a",props,children)}',
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
const server = createServer((req, res) => {
  if (req.url === '/app.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.end(readFileSync(join(work, 'app.js')));
  } else if (req.url === '/test.css') {
    res.setHeader('Content-Type', 'text/css');
    res.end(css);
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.end(
      '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/test.css"><main style="max-width:1100px;margin:auto;padding:20px"><div id="app"></div></main><script src="/app.js"></script>',
    );
  }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }),
    errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  let preview = false,
    submitted = 0;
  const config = {
    grade: 2,
    subject: 'math',
    term: '上',
    scope: 'unit',
    count: 5,
    units: ['认识乘法'],
  };
  const questions = [
    {
      id: 'q1',
      topicId: 'cnm_p038',
      topicName: '认识乘法',
      type: 'numeric',
      prompt: '2组圆片，每组3个，一共有几个？',
    },
    {
      id: 'q2',
      topicId: 'cnm_p038',
      topicName: '认识乘法',
      type: 'choice',
      prompt: '3+3可以写成哪个乘法？',
      choices: [
        { key: 'A', text: '2×3' },
        { key: 'B', text: '3×3' },
      ],
    },
  ];
  const report = {
    total: 2,
    answered: 2,
    correct: 1,
    score: 50,
    topics: [{ topicId: 'cnm_p038', name: '认识乘法', total: 2, answered: 2, correct: 1 }],
    results: [
      { ...questions[0], questionId: 'q1', response: '5', answered: true, correct: false },
      { ...questions[1], questionId: 'q2', response: 'A', answered: true, correct: true },
    ],
  };
  await page.route('**/api/school-assessments**', async (route) => {
    const req = route.request();
    let body;
    if (req.method() === 'POST') {
      const data = req.postDataJSON();
      if (data.action === 'start')
        body = {
          config,
          questions,
          preview,
          ...(!preview ? { id: '22222222-2222-4222-8222-222222222222' } : {}),
        };
      else {
        expect(data.action).toBe(preview ? 'preview-grade' : 'submit');
        expect(data.answers).toEqual({ q1: '5', q2: 'A' });
        submitted++;
        body = { report, preview };
      }
    } else
      body = {
        units: ['认识乘法'],
        selectedUnits: ['认识乘法'],
        subjects: [{ id: 'math', label: '数学' }],
        topicCount: 3,
        papers: [
          {
            id: 'new-paper',
            config,
            report: {
              ...report,
              results: [
                { ...report.results[0], correct: true },
                { ...report.results[0], questionId: 'q3', prompt: '9减3等于多少？', response: '5' },
              ],
            },
          },
          { id: 'old-paper', config, report },
        ],
      };
    await route.fulfill({ json: { success: true, ...body } });
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  await page.goto(base);
  await page.getByRole('button', { name: '开始我的小测' }).click();
  await page.getByRole('textbox', { name: '第1题答案' }).fill('5');
  await page.getByRole('radio', { name: 'A. 2×3' }).check();
  await page.getByRole('button', { name: '完成并查看报告' }).click();
  await expect(page.getByText('完成啦！1 / 2 题答对 · 50分')).toBeVisible();
  await expect(page.locator('form[action="/api/learning/launch"]')).toHaveAttribute(
    'method',
    'post',
  );
  await expect(page.locator('input[name="prompt"]')).toHaveValue(/我的回答：5/);
  await expect(page.getByRole('link', { name: '回到这个知识点' })).toHaveAttribute(
    'href',
    /cnm_p038/,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: join(work, 'mobile-report.png'), fullPage: true });
  await page.getByRole('button', { name: '错题与家教', exact: true }).click();
  await expect(page.getByRole('heading', { name: '我的课程错题与待巩固知识点' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '9减3等于多少？' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '2组圆片，每组3个，一共有几个？' })).toHaveCount(
    0,
  );
  await expect(page.getByRole('link', { name: /我的家教错题本/ })).toHaveAttribute(
    'href',
    '/api/learning/launch?mode=mistakes',
  );
  preview = true;
  await page.goto(`${base}/?preview=1`);
  await page.getByRole('button', { name: '预览这份小测' }).click();
  await page.getByRole('textbox', { name: '第1题答案' }).fill('5');
  await page.getByRole('radio', { name: 'A. 2×3' }).check();
  await page.getByRole('button', { name: '完成并查看报告' }).click();
  await expect(page.getByText('这是预览结果，没有保存学生成绩。', { exact: false })).toBeVisible();
  await expect(page.locator('form[action="/api/learning/launch"]')).toHaveCount(0);
  expect(submitted).toBe(2);
  const course = {
    id: 'one',
    cacheKey: 'same',
    createdAt: '2026-11-14',
    track: 'china',
    canonicalId: 'pep:cnm_p038',
    title: '认识乘法互动课',
    kind: 'generated',
    path: '/classroom/one',
    status: 'testing',
    checks: { pass: true },
    feedbackCount: 0,
    recommendations: 0,
    understood: 0,
    difficult: 0,
    issues: 0,
  };
  await page.route('**/api/course-library**', async (route) => {
    expect(new URL(route.request().url()).searchParams.get('trials')).toBe('1');
    await route.fulfill({
      json: {
        success: true,
        available: true,
        courses: [
          { ...course, id: 'two', title: '乘法的另一种讲法', createdAt: '2026-11-15' },
          course,
        ],
      },
    });
  });
  await page.goto(`${base}/?library=1`);
  await expect(page.getByRole('heading', { name: '认识乘法互动课' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '乘法的另一种讲法' })).toHaveCount(0);
  await page.getByRole('button', { name: '想换个讲法？看看其他版本' }).click();
  await expect(page.getByRole('heading', { name: '乘法的另一种讲法' })).toBeVisible();
  await page.screenshot({ path: join(work, 'mobile-library.png'), fullPage: true });
  expect(errors).toEqual([]);
  console.log(
    'Learning UI passed: real assessment form/report/handoff, preview isolation, mobile width, native mistake shortcut, shared trial default and optional alternative versions.',
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
