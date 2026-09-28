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
 * first `frames` frames on the page, how many animations run on it and its
 * positioner (its clip, the morph frame, a fade) and its opacity. Sampled in
 * the page frame by frame, so a slow machine cannot miss a short morph.
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

test('components grows the menu out of its trigger by default', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const opening = watchOpening(page, '[role="menu"]')
  await demo.getByRole('button', { name: 'Export' }).click()

  // The counterpart of the tests that expect none: the same watch sees the morph run.
  const samples = await opening
  expect(samples, 'the menu should have opened').toHaveLength(10)
  expect(samples.some((sample) => sample.running > 0)).toBe(true)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('components opens the select at once', async ({ page }) => {
    const demo = await openDemo(page)
    const opening = watchOpening(page, '[role="listbox"]')
    await demo.getByRole('combobox', { name: 'Trail' }).click()

    const samples = await opening
    expect(samples, 'the select should have opened').toHaveLength(10)
    expect(samples.filter((sample) => sample.running > 0 || sample.opacity !== '1')).toEqual([])
  })

  test('components opens the menu at once', async ({ page }) => {
    const demo = await openDemo(page)
    const opening = watchOpening(page, '[role="menu"]')
    await demo.getByRole('button', { name: 'Export' }).click()

    const samples = await opening
    expect(samples, 'the menu should have opened').toHaveLength(10)
    expect(samples.filter((sample) => sample.running > 0 || sample.opacity !== '1')).toEqual([])
  })

  test('components opens the popover at once', async ({ page }) => {
    const demo = await openDemo(page)
    const opening = watchOpening(page, '[role="dialog"]')
    await demo.getByRole('button', { name: 'Trail Conditions' }).click()

    const samples = await opening
    expect(samples, 'the popover should have opened').toHaveLength(10)
    expect(samples.filter((sample) => sample.running > 0 || sample.opacity !== '1')).toEqual([])
  })
})
