import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { chromium, expect } from '@playwright/test';
const root = resolve(import.meta.dirname, '..');
const work = join(root, 'data/grouping-ui-check');
mkdirSync(work, { recursive: true });
const require = createRequire(join(root, 'data/video-lesson-pilot/package.json'));
require('esbuild').buildSync({
  entryPoints: [join(root, 'lib/curriculum/grouping-activity.ts')],
  outfile: join(work, 'activity.cjs'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
});
const { GROUPING_ACTIVITY_HTML } = require(join(work, 'activity.cjs'));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', (route) => route.abort());
  await page.setContent(GROUPING_ACTIVITY_HTML);
  const box = (n) => page.getByRole('button', { name: new RegExp('^第 ' + n + ' 个盒子') });
  const chip = (n) => page.getByRole('button', { name: '第 ' + n + ' 个圆片', exact: true });
  await box(1).click();
  await expect(page.getByRole('status')).toContainText('先点上面的一个圆片');
  await chip(1).click();
  await box(1).click();
  await chip(2).click();
  await box(1).click();
  await expect(chip(1)).toBeHidden();
  await chip(3).click();
  await box(1).click();
  await expect(page.getByRole('status')).toContainText('已有 2 个');
  await box(2).click();
  await chip(4).click();
  await box(2).click();
  await chip(5).click();
  await box(3).click();
  await chip(6).click();
  await box(3).click();
  await expect(page.getByRole('status')).toContainText('2 + 2 + 2 = 6');
  if ((await page.locator('.dot').count()) !== 6) throw new Error('Object conservation failed');
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw new Error('Mobile overflow');
  await page.screenshot({ path: join(work, 'mobile-complete.png'), fullPage: true });
  await page.getByRole('button', { name: '重新分一分' }).click();
  await expect(chip(1)).toBeVisible();
  if ((await page.locator('.dot').count()) !== 0) throw new Error('Reset failed');
  await chip(1).focus();
  await page.keyboard.press('Enter');
  await box(2).focus();
  await page.keyboard.press('Enter');
  await expect(box(2)).toHaveAttribute('aria-label', '第 2 个盒子，已放 1 个');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.screenshot({ path: join(work, 'desktop.png'), fullPage: true });
  if (errors.length) throw new Error('Runtime error in reviewed activity');
  console.log(
    'Grouping UI passed: touch targets, full-box guard, six conserved objects, reset, keyboard, mobile.',
  );
} finally {
  await browser.close();
}
