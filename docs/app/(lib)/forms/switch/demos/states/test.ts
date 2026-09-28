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
  return demo.locator('[class*="__preview"]').first()
}

test('states shows on, off, disabled and inline switches', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.getByRole('switch')).toHaveCount(5)

  const toggle = (name: string) => demo.getByRole('switch', { name })
  const row = (name: string) => toggle(name).locator('xpath=..')

  await expect(toggle('Email Alerts')).toHaveAttribute('aria-checked', 'true')
  await expect(toggle('Email Alerts')).not.toHaveAttribute('aria-busy', 'true')
  await expect(demo.getByText('Applies at once; saving takes a moment.')).toBeVisible()
  await expect(row('Email Alerts').getByText('On', { exact: true })).toBeVisible()

  await expect(toggle('Trail Closures')).toHaveAttribute('aria-checked', 'false')
  await expect(row('Trail Closures').getByText('Off', { exact: true })).toBeVisible()

  await expect(toggle('Text Messages')).toHaveAttribute('aria-checked', 'false')
  await expect(toggle('Text Messages')).toHaveAttribute('aria-disabled', 'true')
  await expect(toggle('Member Mail')).toHaveAttribute('aria-checked', 'true')
  await expect(toggle('Member Mail')).toHaveAttribute('aria-disabled', 'true')

  await expect(toggle('Show Elevation')).toHaveAttribute('aria-checked', 'true')
  await expect(row('Show Elevation').getByText('On', { exact: true })).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states flips by keyboard and pointer, and disabled switches keep their state', async ({
  page,
}) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const toggle = (name: string) => demo.getByRole('switch', { name })
  const row = (name: string) => toggle(name).locator('xpath=..')

  const closures = toggle('Trail Closures')
  await closures.focus()
  await page.keyboard.press('Space')
  await expect(closures).toHaveAttribute('aria-checked', 'true')
  await expect(row('Trail Closures').getByText('On', { exact: true })).toBeVisible()
  await expect(closures).toBeFocused()
  await demo.getByText('Trail Closures', { exact: true }).click()
  await expect(closures).toHaveAttribute('aria-checked', 'false')

  const elevation = toggle('Show Elevation')
  await elevation.click()
  await expect(elevation).toHaveAttribute('aria-checked', 'false')
  await expect(row('Show Elevation').getByText('Off', { exact: true })).toBeVisible()
  await elevation.focus()
  await page.keyboard.press('Space')
  await expect(elevation).toHaveAttribute('aria-checked', 'true')

  await demo.getByText('Text Messages', { exact: true }).click({ force: true })
  await expect(toggle('Text Messages')).toHaveAttribute('aria-checked', 'false')
  await demo.getByText('Member Mail', { exact: true }).click({ force: true })
  await expect(toggle('Member Mail')).toHaveAttribute('aria-checked', 'true')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states shows Saving… and is read-only while the remote change saves', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const alerts = demo.getByRole('switch', { name: 'Email Alerts' })
  const row = alerts.locator('xpath=..')

  await alerts.focus()
  await page.keyboard.press('Space')
  // Until the save lands the switch is busy and inert.
  await expect(alerts).toHaveAttribute('aria-busy', 'true')
  await expect(alerts).toHaveAttribute('aria-readonly', 'true')
  await expect(row.getByText('Saving…', { exact: true })).toBeVisible()

  // The save lands: off, no longer busy or read-only.
  await expect(alerts).toHaveAttribute('aria-checked', 'false')
  await expect(alerts).not.toHaveAttribute('aria-busy', 'true')
  await expect(alerts).not.toHaveAttribute('aria-readonly', 'true')
  await expect(row.getByText('Off', { exact: true })).toBeVisible()

  // The label row saves it back on.
  await demo.getByText('Email Alerts', { exact: true }).click()
  await expect(row.getByText('Saving…', { exact: true })).toBeVisible()
  await expect(alerts).toHaveAttribute('aria-checked', 'true')
  await expect(alerts).not.toHaveAttribute('aria-busy', 'true')
  await expect(row.getByText('On', { exact: true })).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
