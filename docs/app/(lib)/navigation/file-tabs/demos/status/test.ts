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
async function open(page: Page) {
  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The code's tabs are disabled until then, so wait for them before interacting.
  const files = demo.getByRole('tablist', { name: 'Files' })
  await expect(files).toBeVisible({ timeout: 15000 })
  await expect(files.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]')).toHaveCount(0, {
    timeout: 15000,
  })
  return demo
}

test('status opens its menu from the keyboard and returns focus', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page)

  const tablist = demo.getByRole('tablist', { name: 'Work-day reports' })
  await expect(tablist.getByRole('tab')).toHaveText(['Saturday crew', 'Sunday crew', 'Tool check', 'Water log'])
  await expect(tablist.getByRole('tab', { name: 'Saturday crew' })).toHaveAttribute('aria-selected', 'true')

  const trigger = demo.getByRole('button', { name: 'More actions' })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(menu.getByRole('menuitem', { name: 'Save Saturday crew as PDF' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('status announces saving in its live region, then clears', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page)

  const tablist = demo.getByRole('tablist', { name: 'Work-day reports' })
  const tab = tablist.getByRole('tab', { name: 'Tool check' })
  await tab.click()
  await expect(tab).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByRole('heading', { name: 'Tool check' })).toBeVisible()

  // The live region is mounted, empty, before anything is said in it.
  const status = demo.getByRole('status').first()
  await expect(status).toHaveText('')

  await demo.getByRole('button', { name: 'More actions' }).click()
  await page.getByRole('menuitem', { name: 'Save Tool check as PDF' }).click()
  await expect(page.getByRole('menu')).toBeHidden()

  await expect(status).toHaveText('Saving…')
  // The tabs stay put while the status shows.
  await expect(tab).toHaveAttribute('aria-selected', 'true')
  await expect(status).toHaveText('')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
