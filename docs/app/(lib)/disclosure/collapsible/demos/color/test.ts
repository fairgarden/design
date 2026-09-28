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
  // The Demo's preview surface, the rendered demo without its code panel (a CSS Module class,
  // whose local name is stable across builds), so source text and code buttons never match.
  return demo.locator('[class*="__preview"]').first()
}

test('color sets each primary scale and keeps its own open state', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  // Two collapsibles, one per primary scale (a CSS Module class, whose local name is stable).
  const plum = demo.locator('[class*="primaryPlum"]')
  const bronze = demo.locator('[class*="primaryBronze"]')
  await expect(plum).toHaveCount(1)
  await expect(bronze).toHaveCount(1)
  await expect(demo.getByRole('button')).toHaveCount(2)

  // Plum starts closed: the closed label names the trigger and the panel text is hidden.
  const plumTrigger = plum.getByRole('button')
  await expect(plumTrigger).toHaveAccessibleName('Show details')
  await expect(plumTrigger).toHaveAttribute('aria-expanded', 'false')
  await expect(plum.getByText('Primary plum.')).toBeHidden()

  // Bronze is open by default: the open label replaces the closed one.
  const bronzeTrigger = bronze.getByRole('button')
  await expect(bronzeTrigger).toHaveAccessibleName('Hide details')
  await expect(bronzeTrigger).toHaveAttribute('aria-expanded', 'true')
  await expect(bronze.getByText('Primary bronze, open.')).toBeVisible()

  // Pointer: opening plum swaps its label and leaves bronze alone.
  await plumTrigger.click()
  await expect(plumTrigger).toHaveAttribute('aria-expanded', 'true')
  await expect(plumTrigger).toHaveAccessibleName('Hide details')
  await expect(plum.getByText('Primary plum.')).toBeVisible()
  await expect(bronzeTrigger).toHaveAttribute('aria-expanded', 'true')

  // Keyboard: Enter closes bronze, focus stays on its trigger.
  await bronzeTrigger.focus()
  await page.keyboard.press('Enter')
  await expect(bronzeTrigger).toHaveAttribute('aria-expanded', 'false')
  await expect(bronzeTrigger).toHaveAccessibleName('Show details')
  await expect(bronze.getByText('Primary bronze, open.')).toBeHidden()
  await expect(bronzeTrigger).toBeFocused()
  await expect(plumTrigger).toHaveAttribute('aria-expanded', 'true')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
