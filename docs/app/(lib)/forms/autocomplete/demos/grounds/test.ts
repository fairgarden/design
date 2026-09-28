import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('grounds sets each box on its ground and the popup on white', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // The Demo's preview surface, without its code; each ground is a section scope in it.
  const preview = demo.locator('[class*="__preview"]').first()
  const paper = preview.locator('section[data-ground="paper"]')
  const forest = preview.locator('section[data-ground="forest"]')

  // Paper follows the mode; forest is an always-dark field.
  await expect(paper).toHaveAttribute('data-scheme', 'page')
  await expect(paper).not.toHaveAttribute('data-theme', /.+/)
  await expect(paper).toContainText('paper')
  await expect(forest).toHaveAttribute('data-scheme', 'dark')
  await expect(forest).toHaveAttribute('data-theme', 'dark')
  await expect(forest).toContainText('forest')

  await expect(preview.getByRole('combobox', { name: 'River' })).toHaveCount(2)
  for (const ground of [paper, forest]) {
    const river = ground.getByRole('combobox', { name: 'River' })
    await expect(river).toHaveAttribute('placeholder', 'River name…')
    await expect(river).toHaveAttribute('aria-expanded', 'false')
  }

  // The popup from the forest field is the white scope, not the field's dark one.
  const river = forest.getByRole('combobox', { name: 'River' })
  await river.focus()
  await page.keyboard.press('ArrowDown')
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await expect(river).toHaveAttribute('aria-expanded', 'true')
  await expect(listbox.getByRole('option')).toHaveCount(4)
  const popupScope = page.locator('[data-ground="white"]', { has: listbox }).first()
  await expect(popupScope).toBeVisible()
  await expect(popupScope).not.toHaveAttribute('data-theme', /.+/)
  await expect(demo.getByRole('listbox')).toHaveCount(0)

  // Opening highlights nothing, so the first ArrowDown lands on Avon and the second on Derwent.
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(listbox).toBeHidden()
  await expect(river).toHaveValue('Derwent')
  await expect(river).toBeFocused()
  await expect(paper.getByRole('combobox', { name: 'River' })).toHaveValue('')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
