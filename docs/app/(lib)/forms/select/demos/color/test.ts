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

test('color shows the primary and secondary selects with their defaults', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.getByRole('combobox')).toHaveCount(2)
  await expect(demo.getByText('Primary Plum', { exact: true })).toBeVisible()
  await expect(demo.getByText('Secondary Orange', { exact: true })).toBeVisible()

  const primary = demo.getByRole('combobox', { name: 'Primary Plum' })
  const secondary = demo.getByRole('combobox', { name: 'Secondary Orange' })
  await expect(primary).toHaveText('Medium')
  await expect(secondary).toHaveText('Large')
  for (const trigger of [primary, secondary]) {
    await expect(trigger).toBeEnabled()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('color chooses by keyboard and pointer, and Escape dismisses', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const primary = demo.getByRole('combobox', { name: 'Primary Plum' })
  const secondary = demo.getByRole('combobox', { name: 'Secondary Orange' })
  const listbox = page.getByRole('listbox')

  // Keyboard: the popup opens on the chosen size and lists all three.
  await primary.focus()
  await page.keyboard.press('Enter')
  await expect(listbox).toBeVisible()
  await expect(primary).toHaveAttribute('aria-expanded', 'true')
  await expect(listbox.getByRole('option')).toHaveText(['Small', 'Medium', 'Large'])
  await expect(listbox.getByRole('option', { name: 'Medium' })).toHaveAttribute('aria-selected', 'true')
  await expect(listbox.getByRole('option', { name: 'Medium' })).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(listbox.getByRole('option', { name: 'Small' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(listbox).toBeHidden()
  await expect(primary).toHaveText('Small')
  await expect(primary).toBeFocused()

  // Pointer: the underline select opens on click and chooses on click.
  await secondary.click()
  await expect(listbox).toBeVisible()
  await expect(listbox.getByRole('option', { name: 'Large' })).toHaveAttribute('aria-selected', 'true')
  await listbox.getByRole('option', { name: 'Medium' }).click()
  await expect(listbox).toBeHidden()
  await expect(secondary).toHaveText('Medium')
  await expect(primary).toHaveText('Small')

  // Escape closes without choosing and returns focus to the trigger.
  await secondary.focus()
  await page.keyboard.press('ArrowDown')
  await expect(listbox).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Escape')
  await expect(listbox).toBeHidden()
  await expect(secondary).toHaveText('Medium')
  await expect(secondary).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
