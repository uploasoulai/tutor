/** Own isolated browser: real classroom renderer, no learner login or remote service. */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { chromium, expect } from '@playwright/test';
const root = resolve(import.meta.dirname, '..');
const work = join(root, 'data/widget-isolation-check');
mkdirSync(work, { recursive: true });
const require = createRequire(join(root, 'data/video-lesson-pilot/package.json'));
const probe = `<button id="try">Try</button><output id="result"></output><output id="bridge"></output><script>
let clicks=0;document.querySelector('#try').onclick=()=>{document.querySelector('#result').textContent=String(++clicks)};
try{parent.document.body.dataset.compromised='yes';document.querySelector('#result').textContent='exposed'}catch{document.querySelector('#result').textContent='parent-blocked'}
try{localStorage.setItem('widget-test','exposed');document.body.dataset.storage='exposed'}catch{document.body.dataset.storage='blocked'}
addEventListener('message',event=>{if(event.source===parent&&event.data.type==='highlight')document.querySelector('#bridge').textContent=event.data.target});
</script>`;
await require('esbuild').build({
  stdin: {
    contents: `import React from 'react';import{createRoot}from'react-dom/client';
import{InteractiveRenderer}from'./components/scene-renderers/interactive-renderer';
import{ThumbnailInteractive}from'./components/slide-renderer/components/ThumbnailInteractive';
import{useWidgetIframeStore}from'./lib/store/widget-iframe';
import{GROUPING_ACTIVITY_HTML}from'./lib/curriculum/grouping-activity';
const content={type:'interactive',url:'',html:location.search?GROUPING_ACTIVITY_HTML:${JSON.stringify(probe)}};
createRoot(document.getElementById('app')).render(<><div style={{height:500,position:'relative'}}><InteractiveRenderer content={content} sceneId="isolation"/></div><button onClick={()=>useWidgetIframeStore.getState().getSendMessage('isolation')?.('highlight',{target:'visible-object'})}>Teacher points</button><ThumbnailInteractive content={content} size={300}/></>);`,
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
      : '<div id="app"></div><script src="/app.js"></script>',
  );
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const url = `http://127.0.0.1:${server.address().port}`;
  await page.goto(url);
  const lesson = page.frameLocator('iframe[title="Interactive Scene isolation"]');
  await expect(lesson.locator('#result')).toHaveText('parent-blocked');
  await expect(lesson.locator('body')).toHaveAttribute('data-storage', 'blocked');
  await lesson.getByRole('button', { name: 'Try', exact: true }).click();
  await expect(lesson.locator('#result')).toHaveText('1');
  await page.getByRole('button', { name: 'Teacher points' }).click();
  await expect(lesson.locator('#bridge')).toHaveText('visible-object');
  const preview = page.frameLocator('iframe[title="Interactive Preview"]');
  await expect(preview.locator('#result')).toHaveText('parent-blocked');
  await expect(preview.locator('body')).toHaveAttribute('data-storage', 'blocked');
  if (await page.locator('body').getAttribute('data-compromised'))
    throw new Error('Parent exposed');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url + '?grouping');
  const chip = (n) => lesson.getByRole('button', { name: `第 ${n} 个圆片`, exact: true });
  const box = (n) => lesson.getByRole('button', { name: new RegExp(`^第 ${n} 个盒子`) });
  for (let n = 1; n <= 6; n++) {
    await chip(n).click();
    await box(Math.ceil(n / 2)).click();
  }
  await expect(lesson.getByRole('status')).toContainText('2 + 2 + 2 = 6');
  await lesson.getByRole('button', { name: '重新分一分' }).click();
  await expect(chip(1)).toBeVisible();
  console.log(
    'Widget isolation passed: parent/storage blocked in lesson and thumbnail; clicks, teacher messages and mobile grouping/reset still work.',
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
