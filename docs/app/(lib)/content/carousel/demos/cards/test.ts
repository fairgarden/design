import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('cards brings the next slide to rest on the snap line', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const carousel = demo.getByRole('region', { name: 'Similar species' })
  const track = carousel.getByRole('region', { name: 'Slides' })
  const second = track.getByRole('listitem', { name: '2 of 6' })

  await carousel.getByRole('button', { name: 'Next' }).click()

  // How far the slide's start sits from the track's snap line (the start of its
  // scrollport, less any scroll padding), polled until the scroll comes to rest.
  const fromSnapLine = () =>
    second.evaluate((slide) => {
      const scroller = slide.closest<HTMLElement>('[role="region"]')!
      const padding = parseFloat(getComputedStyle(scroller).scrollPaddingInlineStart) || 0
      const line = scroller.getBoundingClientRect().left + scroller.clientLeft + padding
      return slide.getBoundingClientRect().left - line
    })
  await expect.poll(fromSnapLine).toBeCloseTo(0, 0)
  expect(await track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
  await expect(carousel.getByRole('button', { name: 'Previous' })).toBeVisible()

  // A working demo mounts and renders its content without throwing.
  expect(pageErrors, 'the demo should mount without uncaught errors').toEqual([])
})

for (const colorScheme of ['light', 'dark'] as const) {
  for (const width of [390, 1280]) {
    test.describe(`at ${width}px in ${colorScheme} mode`, () => {
      // Tall enough that the preview is on screen whole.
      test.use({ viewport: { width, height: 1400 }, colorScheme, reducedMotion: 'reduce' })

      test('cards matches its screenshot', { tag: '@screenshot' }, async ({ page }) => {
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

        await expect(preview).toHaveScreenshot(`cards-${width}-${colorScheme}.png`)
      })
    })
  }
}
