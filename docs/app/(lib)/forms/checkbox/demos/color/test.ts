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
  return demo
}

test('color sets each checkbox scale and keeps the checked states', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.getByRole('checkbox')).toHaveCount(4)

  const scope = demo.getByRole('checkbox', { name: 'Scope Colors' })
  const indigo = demo.getByRole('checkbox', { name: 'Secondary Indigo' })
  const plum = demo.getByRole('checkbox', { name: 'Primary Plum' })
  const group = demo.getByRole('group', { name: 'Teal group' })
  const teal = group.getByRole('checkbox', { name: 'Group in Teal' })

  await expect(scope).toBeChecked()
  await expect(indigo).toBeChecked()
  await expect(plum).not.toBeChecked()
  await expect(teal).toBeChecked()

  // The scale props land on the row (the checkbox's label) and on the group.
  const row = (checkbox: typeof scope) => checkbox.locator('xpath=..')
  await expect(row(scope)).not.toHaveClass(/primary[A-Z]|secondary[A-Z]/)
  await expect(row(indigo)).toHaveClass(/secondaryIndigo/)
  await expect(row(plum)).toHaveClass(/primaryPlum/)
  await expect(group).toHaveClass(/secondaryTeal/)

  // Color never changes behaviour: the plum box toggles from the keyboard and the pointer.
  await plum.focus()
  await page.keyboard.press('Space')
  await expect(plum).toBeChecked()
  await demo.getByText('Primary Plum', { exact: true }).click()
  await expect(plum).not.toBeChecked()
  await teal.click()
  await expect(teal).not.toBeChecked()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
