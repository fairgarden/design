import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('color sets each field on its primary scale', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  await expect(demo.getByRole('textbox')).toHaveCount(2)

  // Plum stepper: the root carries the plum primary scale; − and + both enabled at 4 of 0–20.
  const plum = demo.getByRole('textbox', { name: 'Primary Plum' })
  const plumGroup = plum.locator('xpath=ancestor::*[@role="group"][1]')
  await expect(plum).toHaveValue('4')
  await expect(plumGroup.locator('xpath=..')).toHaveClass(/primaryPlum/)
  await expect(plumGroup.getByText('kg')).toBeVisible()
  const decrease = plumGroup.getByRole('button', { name: 'Decrease' })
  const increase = plumGroup.getByRole('button', { name: 'Increase' })
  await expect(decrease).toBeEnabled()
  await expect(increase).toBeEnabled()

  // The colour does not change behaviour: it still steps.
  await increase.click()
  await expect(plum).toHaveValue('5')
  await plum.focus()
  await page.keyboard.press('ArrowDown')
  await expect(plum).toHaveValue('4')

  // Slate amount: the slate primary scale, a € prefix and no step cells.
  const slate = demo.getByRole('textbox', { name: 'Primary Slate' })
  const slateGroup = slate.locator('xpath=ancestor::*[@role="group"][1]')
  await expect(slate).toHaveValue('25')
  await expect(slateGroup.locator('xpath=..')).toHaveClass(/primarySlate/)
  await expect(slateGroup.getByText('€')).toBeVisible()
  await expect(slateGroup.getByRole('button')).toHaveCount(0)

  // At rest neither field is invalid, so no secondary (danger) scale applies.
  await expect(plum).not.toHaveAttribute('aria-invalid', 'true')
  await expect(slate).not.toHaveAttribute('aria-invalid', 'true')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
