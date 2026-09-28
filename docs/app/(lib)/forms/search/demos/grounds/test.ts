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
  // Each ground is the parent of its name.
  const paper = demo.getByText('paper', { exact: true }).locator('xpath=..')
  const forest = demo.getByText('forest', { exact: true }).locator('xpath=..')
  return { demo, paper, forest }
}

test('grounds sets a boxed and a ruled search on paper and on the forest field', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { demo, paper, forest } = await openDemo(page)
  await expect(demo.getByRole('search')).toHaveCount(4)

  // The paper face follows the page mode; the forest field is always dark.
  await expect(paper).toHaveAttribute('data-ground', 'paper')
  await expect(paper).toHaveAttribute('data-scheme', 'page')
  await expect(paper).not.toHaveAttribute('data-theme')
  await expect(forest).toHaveAttribute('data-ground', 'forest')
  await expect(forest).toHaveAttribute('data-scheme', 'dark')
  await expect(forest).toHaveAttribute('data-theme', 'dark')

  for (const [ground, preset, scheme] of [
    [paper, 'paper', 'page'],
    [forest, 'forest', 'dark'],
  ] as const) {
    await expect(ground.getByRole('search')).toHaveCount(2)
    const boxed = ground.getByRole('search', { name: `Search on ${preset}` })
    const ruled = ground.getByRole('search', { name: `Filter on ${preset}` })

    // Each landmark carries its own ground's scope, so its roles resolve there.
    for (const landmark of [boxed, ruled]) {
      await expect(landmark).toHaveAttribute('data-ground', preset)
      await expect(landmark).toHaveAttribute('data-scheme', scheme)
    }

    await expect(boxed.getByRole('combobox', { name: `Search on ${preset}` })).toBeVisible()
    await expect(ruled.getByRole('combobox', { name: `Filter on ${preset}` })).toBeVisible()
    // The boxed field keeps its butted submit on every ground; the ruled one has none.
    await expect(boxed.getByRole('button', { name: 'Search', exact: true })).toBeVisible()
    await expect(ruled.getByRole('button', { name: 'Search', exact: true })).toHaveCount(0)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('grounds opens the white popup from the forest field and closes on Escape', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { forest } = await openDemo(page)
  const field = forest.getByRole('combobox', { name: 'Search on forest' })

  await field.click()
  await field.pressSequentially('Mo')
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await expect(listbox.getByRole('option')).toHaveText(['Moths', 'Mosses'])

  // The popup is the white scope, which follows the page mode, not the forest's dark.
  const popup = listbox.locator('xpath=ancestor::*[@data-ground][1]')
  await expect(popup).toHaveAttribute('data-ground', 'white')
  await expect(popup).toHaveAttribute('data-scheme', 'page')
  await expect(popup).not.toHaveAttribute('data-theme')

  await page.keyboard.press('Escape')
  await expect(listbox).toBeHidden()
  await expect(field).toBeFocused()
  await expect(field).toHaveValue('Mo')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
