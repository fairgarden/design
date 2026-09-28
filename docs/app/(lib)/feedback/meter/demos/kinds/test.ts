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
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before asserting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return { demo, pageErrors }
}

test('kinds labels four meters with their ranges and values', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  await expect(demo.getByRole('meter')).toHaveCount(4)

  const storage = demo.getByRole('meter', { name: 'Photo storage' })
  await expect(storage).toHaveAttribute('aria-valuenow', '9.4')
  await expect(storage).toHaveAttribute('aria-valuemin', '0')
  await expect(storage).toHaveAttribute('aria-valuemax', '10')
  await expect(storage).toContainText('9.4 of 10 GB')

  const difficulty = demo.getByRole('meter', { name: 'Trail difficulty' })
  await expect(difficulty).toHaveAttribute('aria-valuenow', '2')
  await expect(difficulty).toHaveAttribute('aria-valuemin', '0')
  await expect(difficulty).toHaveAttribute('aria-valuemax', '3')
  // An ordinal meter announces its active stop, not a number.
  await expect(difficulty).toHaveAttribute('aria-valuetext', 'Hard')

  const shifts = demo.getByRole('meter', { name: 'Volunteer shifts' })
  await expect(shifts).toHaveAttribute('aria-valuenow', '3')
  await expect(shifts).toHaveAttribute('aria-valuemax', '5')
  await expect(shifts).toContainText('3 of 5')

  const seeds = demo.getByRole('meter', { name: 'Seed bank' })
  await expect(seeds).toHaveAttribute('aria-valuenow', '72')
  await expect(seeds).toHaveAttribute('aria-valuemax', '100')
  await expect(seeds).toContainText('72')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds draws a threshold and status on the bar, not a color swap', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const storage = demo.getByRole('meter', { name: 'Photo storage' })
  // The limit is a tick across the track, and nearing it is a word the meter is described by.
  await expect(storage.locator('[class*="__threshold"]')).toHaveCount(1)
  await expect(storage).toContainText('Near limit')
  await expect(storage).toHaveAccessibleDescription(/Near limit/)

  // Only the bar carries a threshold or a status.
  await expect(demo.locator('[class*="__threshold"]')).toHaveCount(1)
  for (const name of ['Trail difficulty', 'Volunteer shifts', 'Seed bank']) {
    await expect(demo.getByRole('meter', { name })).not.toHaveAttribute('aria-describedby', /.+/)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds shows ordinal stops, step cells and a decorative ring', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  // Ordinal: one label per stop in order, the active one marked; the list is hidden from
  // assistive technology because the meter's value text already names the stop.
  const difficulty = demo.getByRole('meter', { name: 'Trail difficulty' })
  const stopList = difficulty.locator('ol')
  await expect(stopList).toHaveAttribute('aria-hidden', 'true')
  await expect(stopList.locator('li')).toHaveText(['Easy', 'Moderate', 'Hard', 'Strenuous'])
  await expect(stopList.locator('[class*="__stopLabelActive"]')).toHaveText('Hard')
  await expect(difficulty.locator('svg[aria-hidden="true"]')).toHaveCount(1)

  // Steps: one cell per unit, filled up to the value.
  const shifts = demo.getByRole('meter', { name: 'Volunteer shifts' })
  await expect(shifts.locator('[class*="__cell"]')).toHaveCount(5)
  await expect(shifts.locator('[class*="__cellFilled"]')).toHaveCount(3)

  // Ring: a decorative arc beside the value, which stays in text.
  const seeds = demo.getByRole('meter', { name: 'Seed bank' })
  const ring = seeds.locator('svg')
  await expect(ring).toHaveAttribute('aria-hidden', 'true')
  await expect(ring.locator('circle')).toHaveCount(2)
  await expect(ring.locator('circle').nth(1)).toHaveAttribute('stroke-dasharray', '72 100')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
