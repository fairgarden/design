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
  return { demo, pageErrors }
}

// The box is the input's nearest scope-writing ancestor (Base UI's InputGroup).
const boxOf = (input: Locator) =>
  input.locator('xpath=ancestor::*[@data-ground][1]')

test('color recolors the box and chips, not the popup', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const plum = demo.getByRole('combobox', { name: 'Primary Plum', exact: true })
  const slate = demo.getByRole('combobox', { name: 'Primary Slate', exact: true })
  await expect(demo.getByRole('combobox', { name: /^Primary / })).toHaveCount(2)

  // Plum: a multiple box with one chip, carrying the plum scale.
  const plumBox = boxOf(plum)
  await expect(plumBox).toHaveClass(/primaryPlum/)
  await expect(plumBox.getByRole('button', { name: /^Remove / })).toHaveCount(1)
  await expect(plumBox.getByRole('button', { name: 'Remove Bexley' })).toBeVisible()
  await expect(plum).toHaveValue('')

  // Slate: a single box, empty, carrying the slate scale.
  const slateBox = boxOf(slate)
  await expect(slateBox).toHaveClass(/primarySlate/)
  await expect(slateBox).not.toHaveClass(/primaryPlum/)
  await expect(slate).toHaveValue('')
  await expect(slate).toHaveAttribute('placeholder', 'Choose a town…')
  await expect(slateBox.getByRole('button', { name: /^Remove / })).toHaveCount(0)

  // The popup is the white scope with its own defaults, not the box's slate.
  await slate.focus()
  await page.keyboard.press('ArrowDown')
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await expect(slate).toHaveAttribute('aria-expanded', 'true')
  await expect(listbox.getByRole('option')).toHaveCount(4)
  const popup = listbox.locator('xpath=ancestor::*[@data-ground][1]')
  await expect(popup).toHaveAttribute('data-ground', 'white')
  await expect(popup).not.toHaveAttribute('data-theme')
  await expect(popup).not.toHaveClass(/primarySlate/)

  await page.keyboard.press('Escape')
  await expect(listbox).toBeHidden()
  await expect(slate).toBeFocused()
  await expect(slate).toHaveValue('')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('color adds and removes plum chips', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const plum = demo.getByRole('combobox', { name: 'Primary Plum', exact: true })
  const plumBox = boxOf(plum)

  // Keyboard: filter, highlight and choose.
  await plum.focus()
  await page.keyboard.type('dun')
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await expect(listbox.getByRole('option')).toHaveCount(1)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(plumBox.getByRole('button', { name: /^Remove / })).toHaveCount(2)
  await expect(plumBox.getByRole('button', { name: 'Remove Dunmore' })).toBeVisible()
  await expect(plum).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(listbox).toBeHidden()

  // Pointer: remove the first chip.
  await plumBox.getByRole('button', { name: 'Remove Bexley' }).click()
  await expect(plumBox.getByRole('button', { name: /^Remove / })).toHaveCount(1)
  await expect(plumBox.getByRole('button', { name: 'Remove Bexley' })).toHaveCount(0)
  await expect(plumBox).toHaveClass(/primaryPlum/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
