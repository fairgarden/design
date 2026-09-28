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
  return demo.locator('[class*="__preview"]').first()
}

test('color sets each switch scale and keeps the on and off states', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.getByRole('switch')).toHaveCount(3)

  const scope = demo.getByRole('switch', { name: 'Scope Colors' })
  const indigo = demo.getByRole('switch', { name: 'Secondary Indigo' })
  const plum = demo.getByRole('switch', { name: 'Primary Plum' })

  await expect(scope).toHaveAttribute('aria-checked', 'true')
  await expect(indigo).toHaveAttribute('aria-checked', 'true')
  await expect(plum).toHaveAttribute('aria-checked', 'false')

  // The scale props land on the row (the switch's label); the state word follows the value.
  const row = (control: typeof scope) => control.locator('xpath=..')
  await expect(row(scope)).not.toHaveClass(/primary[A-Z]|secondary[A-Z]/)
  await expect(row(indigo)).toHaveClass(/secondaryIndigo/)
  await expect(row(plum)).toHaveClass(/primaryPlum/)
  await expect(row(scope).getByText('On', { exact: true })).toBeVisible()
  await expect(row(indigo).getByText('On', { exact: true })).toBeVisible()
  await expect(row(plum).getByText('Off', { exact: true })).toBeVisible()

  // Color never changes behaviour: the plum switch flips from the keyboard and the pointer.
  await plum.focus()
  await page.keyboard.press('Space')
  await expect(plum).toHaveAttribute('aria-checked', 'true')
  await expect(row(plum).getByText('On', { exact: true })).toBeVisible()
  await expect(plum).toBeFocused()
  await demo.getByText('Primary Plum', { exact: true }).click()
  await expect(plum).toHaveAttribute('aria-checked', 'false')
  await indigo.click()
  await expect(indigo).toHaveAttribute('aria-checked', 'false')
  await expect(row(indigo).getByText('Off', { exact: true })).toBeVisible()
  // The others keep their own state.
  await expect(scope).toHaveAttribute('aria-checked', 'true')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
