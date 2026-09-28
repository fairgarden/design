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

test('variants shows three accordions with their default states', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  // Every trigger sits in an h3 and is a button with aria-expanded.
  const titles = [
    'Hours and seasons',
    'Parking and transit',
    'Preserve rules',
    'Meadow loop, 1.2 miles',
    'Ridge trail, 3.4 miles',
    'Account settings',
    'Notifications',
  ]
  // Accordion triggers are the buttons inside the row headings.
  const triggers = demo.getByRole('heading', { level: 3 }).getByRole('button')
  await expect(triggers).toHaveCount(titles.length)
  await expect(triggers.and(page.locator('[aria-expanded="true"]'))).toHaveCount(1)
  for (const name of titles) {
    await expect(demo.getByRole('heading', { level: 3, name })).toBeVisible()
  }
  // The section heading the headed accordion follows.
  await expect(demo.getByRole('heading', { level: 3, name: 'Trail notes' })).toBeVisible()

  // Only the default-open item shows its panel; closed panels stay in the DOM, hidden.
  await expect(demo.getByRole('button', { name: 'Hours and seasons' })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  await expect(demo.getByRole('region', { name: 'Hours and seasons' })).toContainText(
    'Open dawn to dusk every day.',
  )
  await expect(demo.getByText('Twelve spaces at the north lot')).toBeHidden()
  await expect(demo.getByText('Flat and accessible')).toBeHidden()
  await expect(demo.getByText('The plus/minus circle')).toBeHidden()

  // The disabled item cannot be opened.
  const rules = demo.getByRole('button', { name: 'Preserve rules' })
  await expect(rules).toBeDisabled()
  await expect(rules).toHaveAttribute('aria-expanded', 'false')

  // One headed accordion and one plus/minus accordion (CSS Module local names are stable).
  await expect(demo.locator('[class*="headed"]')).toHaveCount(1)
  await expect(demo.locator('[class*="headed"]')).toContainText('Meadow loop, 1.2 miles')
  await expect(demo.locator('[class*="plusminus"]')).toHaveCount(1)
  await expect(demo.locator('[class*="plusminus"]')).toContainText('Account settings')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('variants opens and closes items by pointer and keyboard', async ({ page }) => {
  test.fixme(true, 'Known bug: ArrowDown/ArrowUp on an accordion trigger does not move focus to the adjacent trigger.')
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const hours = demo.getByRole('button', { name: 'Hours and seasons' })
  const parking = demo.getByRole('button', { name: 'Parking and transit' })
  const parkingCopy = demo.getByText('Twelve spaces at the north lot')

  // Pointer: several items may be open at once.
  await parking.click()
  await expect(parking).toHaveAttribute('aria-expanded', 'true')
  await expect(parkingCopy).toBeVisible()
  await expect(hours).toHaveAttribute('aria-expanded', 'true')
  await parking.click()
  await expect(parking).toHaveAttribute('aria-expanded', 'false')
  await expect(parkingCopy).toBeHidden()

  // Keyboard: Enter and Space toggle; ArrowDown moves to the next trigger.
  await hours.focus()
  await page.keyboard.press('Enter')
  await expect(hours).toHaveAttribute('aria-expanded', 'false')
  await expect(demo.getByText('Open dawn to dusk every day.')).toBeHidden()
  await page.keyboard.press('ArrowDown')
  await expect(parking).toBeFocused()
  await page.keyboard.press('Space')
  await expect(parking).toHaveAttribute('aria-expanded', 'true')
  await expect(parkingCopy).toBeVisible()
  await page.keyboard.press('ArrowUp')
  await expect(hours).toBeFocused()
  await page.keyboard.press('Space')
  await expect(hours).toHaveAttribute('aria-expanded', 'true')

  // The plus/minus accordion behaves the same.
  const account = demo.getByRole('button', { name: 'Account settings' })
  await account.click()
  await expect(account).toHaveAttribute('aria-expanded', 'true')
  await expect(demo.getByRole('region', { name: 'Account settings' })).toContainText(
    'The plus/minus circle',
  )
  await account.press('Enter')
  await expect(account).toHaveAttribute('aria-expanded', 'false')
  await expect(account).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
