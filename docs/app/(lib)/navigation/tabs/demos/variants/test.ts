import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('variants moves between tabs with the arrow keys and chooses with Enter', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting. (The code's
  // tabs: the preview has a disabled tab of its own.)
  await expect(
    demo.getByRole('tablist', { name: 'Files' }).locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const tablist = demo.getByRole('tablist').first()
  await expect(tablist).not.toHaveAccessibleName('Files')
  const tabs = tablist.getByRole('tab')
  await tabs.first().click()
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
  // Arrows move focus; Enter or Space chooses (manual activation).
  await page.keyboard.press('ArrowRight')
  await expect(tabs.nth(1)).toBeFocused()
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'false')
  await page.keyboard.press('Enter')
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'false')

  // A working demo mounts and renders its content without throwing.
  expect(pageErrors, 'the demo should mount without uncaught errors').toEqual([])
})

for (const colorScheme of ['light', 'dark'] as const) {
  for (const width of [390, 1280]) {
    test.describe(`at ${width}px in ${colorScheme} mode`, () => {
      // Tall enough that the preview is on screen whole.
      test.use({ viewport: { width, height: 1400 }, colorScheme, reducedMotion: 'reduce' })

      test('variants matches its screenshot', { tag: '@screenshot' }, async ({ page }) => {
        await page.goto(route)
        const demo = page.locator('.demo').first()
        // The preview remounts, losing its state, when the demo's code content replaces the loading
        // fallback. The tabs are disabled until then, so wait for them before interacting. (The
        // code's tabs: the preview has a disabled tab of its own.)
        await expect(
          demo
            .getByRole('tablist', { name: 'Files' })
            .locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
        ).toHaveCount(0, { timeout: 15000 })
        // The Demo's preview surface, the container the rendered demo sits in, without its
        // code (a CSS Module class, whose local name is stable across builds).
        const preview = demo.locator('[class*="__preview"]').first()
        await page.evaluate(() => document.fonts.ready)

        await expect(preview).toHaveScreenshot(`variants-${width}-${colorScheme}.png`)
      })
    })
  }
}
