/** Isolated discovery-panel review; never signs in or calls a learning service. */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium, expect } from '@playwright/test';
const root = resolve(import.meta.dirname, '..');
const work = join(root, 'data/learning-guide-ui-check');
mkdirSync(work, { recursive: true });
const require = createRequire(join(root, 'data/video-lesson-pilot/package.json'));
await require('esbuild').build({
  stdin: {
    contents: `import React from'react';import{createRoot}from'react-dom/client';import{LearningSupportGuide}from'./components/learning-support-guide';createRoot(document.getElementById('app')).render(<LearningSupportGuide audience={location.search.includes('parent')?'parent':'student'}/>);`,
    resolveDir: root,
    loader: 'tsx',
  },
  bundle: true,
  platform: 'browser',
  jsx: 'automatic',
  outfile: join(work, 'app.js'),
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [
    {
      name: 'isolated-locale',
      setup(api) {
        api.onResolve({ filter: /^@\/lib\/hooks\/use-i18n$/ }, () => ({
          path: 'locale',
          namespace: 'local',
        }));
        api.onLoad({ filter: /.*/, namespace: 'local' }, () => ({
          contents:
            "export const useI18n=()=>({locale:location.search.includes('zh')?'zh-CN':'en-US'})",
        }));
      },
    },
  ],
});
const css = readdirSync(join(root, '.next/static/chunks'))
  .filter((name) => name.endsWith('.css'))
  .map((name) => readFileSync(join(root, '.next/static/chunks', name), 'utf8'))
  .join('\n');
const server = createServer((req, res) => {
  if (req.url === '/app.js') {
    res.setHeader('Content-Type', 'text/javascript');
    res.end(readFileSync(join(work, 'app.js')));
  } else if (req.url === '/style.css') {
    res.setHeader('Content-Type', 'text/css');
    res.end(css);
  } else {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(
      '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"><main style="max-width:1160px;margin:auto;padding:20px"><div id="app"></div></main><script src="/app.js"></script>',
    );
  }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', (error) => console.error('Isolated guide browser error:', error.message));
  const url = `http://127.0.0.1:${server.address().port}`;
  await page.goto(url + '?zh');
  console.log('Guide headings:', await page.locator('h2,h3').allTextContents());
  await expect(page.getByRole('heading', { name: '把错题变成下次的进步' })).toBeVisible();
  await expect(page.getByRole('link', { name: /把错题变成下次的进步/ })).toHaveAttribute(
    'href',
    '/api/learning/launch?mode=practice',
  );
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw new Error('Mobile overflow');
  await page.screenshot({ path: join(work, 'student-mobile.png'), fullPage: true });
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto(url + '?parent');
  await expect(
    page.getByRole('heading', { name: 'A 24/7 tutor for the moments your child needs help' }),
  ).toBeVisible();
  const links = await page
    .getByRole('link')
    .evaluateAll((items) => items.map((item) => item.getAttribute('href')));
  if (links.length !== 6 || links.some((href) => href !== '/api/learning/launch?mode=personal'))
    throw new Error('Parent route boundary failed');
  await page.screenshot({ path: join(work, 'parent-desktop.png'), fullPage: true });
  console.log(
    'Discovery UI passed: Chinese mobile layout, visible capabilities, real learner launch links and parent-safe routing.',
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
