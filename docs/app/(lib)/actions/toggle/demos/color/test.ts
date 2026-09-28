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

test('color shows a pressed toggle and two selected chip groups', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const plum = demo.getByRole('button', { name: 'Primary Plum' })
  await expect(plum).toHaveAttribute('aria-pressed', 'true')
  await expect(plum).toBeEnabled()

  const scope = demo.getByRole('group', { name: 'Scope chips' })
  const indigo = demo.getByRole('group', { name: 'Indigo chips' })
  await expect(scope.getByRole('button')).toHaveCount(1)
  await expect(indigo.getByRole('button')).toHaveCount(1)
  await expect(scope.getByRole('button', { name: 'Scope Chip' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(indigo.getByRole('button', { name: 'Secondary Indigo' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  // The secondary scale is a class on the group, so the two chip groups differ in class.
  const scopeClass = await scope.getAttribute('class')
  const indigoClass = await indigo.getAttribute('class')
  expect(indigoClass).not.toEqual(scopeClass)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('color toggles by pointer and keyboard', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const plum = demo.getByRole('button', { name: 'Primary Plum' })
  await plum.click()
  await expect(plum).toHaveAttribute('aria-pressed', 'false')
  await expect(plum).toBeFocused()
  await page.keyboard.press('Space')
  await expect(plum).toHaveAttribute('aria-pressed', 'true')

  const chip = demo.getByRole('button', { name: 'Secondary Indigo' })
  await chip.click()
  await expect(chip).toHaveAttribute('aria-pressed', 'false')
  await page.keyboard.press('Enter')
  await expect(chip).toHaveAttribute('aria-pressed', 'true')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
