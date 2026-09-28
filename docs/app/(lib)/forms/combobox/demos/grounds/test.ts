import path from 'node:path'
import { test, expect, type Locator, type Page } from '@playwright/test'

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
  // Scope to the preview; the code panel repeats the source text.
  return { demo: demo.locator('[class*="__preview"]').first(), pageErrors }
}

// Each face is the Ground section the preset's name heads.
const faceOf = (demo: Locator, preset: string) =>
  demo.getByText(preset, { exact: true }).locator('xpath=parent::*')

// The box is the input's nearest ancestor holding its chevron, so it spans the chips and buttons.
const boxOf = (input: Locator) =>
  input.locator('xpath=ancestor::*[.//button[@aria-label="Show options"]][1]')

test('grounds puts one combobox on each ground', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  await expect(demo.getByRole('combobox', { name: 'Parks Visited', exact: true })).toHaveCount(2)

  const paper = faceOf(demo, 'paper')
  await expect(paper).toHaveAttribute('data-ground', 'paper')
  await expect(paper).toHaveAttribute('data-scheme', 'page')
  await expect(paper).not.toHaveAttribute('data-theme')

  const forest = faceOf(demo, 'forest')
  await expect(forest).toHaveAttribute('data-ground', 'forest')
  await expect(forest).toHaveAttribute('data-scheme', 'dark')
  await expect(forest).toHaveAttribute('data-theme', 'dark')

  for (const [preset, face] of [
    ['paper', paper],
    ['forest', forest],
  ] as const) {
    const input = face.getByRole('combobox', { name: 'Parks Visited', exact: true })
    await expect(input).toHaveValue('')
    await expect(input).toHaveAttribute('placeholder', 'Add a park…')
    // The box and its chip follow the ground.
    const box = boxOf(input)
    await expect(input.locator('xpath=ancestor::*[@role="group"][1]')).toHaveAttribute(
      'data-ground',
      preset,
    )
    await expect(box.getByRole('button', { name: /^Remove / })).toHaveCount(1)
    await expect(box.getByRole('button', { name: 'Remove Acadia' })).toBeVisible()
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('grounds opens a white popup from the forest field', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const forest = faceOf(demo, 'forest')
  const input = forest.getByRole('combobox', { name: 'Parks Visited', exact: true })
  const box = boxOf(input)

  // Pointer: the chevron opens the list.
  await box.locator('button[aria-label="Show options"]').click()
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await expect(input).toHaveAttribute('aria-expanded', 'true')
  await expect(listbox.getByRole('option')).toHaveCount(4)
  await expect(listbox.getByRole('option', { name: 'Acadia' })).toHaveAttribute(
    'aria-selected',
    'true',
  )

  // The popup is the white scope, whatever the ground.
  const popup = listbox.locator('xpath=ancestor::*[@data-ground][1]')
  await expect(popup).toHaveAttribute('data-ground', 'white')
  await expect(popup).not.toHaveAttribute('data-theme')

  await listbox.getByRole('option', { name: 'Glacier' }).click()
  // The multiple popup stays open and aria-hides the rest of the page, so count chips by label.
  await expect(box.locator('button[aria-label^="Remove "]')).toHaveCount(2)
  await expect(box.getByRole('button', { name: 'Remove Glacier' })).toBeVisible()

  // The paper field is untouched.
  await expect(faceOf(demo, 'paper').locator('button[aria-label^="Remove "]')).toHaveCount(1)

  // Keyboard: Escape dismisses and focus stays in the input.
  await input.focus()
  await page.keyboard.press('ArrowDown')
  await expect(listbox).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(listbox).toBeHidden()
  await expect(input).toBeFocused()
  await expect(input).toHaveAttribute('aria-expanded', 'false')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
