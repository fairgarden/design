import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('disabled keeps every tab and its trigger disabled, the selection unchanged', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting. (The code's
  // tabs: the preview's tabs are disabled for good.)
  const files = demo.getByRole('tablist', { name: 'Files' })
  await expect(files).toBeVisible({ timeout: 15000 })
  await expect(files.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]')).toHaveCount(0, {
    timeout: 15000,
  })
  const preview = demo.locator('[class*="__preview"]').first()

  const tablist = preview.getByRole('tablist', { name: 'Spring packet' })
  const tabs = tablist.getByRole('tab')
  await expect(tabs).toHaveText(['Planting calendar', 'Seed order', 'Tool inventory'])
  for (const index of [0, 1, 2]) await expect(tabs.nth(index)).toBeDisabled()
  // The selected tab stays selected while disabled.
  await expect(tablist.getByRole('tab', { name: 'Seed order' })).toHaveAttribute('aria-selected', 'true')

  const trigger = preview.getByRole('button', { name: 'More actions' })
  await expect(trigger).toBeDisabled()
  await expect(preview.getByText('Loading…')).toBeVisible()

  // A click chooses no other document, and the trigger opens no menu.
  await tablist.getByRole('tab', { name: 'Tool inventory' }).click({ force: true })
  await expect(tablist.getByRole('tab', { name: 'Seed order' })).toHaveAttribute('aria-selected', 'true')
  await expect(tablist.getByRole('tab', { name: 'Tool inventory' })).toHaveAttribute('aria-selected', 'false')
  await trigger.click({ force: true })
  await expect(page.getByRole('menu')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
