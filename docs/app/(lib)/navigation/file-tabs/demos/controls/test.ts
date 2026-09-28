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

test('controls keeps each column its own selection and menu', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page)

  // Two columns, the same documents and ⋮ trigger in each.
  const lists = demo.getByRole('tablist', { name: 'Seed library' })
  await expect(lists).toHaveCount(2)
  const triggers = demo.getByRole('button', { name: 'More actions' })
  await expect(triggers).toHaveCount(2)
  for (const index of [0, 1]) {
    await expect(lists.nth(index).getByRole('tab')).toHaveText(['Borrowing rules', 'Catalogue', 'Returns'])
    await expect(lists.nth(index).getByRole('tab', { name: 'Borrowing rules' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  }

  // Choosing in the narrow column leaves the first alone.
  const returns = lists.nth(1).getByRole('tab', { name: 'Returns' })
  await returns.click()
  await expect(returns).toHaveAttribute('aria-selected', 'true')
  await expect(lists.nth(0).getByRole('tab', { name: 'Borrowing rules' })).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByText(/Dry saved seed for two weeks/)).toBeVisible()

  // Its menu names the selected document; the arrows move through the items, Escape closes.
  const trigger = triggers.nth(1)
  await trigger.focus()
  await page.keyboard.press('Enter')
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(menu.getByRole('menuitem')).toHaveText(['Print Returns', 'Download Returns (PDF)', 'Copy link'])
  await page.keyboard.press('End')
  await expect(menu.getByRole('menuitem', { name: 'Copy link' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()

  // The first column's menu still names its own document.
  await triggers.nth(0).click()
  await expect(page.getByRole('menuitem', { name: 'Print Borrowing rules' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toBeHidden()
  await expect(triggers.nth(0)).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test.describe('copying', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('controls copies the link from its menu and confirms in a toast', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))
    const demo = await open(page)

    await demo.getByRole('button', { name: 'More actions' }).first().click()
    await page.getByRole('menuitem', { name: 'Copy link' }).click()
    await expect(page.getByRole('menu')).toBeHidden()

    const toasts = page.getByRole('region', { name: 'Notifications' })
    await expect(toasts).toContainText('Link copied')
    await expect(demo.getByText('Link copied')).toHaveCount(0)
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/#controls$/)

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})
