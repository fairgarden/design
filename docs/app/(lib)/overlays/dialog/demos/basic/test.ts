import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

/**
 * Watches for a popup from before the action that opens it: on each of its
 * first `frames` frames on the page, how many animations run on it and beside
 * it in its portal (its clip, the morph frame, a fade) and its opacity.
 * Sampled in the page frame by frame, so a slow machine cannot miss a morph.
 */
function watchOpening(page: Page, selector: string, frames = 10) {
  return page.evaluate(
    ({ selector, frames }) =>
      new Promise<{ running: number; opacity: string }[]>((resolve) => {
        const samples: { running: number; opacity: string }[] = []
        let waited = 0
        const step = () => {
          const popup = document.querySelector<HTMLElement>(selector)
          if (popup) {
            samples.push({
              running: (popup.parentElement ?? popup)
                .getAnimations({ subtree: true })
                .filter((animation) => animation.playState === 'running').length,
              opacity: getComputedStyle(popup).opacity,
            })
          }
          waited += 1
          if (samples.length >= frames || waited > 600) resolve(samples)
          else requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }),
    { selector, frames },
  )
}

async function openDemo(page: Page) {
  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return demo
}

test('basic traps focus in the dialog and returns it to the trigger', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const trigger = demo.getByRole('button', { name: 'Rename Trail' })
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Rename Trail' })
  await expect(dialog).toBeVisible()
  // Focus starts on the first field in the body.
  await expect(dialog.getByRole('textbox')).toBeFocused()

  // Round the dialog's controls both ways, more times than it has them. Past either end, focus
  // lands on a guard beside the dialog that hands it straight back in.
  const focusInDialog = () => dialog.evaluate((element) => element.contains(document.activeElement))
  for (const key of ['Tab', 'Shift+Tab']) {
    for (let press = 1; press <= 8; press += 1) {
      await page.keyboard.press(key)
      await expect.poll(focusInDialog, `focus should stay in the dialog after ${press} × ${key}`).toBe(true)
    }
  }

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('basic grows its dialog out of the trigger when motion is allowed', async ({ page }) => {
  const demo = await openDemo(page)

  const opening = watchOpening(page, '[role="dialog"]')
  await demo.getByRole('button', { name: 'Rename Trail' }).click()

  // The counterpart of the reduced-motion test: the same watch sees the morph run.
  const samples = await opening
  expect(samples, 'the dialog should have opened').toHaveLength(10)
  expect(samples.some((sample) => sample.running > 0)).toBe(true)
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('basic opens its dialog at once', async ({ page }) => {
    const demo = await openDemo(page)

    const opening = watchOpening(page, '[role="dialog"]')
    await demo.getByRole('button', { name: 'Rename Trail' }).click()

    const samples = await opening
    expect(samples, 'the dialog should have opened').toHaveLength(10)
    expect(samples.filter((sample) => sample.running > 0 || sample.opacity !== '1')).toEqual([])
  })
})

for (const colorScheme of ['light', 'dark'] as const) {
  for (const width of [390, 1280]) {
    test.describe(`at ${width}px in ${colorScheme} mode`, () => {
      test.use({ viewport: { width, height: 900 }, colorScheme, reducedMotion: 'reduce' })

      test('basic matches its screenshot with the dialog open', { tag: '@screenshot' }, async ({ page }) => {
        const demo = await openDemo(page)
        await demo.getByRole('button', { name: 'Rename Trail' }).click()
        const dialog = page.getByRole('dialog', { name: 'Rename Trail' })
        await expect(dialog.getByRole('textbox')).toBeFocused()
        await page.evaluate(() => document.fonts.ready)

        await expect(dialog).toHaveScreenshot(`basic-open-${width}-${colorScheme}.png`)
      })
    })
  }
}
