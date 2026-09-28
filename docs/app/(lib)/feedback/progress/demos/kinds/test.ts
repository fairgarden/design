import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

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

test('kinds shows every kind and state with its value in text', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.getByRole('progressbar')).toHaveCount(6)

  // Bar: a percentage, in progress.
  const upload = demo.getByRole('progressbar', { name: 'Uploading trail map' })
  await expect(upload).toHaveAttribute('aria-valuenow', '62')
  await expect(upload).toHaveAttribute('aria-valuemin', '0')
  await expect(upload).toHaveAttribute('aria-valuemax', '100')
  await expect(upload).toHaveAttribute('data-progressing', '')
  await expect(upload).toContainText('62%')

  // Steps: one cell per step, "2 of 4" in text and to assistive tech.
  const steps = demo.getByRole('progressbar', { name: 'Membership form' })
  await expect(steps).toHaveAttribute('aria-valuenow', '2')
  await expect(steps).toHaveAttribute('aria-valuemax', '4')
  await expect(steps).toHaveAttribute('aria-valuetext', '2 of 4')
  await expect(steps).toContainText('2 of 4')
  await expect(steps.locator('[class*="__cell"]')).toHaveCount(4)
  await expect(steps.locator('[class*="__cellFilled"]')).toHaveCount(2)

  // Ring: a custom formatted value beside the arc.
  const quiz = demo.getByRole('progressbar', { name: 'Quiz' })
  await expect(quiz).toHaveAttribute('aria-valuenow', '3')
  await expect(quiz).toHaveAttribute('aria-valuemax', '5')
  await expect(quiz).toContainText('3 of 5')
  await expect(quiz.locator('svg circle')).toHaveCount(2)

  // Indeterminate: no value, a dashed track and "Loading…".
  const loading = demo.getByRole('progressbar', { name: 'Loading sightings' })
  await expect(loading).not.toHaveAttribute('aria-valuenow', /.*/)
  await expect(loading).toHaveAttribute('data-indeterminate', '')
  await expect(loading).toContainText('Loading…')

  // Failed: a danger status, glyph plus words, describing the progressbar.
  const photo = demo.getByRole('progressbar', { name: 'Photo upload' })
  await expect(photo).toHaveAttribute('aria-valuenow', '40')
  await expect(photo).toContainText('40%')
  await expect(photo).toHaveAccessibleDescription('Upload failed. Retry')

  // Rail: the carousel position, "3 of 8".
  const rail = demo.getByRole('progressbar', { name: 'Gallery position' })
  await expect(rail).toHaveAttribute('aria-valuenow', '3')
  await expect(rail).toHaveAttribute('aria-valuemax', '8')
  await expect(rail).toContainText('3 of 8')

  // Only the failed upload carries a status until something completes.
  await expect(demo.getByText('Done', { exact: true })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds advances to complete and resets by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const upload = demo.getByRole('progressbar', { name: 'Uploading trail map' })
  const more = demo.getByRole('button', { name: 'Upload More' })
  const reset = demo.getByRole('button', { name: 'Reset' })

  await expect(upload).toHaveAttribute('aria-valuenow', '62')

  // Pointer: 62 → 81.
  await more.click()
  await expect(upload).toHaveAttribute('aria-valuenow', '81')
  await expect(upload).toContainText('81%')
  await expect(upload).not.toHaveAttribute('data-complete', /.*/)

  // Keyboard: 81 → 100, capped; complete shows "Done" as its status.
  await more.focus()
  await page.keyboard.press('Enter')
  await expect(upload).toHaveAttribute('aria-valuenow', '100')
  await expect(upload).toContainText('100%')
  await expect(upload).toHaveAttribute('data-complete', '')
  await expect(upload).toContainText('Done')
  await expect(upload).toHaveAccessibleDescription('Done')

  // Pressing again stays at the cap.
  await page.keyboard.press('Space')
  await expect(upload).toHaveAttribute('aria-valuenow', '100')
  await expect(more).toBeFocused()

  // Reset by keyboard: back to 0, no status.
  await reset.focus()
  await page.keyboard.press('Enter')
  await expect(upload).toHaveAttribute('aria-valuenow', '0')
  await expect(upload).toContainText('0%')
  await expect(upload).not.toHaveAttribute('data-complete', /.*/)
  await expect(upload).not.toContainText('Done')

  // Pointer again: 0 → 19.
  await more.click()
  await expect(upload).toHaveAttribute('aria-valuenow', '19')

  // The other progress bars are untouched.
  await expect(demo.getByRole('progressbar', { name: 'Membership form' })).toHaveAttribute(
    'aria-valuenow',
    '2',
  )

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
