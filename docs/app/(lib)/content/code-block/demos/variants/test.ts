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
  // The Demo's preview surface, the rendered demo without the Demo's own code section
  // (a CSS Module class, whose local name is stable across builds).
  const preview = demo.locator('[class*="__preview"]').first()
  return { demo, preview }
}

test('variants chooses a variant from the Select by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { preview } = await openDemo(page)
  // One file: its name, no tabs, and the variant Select inline in the header.
  await expect(preview.getByText('crewLabel.ts', { exact: true })).toBeVisible()
  await expect(preview.getByRole('tab')).toHaveCount(0)
  await expect(preview.getByRole('button', { name: 'Copy crewLabel.ts source' })).toBeVisible()
  const pre = preview.locator('pre')
  await expect(pre).toContainText('export function crewLabel(')

  const select = preview.getByRole('combobox', { name: 'Variant' })
  await expect(select).toHaveText('Function')

  await select.click()
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await expect(listbox.getByRole('option')).toHaveText(['Function', 'Arrow'])
  await listbox.getByRole('option', { name: 'Arrow' }).click()
  await expect(listbox).toBeHidden()
  await expect(select).toHaveText('Arrow')
  await expect(pre).toContainText('export const crewLabel = (')
  await expect(pre).not.toContainText('export function crewLabel(')

  // Back to Function from the keyboard; focus returns to the Select.
  await select.focus()
  await page.keyboard.press('Enter')
  await expect(listbox).toBeVisible()
  await page.keyboard.press('Home')
  await expect(listbox.getByRole('option', { name: 'Function' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(listbox).toBeHidden()
  await expect(select).toHaveText('Function')
  await expect(select).toBeFocused()
  await expect(pre).toContainText('export function crewLabel(')

  // Escape dismisses without choosing.
  await page.keyboard.press('Enter')
  await expect(listbox).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(listbox).toBeHidden()
  await expect(select).toHaveText('Function')
  await expect(select).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('variants switches between TypeScript and JavaScript', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { preview } = await openDemo(page)
  // The engine works the transform out in the browser, so the switch joins after hydration.
  const group = preview.getByRole('group', { name: 'Transpile to JavaScript' })
  await expect(group).toBeVisible({ timeout: 15000 })
  const ts = group.getByRole('button', { name: 'TS', exact: true })
  const js = group.getByRole('button', { name: 'JS', exact: true })
  await expect(ts).toHaveAttribute('aria-pressed', 'true')
  await expect(js).toHaveAttribute('aria-pressed', 'false')
  const pre = preview.locator('pre')
  await expect(pre).toContainText('type Shift =')

  // The control changes at once; the code swaps after it.
  await js.click()
  await expect(js).toHaveAttribute('aria-pressed', 'true')
  await expect(ts).toHaveAttribute('aria-pressed', 'false')
  await expect(pre).not.toContainText('type Shift')
  await expect(pre).not.toContainText(': string')
  await expect(pre).toContainText('export function crewLabel(')

  // Pressing the pressed half keeps one side on.
  await js.click()
  await expect(js).toHaveAttribute('aria-pressed', 'true')

  // The switch holds across variants.
  const select = preview.getByRole('combobox', { name: 'Variant' })
  await select.click()
  await page.getByRole('listbox').getByRole('option', { name: 'Arrow' }).click()
  await expect(select).toHaveText('Arrow')
  await expect(pre).toContainText('export const crewLabel = (')
  await expect(pre).not.toContainText('type Shift')
  await expect(js).toHaveAttribute('aria-pressed', 'true')

  // Back to TypeScript from the keyboard.
  await ts.focus()
  await page.keyboard.press('Space')
  await expect(ts).toHaveAttribute('aria-pressed', 'true')
  await expect(js).toHaveAttribute('aria-pressed', 'false')
  await expect(pre).toContainText('type Shift =')
  await expect(pre).toContainText('export const crewLabel = (')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
