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

test('frames renders a joined and an unframed header, each on its own', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page)

  // The joined header's box opens with the season's summary.
  await expect(demo.getByText('2026 harvest: 68 kg from fourteen plots, 52 kg to the food bank.')).toBeVisible()

  const lists = demo.getByRole('tablist', { name: 'Harvest records' })
  await expect(lists).toHaveCount(2)
  await expect(demo.getByRole('button', { name: 'More actions' })).toHaveCount(2)
  for (const index of [0, 1]) {
    await expect(lists.nth(index).getByRole('tab')).toHaveText(['Tally sheet', 'Food bank receipt', 'Notes'])
    await expect(lists.nth(index).getByRole('tab', { name: 'Tally sheet' })).toHaveAttribute('aria-selected', 'true')
  }

  // Keyboard in the joined one: arrows move focus without choosing (manual activation), Enter chooses.
  const joined = lists.nth(0)
  await joined.getByRole('tab', { name: 'Tally sheet' }).focus()
  await page.keyboard.press('ArrowRight')
  const receipt = joined.getByRole('tab', { name: 'Food bank receipt' })
  await expect(receipt).toBeFocused()
  await expect(receipt).toHaveAttribute('aria-selected', 'false')
  await page.keyboard.press('Enter')
  await expect(receipt).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByText('Received 52 kg of fresh produce for the Thursday pantry.')).toBeVisible()

  // The unframed one keeps its own selection.
  await expect(lists.nth(1).getByRole('tab', { name: 'Tally sheet' })).toHaveAttribute('aria-selected', 'true')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('frames opens the unframed header menu for its selected sheet', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page)

  const unframed = demo.getByRole('tablist', { name: 'Harvest records' }).nth(1)
  const notes = unframed.getByRole('tab', { name: 'Notes' })
  await notes.click()
  await expect(notes).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByText(/weigh the herbs too/)).toBeVisible()

  const trigger = demo.getByRole('button', { name: 'More actions' }).nth(1)
  await trigger.click()
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(menu.getByRole('menuitem')).toHaveText(['Download Notes (PDF)'])
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
