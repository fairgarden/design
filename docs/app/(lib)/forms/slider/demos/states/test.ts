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

test('states shows continuous, stepped, range and disabled sliders', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  // One thumb each, two for the range.
  await expect(demo.getByRole('slider')).toHaveCount(5)

  const distance = demo.getByRole('group', { name: 'Walking Distance' })
  const distanceThumb = distance.getByRole('slider', { name: 'Walking Distance' })
  await expect(distanceThumb).toHaveAttribute('aria-valuenow', '6')
  await expect(distanceThumb).toHaveAttribute('aria-valuemax', '20')
  await expect(distance.locator('output')).toHaveText('6 km')

  const group = demo.getByRole('group', { name: 'Group Size' })
  const groupThumb = group.getByRole('slider', { name: 'Group Size' })
  await expect(groupThumb).toHaveAttribute('aria-valuenow', '8')
  await expect(group.locator('output')).toHaveText('8')
  // The tick scale is decorative: its labels are hidden from assistive tech.
  const ticks = group.locator('[aria-hidden="true"]')
  for (const label of ['0', '5', '10', '15', '20']) {
    await expect(ticks.getByText(label, { exact: true })).toHaveCount(1)
  }

  // The range names each thumb with thumbLabels.
  const price = demo.getByRole('group', { name: 'Price Range' })
  await expect(price.getByRole('slider')).toHaveCount(2)
  await expect(price.getByRole('slider', { name: 'Minimum price' })).toHaveAttribute('aria-valuenow', '40')
  await expect(price.getByRole('slider', { name: 'Maximum price' })).toHaveAttribute('aria-valuenow', '120')
  await expect(price.locator('output')).toContainText('$40')
  await expect(price.locator('output')).toContainText('$120')

  // Disabled: the thumb cannot be operated, but the value stays shown.
  const elevation = demo.getByRole('group', { name: 'Elevation Gain' })
  const elevationThumb = elevation.getByRole('slider', { name: 'Elevation Gain' })
  await expect(elevation).toHaveAttribute('data-disabled', '')
  await expect(elevationThumb).toBeDisabled()
  await expect(elevationThumb).toHaveAttribute('aria-valuenow', '300')
  await expect(elevation.locator('output')).toHaveText('300 m')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states steps from the keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  // Arrow keys step by `step` (0.5 km); Page Up and Down by ten; Home and End jump to the ends.
  const distance = demo.getByRole('group', { name: 'Walking Distance' })
  const distanceThumb = distance.getByRole('slider', { name: 'Walking Distance' })
  await distanceThumb.focus()
  await page.keyboard.press('ArrowRight')
  await expect(distanceThumb).toHaveAttribute('aria-valuenow', '6.5')
  await expect(distance.locator('output')).toHaveText('6.5 km')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(distanceThumb).toHaveAttribute('aria-valuenow', '5.5')
  await page.keyboard.press('PageUp')
  await expect(distanceThumb).toHaveAttribute('aria-valuenow', '15.5')
  await page.keyboard.press('End')
  await expect(distanceThumb).toHaveAttribute('aria-valuenow', '20')
  await expect(distance.locator('output')).toHaveText('20 km')
  await page.keyboard.press('Home')
  await expect(distanceThumb).toHaveAttribute('aria-valuenow', '0')
  await expect(distance.locator('output')).toHaveText('0 km')

  // Each range thumb moves on its own, in steps of 5.
  const price = demo.getByRole('group', { name: 'Price Range' })
  const minimum = price.getByRole('slider', { name: 'Minimum price' })
  const maximum = price.getByRole('slider', { name: 'Maximum price' })
  await minimum.focus()
  await page.keyboard.press('ArrowRight')
  await expect(minimum).toHaveAttribute('aria-valuenow', '45')
  await expect(maximum).toHaveAttribute('aria-valuenow', '120')
  await page.keyboard.press('Home')
  await expect(minimum).toHaveAttribute('aria-valuenow', '0')
  await page.keyboard.press('Tab')
  await expect(maximum).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(maximum).toHaveAttribute('aria-valuenow', '115')
  await page.keyboard.press('End')
  await expect(maximum).toHaveAttribute('aria-valuenow', '200')
  await expect(price.locator('output')).toContainText('$0')
  await expect(price.locator('output')).toContainText('$200')

  // The disabled slider is skipped: Tab from the last enabled thumb leaves the demo's sliders.
  const elevationThumb = demo.getByRole('slider', { name: 'Elevation Gain' })
  await page.keyboard.press('Tab')
  await expect(elevationThumb).not.toBeFocused()
  await expect(elevationThumb).toHaveAttribute('aria-valuenow', '300')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states moves the thumb to a pointer press on the track', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  // Group Size runs 0–20 in whole steps; a press three quarters along lands near 15.
  const group = demo.getByRole('group', { name: 'Group Size' })
  const groupThumb = group.getByRole('slider', { name: 'Group Size' })
  // The range input sits inside the thumb, which sits in the track.
  const track = groupThumb.locator('xpath=../..')
  const box = await track.boundingBox()
  expect(box).not.toBeNull()
  await track.click({ position: { x: box!.width * 0.75, y: box!.height / 2 } })

  await expect
    .poll(async () => Number(await groupThumb.getAttribute('aria-valuenow')))
    .toBeGreaterThanOrEqual(14)
  const value = Number(await groupThumb.getAttribute('aria-valuenow'))
  expect(value).toBeLessThanOrEqual(16)
  await expect(group.locator('output')).toHaveText(String(value))
  // The press focuses the thumb, so the keyboard takes over from there.
  await expect(groupThumb).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(groupThumb).toHaveAttribute('aria-valuenow', String(value + 1))

  // A press on the disabled track changes nothing.
  const elevationThumb = demo.getByRole('slider', { name: 'Elevation Gain' })
  const elevationTrack = elevationThumb.locator('xpath=../..')
  const elevationBox = await elevationTrack.boundingBox()
  expect(elevationBox).not.toBeNull()
  await elevationTrack.click({
    position: { x: elevationBox!.width * 0.9, y: elevationBox!.height / 2 },
    force: true,
  })
  await expect(elevationThumb).toHaveAttribute('aria-valuenow', '300')
  await expect(elevationThumb).not.toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
