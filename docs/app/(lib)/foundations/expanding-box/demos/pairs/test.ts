import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

// Reduced motion skips the view transition, so each morph settles at once and the owner's
// busy guard never swallows the next open or close.
test.use({ reducedMotion: 'reduce' })

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

test('pairs renders two independent collapsed owners', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const hours = demo.locator('button[aria-controls]').filter({ hasText: 'Opening hours' })
  const parking = demo.locator('button[aria-controls]').filter({ hasText: 'Parking' })
  await expect(demo.locator('[class*="__preview"]').first().locator('button[aria-expanded]')).toHaveCount(2)
  await expect(hours).toHaveAccessibleName('Opening hours')
  await expect(parking).toHaveAccessibleName('Parking')
  await expect(hours).toHaveAttribute('aria-expanded', 'false')
  await expect(parking).toHaveAttribute('aria-expanded', 'false')

  // Each owner controls its own panel.
  const hoursPanel = await hours.getAttribute('aria-controls')
  const parkingPanel = await parking.getAttribute('aria-controls')
  expect(hoursPanel).toBeTruthy()
  expect(parkingPanel).toBeTruthy()
  expect(hoursPanel).not.toBe(parkingPanel)
  await expect(demo.getByRole('region')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('pairs opens one owner without disturbing the other', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const hours = demo.locator('button[aria-controls]').filter({ hasText: 'Opening hours' })
  const parking = demo.locator('button[aria-controls]').filter({ hasText: 'Parking' })
  const hoursPanel = demo.getByRole('region', { name: 'Opening hours', exact: true })
  const parkingPanel = demo.getByRole('region', { name: 'Parking', exact: true })

  // Pointer: open the first.
  await hours.click()
  await expect(hoursPanel).toBeVisible()
  await expect(hoursPanel.getByText('Gates open at 7:00 and close at dusk')).toBeVisible()
  await expect(hoursPanel.getByRole('button', { name: 'Close Opening hours' })).toBeFocused()
  await expect(parking).toHaveAttribute('aria-expanded', 'false')
  await expect(parkingPanel).toHaveCount(0)

  // Keyboard: open the second while the first stays open.
  await parking.focus()
  await page.keyboard.press('Enter')
  await expect(parkingPanel).toBeVisible()
  await expect(parkingPanel.getByText('The lower lot holds 40 cars')).toBeVisible()
  await expect(parkingPanel.getByRole('button', { name: 'Close Parking' })).toBeFocused()
  await expect(hoursPanel).toBeVisible()
  await expect(hours).toHaveAttribute('aria-expanded', 'true')

  // Escape closes only the panel it was pressed in, returning focus to its own trigger.
  await page.keyboard.press('Escape')
  await expect(parkingPanel).toHaveCount(0)
  await expect(parking).toHaveAttribute('aria-expanded', 'false')
  await expect(parking).toBeFocused()
  await expect(hoursPanel).toBeVisible()

  await hoursPanel.getByRole('button', { name: 'Close Opening hours' }).click()
  await expect(hoursPanel).toHaveCount(0)
  await expect(hours).toHaveAttribute('aria-expanded', 'false')
  await expect(hours).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
