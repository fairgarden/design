import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('sides opens a panel on each side of its trigger', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  for (const [label, side] of [
    ['Above', 'top'],
    ['Right', 'right'],
    ['Below', 'bottom'],
    ['Left', 'left'],
  ] as const) {
    const trigger = demo.getByRole('button', { name: label })
    await trigger.click()
    const panel = page.getByRole('dialog').filter({ hasText: 'Trailhead parking opens at dawn.' })
    await expect(panel).toBeVisible()
    await expect(panel).toHaveAttribute('data-side', side)
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(trigger).toBeFocused()
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

for (const colorScheme of ['light', 'dark'] as const) {
  for (const width of [390, 1280]) {
    test.describe(`at ${width}px in ${colorScheme} mode`, () => {
      test.use({ viewport: { width, height: 900 }, colorScheme, reducedMotion: 'reduce' })

      test('sides matches its screenshot with a panel and its tail open', { tag: '@screenshot' }, async ({ page }) => {
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

        await demo.getByRole('button', { name: 'Above' }).click()
        const panel = page.getByRole('dialog').filter({ hasText: 'Trailhead parking opens at dawn.' })
        await expect(panel).toBeVisible()
        await page.evaluate(() => document.fonts.ready)

        // The preview, and the panel where it spills past the preview's edge on a phone.
        const [a, b] = [(await preview.boundingBox())!, (await panel.boundingBox())!]
        const x = Math.floor(Math.min(a.x, b.x))
        const y = Math.floor(Math.min(a.y, b.y))
        const clip = {
          x,
          y,
          width: Math.ceil(Math.max(a.x + a.width, b.x + b.width)) - x,
          height: Math.ceil(Math.max(a.y + a.height, b.y + b.height)) - y,
        }
        await expect(page).toHaveScreenshot(`sides-open-${width}-${colorScheme}.png`, { clip })
      })
    })
  }
}
