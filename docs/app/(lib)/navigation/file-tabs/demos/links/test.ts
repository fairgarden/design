import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

/** Opens the demo and waits until it has finished loading; returns the demo container. */
async function open(page: Page, hash = '') {
  await page.goto(route + hash)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The code's tabs are disabled until then, so wait for them before interacting.
  const files = demo.getByRole('tablist', { name: 'Files' })
  await expect(files).toBeVisible({ timeout: 15000 })
  await expect(files.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]')).toHaveCount(0, {
    timeout: 15000,
  })
  return demo.locator('[class*="__preview"]').first()
}

test('links renders each tab as a deep link and selects on a plain click', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page)

  const tablist = demo.getByRole('tablist', { name: 'Grant application' })
  const tabs = tablist.getByRole('tab')
  await expect(tabs).toHaveText(['Cover letter', 'Budget', 'Site plan', 'Letters of support'])
  await expect(tablist.getByRole('tab', { name: 'Cover letter' })).toHaveAttribute('href', '#grant-packet:cover-letter')
  await expect(tablist.getByRole('tab', { name: 'Budget' })).toHaveAttribute('href', '#grant-packet:budget')
  await expect(tablist.getByRole('tab', { name: 'Cover letter' })).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByRole('heading', { name: 'Cover letter' })).toBeVisible()

  // A plain click selects without writing the hash.
  const budget = tablist.getByRole('tab', { name: 'Budget' })
  await budget.click()
  await expect(budget).toHaveAttribute('aria-selected', 'true')
  expect(new URL(page.url()).hash).toBe('')
  const table = demo.getByRole('table')
  await expect(table.getByRole('columnheader')).toHaveText(['Item', 'Cost ($)'])
  await expect(table.getByRole('row', { name: /Rain barrels \(6\)/ })).toContainText('540')

  // Arrows move focus, Enter chooses; the hash stays untouched.
  await page.keyboard.press('ArrowRight')
  const site = tablist.getByRole('tab', { name: 'Site plan' })
  await expect(site).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(site).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByRole('heading', { name: 'Site plan' })).toBeVisible()
  expect(new URL(page.url()).hash).toBe('')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('links follows the hash from a page link and on load', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page)

  const tablist = demo.getByRole('tablist', { name: 'Grant application' })
  // A link elsewhere on the page writes the hash; the demo latches it.
  await demo.getByRole('link', { name: 'letters of support' }).click()
  await expect(page).toHaveURL(/#grant-packet:letters-of-support$/)
  await expect(tablist.getByRole('tab', { name: 'Letters of support' })).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByText('The Hillside Tool Library')).toBeVisible()

  await demo.getByRole('link', { name: 'budget', exact: true }).click()
  await expect(tablist.getByRole('tab', { name: 'Budget' })).toHaveAttribute('aria-selected', 'true')

  // Loading with a hash selects that document.
  const reloaded = await open(page, '#grant-packet:site-plan')
  const list = reloaded.getByRole('tablist', { name: 'Grant application' })
  await expect(list.getByRole('tab', { name: 'Site plan' })).toHaveAttribute('aria-selected', 'true')
  await expect(list.getByRole('tab', { name: 'Cover letter' })).toHaveAttribute('aria-selected', 'false')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
