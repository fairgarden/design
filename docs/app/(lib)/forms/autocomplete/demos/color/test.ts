import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('color recolors each box and keeps the popup white', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  await expect(demo.getByRole('combobox')).toHaveCount(2)
  const plum = demo.getByRole('combobox', { name: 'Primary Plum' })
  const indigo = demo.getByRole('combobox', { name: 'Primary Indigo' })
  for (const input of [plum, indigo]) {
    await expect(input).toHaveAttribute('placeholder', 'Topic…')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
  }

  // `primary` sets the value colour, so the two scales paint differently.
  const color = (input: typeof plum) => input.evaluate((element) => getComputedStyle(element).color)
  expect(await color(plum)).not.toEqual(await color(indigo))

  // Typing filters; the popup keeps the white scope's defaults.
  await plum.focus()
  await page.keyboard.type('Bo')
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await expect(listbox.getByRole('option')).toHaveCount(2)
  await expect(listbox.getByRole('option', { name: 'Botany' })).toBeVisible()
  await expect(listbox.getByRole('option', { name: 'Bouldering' })).toBeVisible()
  await expect(page.locator('[data-ground="white"]', { has: listbox }).first()).toBeVisible()

  await listbox.getByRole('option', { name: 'Bouldering' }).click()
  await expect(listbox).toBeHidden()
  await expect(plum).toHaveValue('Bouldering')
  await expect(indigo).toHaveValue('')

  // The indigo box opens from the keyboard and closes on Escape.
  await indigo.focus()
  await page.keyboard.press('ArrowDown')
  await expect(listbox.getByRole('option')).toHaveCount(4)
  await expect(indigo).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(listbox).toBeHidden()
  await expect(indigo).toBeFocused()
  await expect(indigo).toHaveValue('')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
