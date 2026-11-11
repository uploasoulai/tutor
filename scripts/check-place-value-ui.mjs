/** Real native classroom renderer; isolated local browser, no learner or model request. */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { chromium, expect } from '@playwright/test';
const root = resolve(import.meta.dirname, '..');
const work = join(root, 'data/place-value-ui-check');
mkdirSync(work, { recursive: true });
const require = createRequire(join(root, 'data/video-lesson-pilot/package.json'));
await require('esbuild').build({
  stdin: {
    contents: `import React from'react';import{createRoot}from'react-dom/client';
import{InteractiveRenderer}from'./components/scene-renderers/interactive-renderer';
import{reviewedSchoolActivity}from'./lib/curriculum/reviewed-school-activities';
const activity=reviewedSchoolActivity('china','pep:'+(new URLSearchParams(location.search).get('topic')||'cnm_p053'));
createRoot(document.getElementById('app')).render(<div style={{height:620}}><InteractiveRenderer content={{type:'interactive',html:activity.html,url:''}} sceneId="place-value"/></div>);`,
    resolveDir: root,
    loader: 'tsx',
  },
  bundle: true,
  outfile: join(work, 'app.js'),
  platform: 'browser',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
});
const server = createServer((req, res) => {
  res.setHeader('Content-Type', req.url === '/app.js' ? 'text/javascript' : 'text/html');
  res.end(
    req.url === '/app.js'
      ? readFileSync(join(work, 'app.js'))
      : '<meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}iframe{width:100%;height:100%;border:0}</style><div id="app"></div><script src="/app.js"></script>',
  );
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const url = `http://127.0.0.1:${server.address().port}`;
  await page.goto(url);
  const frame = page.frameLocator('iframe');
  const plus = (unit) => frame.getByRole('button', { name: '加一个' + unit, exact: true });
  const minus = (unit) => frame.getByRole('button', { name: '减一个' + unit, exact: true });
  const count = async (unit, n) => {
    for (let i = 0; i < n; i++) await plus(unit).click();
  };
  const number = frame.locator('#number');
  const status = frame.locator('#feedback');
  await expect(number).toHaveText('现在搭出的数：0');
  await expect(minus('百')).toBeDisabled();
  await frame.getByRole('button', { name: '检查我的搭法' }).click();
  await expect(status).toContainText('还不是 243');
  await count('百', 2);
  await count('十', 4);
  await count('一', 3);
  await expect(number).toHaveText('现在搭出的数：243');
  await expect(frame.getByRole('img', { name: '2 个百', exact: true }).locator('svg')).toHaveCount(
    2,
  );
  await expect(frame.getByRole('img', { name: '4 个十', exact: true }).locator('svg')).toHaveCount(
    4,
  );
  await expect(frame.getByRole('img', { name: '3 个一', exact: true }).locator('svg')).toHaveCount(
    3,
  );
  await frame.getByRole('button', { name: '检查我的搭法' }).click();
  await expect(frame.locator('body')).toHaveAttribute('data-complete', 'true');
  await expect(status).toContainText('2 个百（200） + 4 个十（40） + 3 个一（3）');
  await frame.locator('body').screenshot({ path: join(work, '243-mobile.png') });
  await minus('一').click();
  await expect(number).toHaveText('现在搭出的数：242');
  await expect(frame.locator('body')).toHaveAttribute('data-complete', 'false');
  await frame.getByRole('button', { name: '重新搭一搭' }).click();
  await expect(number).toHaveText('现在搭出的数：0');
  await plus('百').focus();
  await page.keyboard.press('Enter');
  await count('百', 8);
  await expect(plus('百')).toBeDisabled();
  await expect(number).toHaveText('现在搭出的数：900');
  const actualFrame = page.frames().find((item) => item.parentFrame());
  if (await actualFrame.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw new Error('Mobile overflow');
  await page.setViewportSize({ width: 1120, height: 900 });
  await page.goto(url + '?topic=cnm_p055');
  await count('千', 2);
  await count('十', 4);
  await count('一', 6);
  await expect(number).toHaveText('现在搭出的数：2046');
  await expect(frame.getByRole('img', { name: '0 个百', exact: true }).locator('svg')).toHaveCount(
    0,
  );
  await frame.getByRole('button', { name: '检查我的搭法' }).click();
  await expect(frame.locator('body')).toHaveAttribute('data-complete', 'true');
  await frame.locator('body').screenshot({ path: join(work, '2046-desktop.png') });
  await plus('百').click();
  await frame.getByRole('button', { name: '检查我的搭法' }).click();
  await expect(status).toContainText('还不是 2046');
  await expect(number).toHaveText('现在搭出的数：2146');
  if (errors.length) throw new Error(errors.join('; '));
  console.log(
    'Place-value native UI passed: visible quantities, 243/2046, internal zero, wrong-answer feedback, boundaries, keyboard, reset and mobile layout.',
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
