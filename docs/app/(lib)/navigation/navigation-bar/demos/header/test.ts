import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('header renders the bar with its home link', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  await expect(demo.getByRole('link', { name: 'FairGarden home' })).toBeVisible()
  await expect(demo.getByRole('navigation', { name: 'Main' })).toBeVisible()

  // A working demo mounts and renders its content without throwing.
  expect(pageErrors, 'the demo should mount without uncaught errors').toEqual([])
})

for (const colorScheme of ['light', 'dark'] as const) {
  for (const width of [390, 1280]) {
    test.describe(`at ${width}px in ${colorScheme} mode`, () => {
      // Tall enough that the preview is on screen whole.
      test.use({ viewport: { width, height: 1400 }, colorScheme, reducedMotion: 'reduce' })

      test('header matches its screenshot', { tag: '@screenshot' }, async ({ page }) => {
        await page.goto(route)
        const demo = page.locator('.demo').first()
        // The preview remounts, losing its state, when the demo's code content replaces the loading
        // fallback. The tabs are disabled until then, so wait for them before interacting.
        await expect(
          demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
        ).toHaveCount(0, { timeout: 15000 })
        // The Demo's preview surface, the container the rendered demo sits in, without its
        // code (a CSS Module class, whose local name is stable across builds).
        const preview = demo.locator('[class*="__preview"]').first()
        await page.evaluate(() => document.fonts.ready)

        await expect(preview).toHaveScreenshot(`header-${width}-${colorScheme}.png`)
      })
    })
  }
}
