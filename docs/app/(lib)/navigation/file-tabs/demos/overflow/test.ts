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
  return demo.locator('[class*="__preview"]').first()
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

test('overflow scrolls its row and brings each tab into view from the keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page)

  const tablist = demo.getByRole('tablist', { name: 'Meeting minutes, 2026' })
  await expect(tablist.getByRole('tab')).toHaveText(months)
  const march = tablist.getByRole('tab', { name: 'March' })
  await expect(march).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByRole('heading', { name: 'March meeting minutes' })).toBeVisible()

  // Twelve tabs in a narrow frame: the row overflows and scrolls sideways.
  expect(await tablist.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true)
  const december = tablist.getByRole('tab', { name: 'December' })
  await expect(december).not.toBeInViewport()

  // End moves focus to the last tab, scrolled into view; Enter chooses it.
  await march.focus()
  await page.keyboard.press('End')
  await expect(december).toBeFocused()
  await expect(december).toBeInViewport()
  await expect(december).toHaveAttribute('aria-selected', 'false')
  await page.keyboard.press('Enter')
  await expect(december).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByRole('heading', { name: 'December meeting minutes' })).toBeVisible()
  expect(await tablist.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)

  // Home goes back to the first; the arrows step one at a time.
  await page.keyboard.press('Home')
  const january = tablist.getByRole('tab', { name: 'January' })
  await expect(january).toBeFocused()
  await expect(january).toBeInViewport()
  await page.keyboard.press('ArrowRight')
  await expect(tablist.getByRole('tab', { name: 'February' })).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('overflow opens its menu for the selected month', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page)

  const tablist = demo.getByRole('tablist', { name: 'Meeting minutes, 2026' })
  const april = tablist.getByRole('tab', { name: 'April' })
  await april.click()
  await expect(april).toHaveAttribute('aria-selected', 'true')

  const trigger = demo.getByRole('button', { name: 'More actions' })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(menu.getByRole('menuitem')).toHaveText([
    'Download April minutes (PDF)',
    'Download the whole year (PDF)',
  ])
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
