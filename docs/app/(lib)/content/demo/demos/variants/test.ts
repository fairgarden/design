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
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return { demo, pageErrors }
}

test('variants swaps the preview and code from the variant Select', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)
  // The variant bar's Select, in the preview's corner.
  const variant = demo.getByRole('combobox', { name: 'Variant' }).first()
  await expect(variant).toHaveText('CSS Modules')

  // The CSS Modules counter: an output beside the button.
  const plant = demo.getByRole('button', { name: 'Plant a Seedling' })
  await expect(demo.getByText('0 planted', { exact: true })).toBeVisible()
  await plant.click()
  await expect(demo.getByText('1 planted', { exact: true })).toBeVisible()
  await expect(demo.getByRole('tabpanel')).toContainText('<output')

  // Choose Tag from the keyboard.
  await variant.focus()
  await page.keyboard.press('Enter')
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await expect(listbox.getByRole('option')).toHaveCount(2)
  await listbox.getByRole('option', { name: 'Tag' }).focus()
  await page.keyboard.press('Enter')
  await expect(listbox).toBeHidden()
  // The Select changes at once and keeps focus; the preview and code follow after the swap.
  await expect(variant).toHaveText('Tag')
  await expect(variant).toBeFocused()
  await expect(demo.getByText('0 seedlings', { exact: true })).toBeVisible()
  await expect(demo.getByText(/ planted$/)).toHaveCount(0)
  await expect(demo.getByRole('tabpanel')).toContainText('<Tag>')

  await plant.focus()
  await page.keyboard.press('Enter')
  await expect(demo.getByText('1 seedling', { exact: true })).toBeVisible()
  await plant.click()
  await expect(demo.getByText('2 seedlings', { exact: true })).toBeVisible()

  // And back to CSS Modules by pointer.
  await variant.click()
  await expect(listbox).toBeVisible()
  await listbox.getByRole('option', { name: 'CSS Modules' }).click()
  await expect(listbox).toBeHidden()
  await expect(variant).toHaveText('CSS Modules')
  await expect(demo.getByText(/^\d+ planted$/)).toBeVisible()
  await expect(demo.getByRole('tabpanel')).toContainText('<output')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('variants shows each variant\'s two files as tabs with the actions in a menu', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)
  const files = demo.getByRole('tablist', { name: 'Files' })
  await expect(files.getByRole('tab')).toHaveCount(2)
  await expect(files.getByRole('tab', { name: /SeedlingCounter\.tsx/ })).toHaveAttribute('aria-selected', 'true')
  const styles = files.getByRole('tab', { name: /seedling-counter\.module\.css/ })
  await expect(styles).toBeVisible()
  await expect(demo.getByRole('button', { name: 'More actions' })).toBeEnabled()

  await styles.click()
  await expect(styles).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByRole('tabpanel')).toContainText('.count')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
