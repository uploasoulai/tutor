import { test, expect } from '../fixtures/base';
import { ClassroomPage } from '../pages/classroom.page';
import { createSettingsStorage } from '../fixtures/test-data/settings';
import { defaultTheme } from '../fixtures/test-data/scene-content';

const TEST_STAGE_ID = 'e2e-test-stage';

const SETTINGS_STORAGE = createSettingsStorage({ sidebarCollapsed: false });

/** Seed IndexedDB with stage + 3 scenes using raw IndexedDB API */
async function seedDatabase(page: import('@playwright/test').Page) {
  // Inject settings before navigating so it's available immediately on load
  await page.addInitScript((settings) => {
    localStorage.setItem('settings-storage', settings);
  }, SETTINGS_STORAGE);

  // Navigate to a stable static page first — it doesn't have any React logic or redirects,
  // making it perfect for seeding IndexedDB without context destruction.
  await page.goto('/e2e-seed.html', { waitUntil: 'networkidle' });

  // Now seed data by opening the DB at its current version (no upgrade).
  // Opening without a version number returns the current version without triggering
  // onupgradeneeded, so we can safely write to the already-initialized schema.
  await page.evaluate(
    ({ stageId, theme }) => {
      return new Promise<void>((resolve, reject) => {
        // Open with explicit version to ensure schema is created if DB is fresh
        const request = indexedDB.open('CoastalTutor-Database', 10);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('stages')) {
            db.createObjectStore('stages', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('scenes')) {
            db.createObjectStore('scenes', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('stageOutlines')) {
            db.createObjectStore('stageOutlines', { keyPath: 'stageId' });
          }
        };

        request.onsuccess = (event) => {
          try {
            const db = (event.target as IDBOpenDBRequest).result;
            const tx = db.transaction(['stages', 'scenes', 'stageOutlines'], 'readwrite');
            const now = Date.now();

            tx.objectStore('stages').put({
              id: stageId,
              name: '光合作用',
              description: '',
              language: 'zh-CN',
              style: 'professional',
              createdAt: now,
              updatedAt: now,
            });

            // Scene content uses SlideContent shape: { type: 'slide', canvas: Slide }
            const makeSlideContent = (title: string, elId: string) => ({
              type: 'slide',
              canvas: {
                id: `slide-${elId}`,
                viewportSize: 1000,
                viewportRatio: 0.5625,
                theme,
                elements: [
                  {
                    type: 'text',
                    id: `el-${elId}`,
                    content: title,
                    left: 50,
                    top: 50,
                    width: 900,
                    height: 100,
                  },
                ],
              },
            });

            const scenes = [
              {
                id: 'scene-0',
                stageId,
                type: 'slide',
                title: '基本概念',
                order: 0,
                content: makeSlideContent('基本概念', '0'),
                createdAt: now,
                updatedAt: now,
              },
              {
                id: 'scene-1',
                stageId,
                type: 'slide',
                title: '光反应',
                order: 1,
                content: makeSlideContent('光反应', '1'),
                createdAt: now,
                updatedAt: now,
              },
              {
                id: 'scene-2',
                stageId,
                type: 'slide',
                title: '暗反应',
                order: 2,
                content: makeSlideContent('暗反应', '2'),
                createdAt: now,
                updatedAt: now,
              },
            ];
            for (const scene of scenes) {
              tx.objectStore('scenes').put(scene);
            }

            tx.objectStore('stageOutlines').put({
              stageId,
              outlines: [],
              createdAt: now,
              updatedAt: now,
            });

            tx.oncomplete = () => {
              db.close();
              resolve();
            };
            tx.onerror = () => reject(new Error('Transaction failed: ' + tx.error?.message));
          } catch (err) {
            reject(new Error('Seeding failed: ' + (err as Error).message));
          }
        };

        request.onerror = () => reject(new Error('Open failed: ' + request.error?.message));
        request.onblocked = () => reject(new Error('Open blocked'));
      });
    },
    { stageId: TEST_STAGE_ID, theme: defaultTheme },
  );
}

test.describe('Classroom Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await seedDatabase(page);
  });

  test('loads classroom and switches scenes', async ({ page }) => {
    const classroom = new ClassroomPage(page);
    await classroom.goto(TEST_STAGE_ID);
    await classroom.waitForLoaded();

    // Sidebar shows 3 scenes
    await expect(classroom.sidebarScenes).toHaveCount(3, { timeout: 10_000 });

    // First scene title visible
    await expect(classroom.getSceneTitle(0)).toContainText('基本概念');

    // Click second scene
    await classroom.clickScene(1);

    // Verify second scene is now active — heading in the top bar shows the current scene name
    await expect(page.getByRole('heading', { name: '光反应' })).toBeVisible();
  });
});
