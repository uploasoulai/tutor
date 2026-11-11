/** Actual China course board with mocked APIs; no signed-in browser or learner record. */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { chromium, expect } from '@playwright/test';
const root = resolve(import.meta.dirname, '..');
const work = join(root, 'data/school-resume-ui-check');
mkdirSync(work, { recursive: true });
const { build } = createRequire(join(root, 'data/video-lesson-pilot/package.json'))('esbuild');
await build({
  stdin: {
    contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import Page from './app/school-learning/china/page'; createRoot(document.getElementById('app')).render(<Page/>);`,
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
      name: 'local-platform',
      setup(api) {
        api.onResolve({ filter: /^next\/navigation$/ }, () => ({
          path: 'navigation',
          namespace: 'local',
        }));
        api.onResolve({ filter: /lib\/supabase\/client$/ }, () => ({
          path: 'auth',
          namespace: 'local',
        }));
        api.onLoad({ filter: /.*/, namespace: 'local' }, (arg) => ({
          loader: 'js',
          contents:
            arg.path === 'auth'
              ? 'export function createClient(){return {auth:{getUser:async()=>({data:{user:{id:"test",user_metadata:{grade:2}}}})}}}'
              : 'export const useRouter=()=>({push:()=>{}});',
        }));
      },
    },
  ],
});
const css = readdirSync(join(root, '.next/static/chunks'))
  .filter((name) => name.endsWith('.css'))
  .map((name) => readFileSync(join(root, '.next/static/chunks', name), 'utf8'))
  .join('\n');
const server = createServer((request, response) => {
  if (request.url === '/app.js') {
    response.setHeader('Content-Type', 'application/javascript');
    response.end(readFileSync(join(work, 'app.js')));
  } else if (request.url === '/test.css') {
    response.setHeader('Content-Type', 'text/css');
    response.end(css);
  } else {
    response.setHeader('Content-Type', 'text/html');
    response.end(
      '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/test.css"><div id="app"></div><script src="/app.js"></script>',
    );
  }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
let status = 'failed';
let starts = 0;
let retries = 0;
let reads = 0;
const topic = {
  id: 'topic',
  name: '几个相同加数',
  grade: 2,
  chapter: '认识乘法',
  description: '用分组理解乘法',
  mastery_criteria: ['理解几个几'],
  subjectId: 'math',
  semester: '上',
};
try {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    let body;
    if (url.pathname === '/api/china-curriculum/lesson') {
      if (request.method() === 'POST') starts++;
      else reads++;
      body = {
        success: true,
        sessionId: 'saved-session',
        topicId: 'topic',
        jobId: 'saved-job',
        status,
        resumable: true,
        message: '已保留内容',
        error: status === 'failed' ? '这个环节未完成，前面的内容已保留。' : null,
        classroomUrl: status === 'succeeded' ? '/classroom/complete' : null,
      };
    } else if (url.pathname === '/api/generate-classroom/saved-job') {
      retries++;
      status = 'running';
      body = { success: true, status };
    } else if (url.searchParams.has('topicId'))
      body = {
        success: true,
        topic,
        subject: 'math',
        textbook: { id: 'pep', label: '数学课程', status: 'ready' },
        prerequisites: [],
        nextTopics: [],
        questions: [],
        standards: [],
      };
    else
      body = {
        success: true,
        subjects: [{ id: 'math', label: '数学', topicCount: 1 }],
        grades: [{ value: 2, label: '二年级' }],
        semesters: ['上'],
        textbooks: [],
        topics: [topic],
        recommendedTopic: null,
        total: 1,
        truncated: false,
        progressAvailable: true,
      };
    await route.fulfill({ json: body });
  });
  const address = `http://127.0.0.1:${server.address().port}/school-learning/china?topicId=topic&sessionId=saved-session`;
  await page.goto(address);
  await expect(page.getByRole('button', { name: '保留内容，继续准备' })).toBeVisible();
  await page.screenshot({ path: join(work, 'resume-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: '保留内容，继续准备' }).click();
  await expect(page.getByText('课堂正在准备', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('课堂正在准备', { exact: true })).toBeVisible();
  status = 'succeeded';
  await expect(page.getByRole('link', { name: '进入互动课堂' })).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('link', { name: '进入互动课堂' })).toHaveAttribute(
    'href',
    '/classroom/complete',
  );
  if (starts !== 0 || retries !== 1 || reads < 2)
    throw new Error('Resume unexpectedly started a new course');
  console.log(
    'School resume UI passed: saved URL, one retry, reload, ready link, no new course request.',
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
