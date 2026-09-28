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

test('color recolors each search with its primary scale', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.getByRole('search')).toHaveCount(2)

  const plum = demo.getByRole('search', { name: 'Search, primary plum' })
  const indigo = demo.getByRole('search', { name: 'Filter, primary indigo' })

  // `primary` lands on the landmark as its scale class.
  await expect(plum).toHaveClass(/primaryPlum/)
  await expect(indigo).toHaveClass(/primaryIndigo/)

  // Each field is named by its label; the placeholder is the default.
  const plumField = plum.getByRole('combobox', { name: 'Search, primary plum' })
  const indigoField = indigo.getByRole('combobox', { name: 'Filter, primary indigo' })
  await expect(plumField).toHaveAttribute('placeholder', 'Search…')
  await expect(indigoField).toHaveAttribute('placeholder', 'Search…')

  // The boxed field has the butted submit; the ruled one has none.
  await expect(plum.getByRole('button', { name: 'Search', exact: true })).toHaveCount(1)
  await expect(indigo.getByRole('button', { name: 'Search', exact: true })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('color filters suggestions in the white popup and closes on Escape', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const field = demo
    .getByRole('search', { name: 'Search, primary plum' })
    .getByRole('combobox', { name: 'Search, primary plum' })

  await field.click()
  await field.pressSequentially('o')
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await expect(field).toHaveAttribute('aria-expanded', 'true')
  await expect(listbox.getByRole('option')).toHaveText(['Owls', 'Otters', 'Orchids'])

  await field.pressSequentially('t')
  await expect(listbox.getByRole('option')).toHaveText(['Otters'])

  // The popup declares the `white` scope, which follows the page mode.
  const popup = listbox.locator('xpath=ancestor::*[@data-ground][1]')
  await expect(popup).toHaveAttribute('data-ground', 'white')
  await expect(popup).toHaveAttribute('data-scheme', 'page')
  await expect(popup).not.toHaveAttribute('data-theme')

  await page.keyboard.press('Escape')
  await expect(listbox).toBeHidden()
  await expect(field).toHaveAttribute('aria-expanded', 'false')
  await expect(field).toBeFocused()
  await expect(field).toHaveValue('Ot')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
