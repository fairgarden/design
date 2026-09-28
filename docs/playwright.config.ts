import { defineConfig } from '@playwright/test'

// A port of its own, so the tests always get their own production server:
// never the dev server on the start script's port, nor any other running
// here.
const PORT = 3130

export default defineConfig({
  testDir: './app',
  testMatch: '**/test.ts',
  forbidOnly: !!process.env.CI,
  // `trace: 'on-first-retry'` below only ever produces a trace if retries are
  // allowed, and shared CI runners are slow enough that interactions race with
  // re-rendering component trees. A test that passes on retry is still reported
  // as flaky rather than green, and one that keeps failing now leaves a trace to
  // diagnose from.
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  // Screenshots sit beside the test that takes them (`test.ts-snapshots/`),
  // named without the platform: the browser always runs in the Playwright
  // image, whatever machine runs the tests.
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',
  // Screenshots only mean something from that image's browser: through
  // `pnpm test:e2e` (`docs browser` sets PLAYWRIGHT_SERVER) or inside the
  // image, as CI runs. Anywhere else the comparisons are skipped, not failed.
  ignoreSnapshots: !process.env.PLAYWRIGHT_SERVER && process.env.PLAYWRIGHT_BROWSERS_PATH !== '/ms-playwright',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      // Headroom for antialiasing, not for a changed component.
      maxDiffPixelRatio: 0.002,
    },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    viewport: { width: 1440, height: 900 },
    connectOptions: process.env.PLAYWRIGHT_SERVER
      ? { wsEndpoint: process.env.PLAYWRIGHT_SERVER }
      : undefined,
  },
  webServer: {
    command: `pnpm build && pnpm exec next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    timeout: 5 * 60 * 1000,
  },
})
