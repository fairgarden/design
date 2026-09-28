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
  // Scope to the preview surface; the code panel carries its own grounds and controls.
  return demo.locator('[class*="__preview"]').first()
}

test('grounds shows the same two selects on paper and on forest', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.locator('[data-ground][class*="__face"]')).toHaveCount(2)
  await expect(demo.getByRole('combobox')).toHaveCount(4)

  // The paper face follows the page mode; the forest field is always dark.
  const paper = demo.locator('[data-ground="paper"][class*="__face"]')
  const forest = demo.locator('[data-ground="forest"][class*="__face"]')
  await expect(paper).toHaveAttribute('data-scheme', 'page')
  await expect(paper).not.toHaveAttribute('data-theme')
  await expect(forest).toHaveAttribute('data-scheme', 'dark')
  await expect(forest).toHaveAttribute('data-theme', 'dark')

  for (const [ground, name] of [
    [paper, 'paper'],
    [forest, 'forest'],
  ] as const) {
    await expect(ground.getByText(name, { exact: true })).toBeVisible()
    const season = ground.getByRole('combobox', { name: 'Season' })
    const show = ground.getByRole('combobox', { name: 'Show' })
    await expect(season).toHaveText('Autumn')
    await expect(show).toHaveText('Spring')
    await expect(season).toHaveAttribute('aria-expanded', 'false')
    await expect(show).toHaveAttribute('aria-expanded', 'false')
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('grounds opens and chooses on each ground, leaving the other untouched', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const paper = demo.locator('[data-ground="paper"][class*="__face"]')
  const forest = demo.locator('[data-ground="forest"][class*="__face"]')
  const listbox = page.getByRole('listbox')

  // Keyboard on the forest field: the popup renders outside the ground.
  const forestSeason = forest.getByRole('combobox', { name: 'Season' })
  await forestSeason.focus()
  await page.keyboard.press('Enter')
  await expect(listbox).toBeVisible()
  await expect(forest.getByRole('listbox')).toHaveCount(0)
  await expect(listbox.getByRole('option')).toHaveText(['Spring', 'Summer', 'Autumn', 'Winter'])
  await expect(listbox.getByRole('option', { name: 'Autumn' })).toHaveAttribute('aria-selected', 'true')
  await expect(listbox.getByRole('option', { name: 'Autumn' })).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(listbox.getByRole('option', { name: 'Winter' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(listbox).toBeHidden()
  await expect(forestSeason).toHaveText('Winter')
  await expect(forestSeason).toBeFocused()
  await expect(paper.getByRole('combobox', { name: 'Season' })).toHaveText('Autumn')

  // Pointer on the paper underline select, then an outside click dismisses without choosing.
  const paperShow = paper.getByRole('combobox', { name: 'Show' })
  await paperShow.click()
  await expect(listbox).toBeVisible()
  await expect(paperShow).toHaveAttribute('aria-expanded', 'true')
  await listbox.getByRole('option', { name: 'Summer' }).click()
  await expect(listbox).toBeHidden()
  await expect(paperShow).toHaveText('Summer')
  await expect(forest.getByRole('combobox', { name: 'Show' })).toHaveText('Spring')

  await paperShow.click()
  await expect(listbox).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(listbox).toBeHidden()
  await expect(paperShow).toHaveText('Summer')
  await expect(paperShow).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
