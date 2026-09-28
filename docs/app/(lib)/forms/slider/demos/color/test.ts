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

test('color sets each slider on its primary scale', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.getByRole('slider')).toHaveCount(3)

  for (const [name, value, scale] of [
    ['Scope Colors', '40', null],
    ['Primary Plum', '60', /primaryPlum/],
    ['Primary Indigo', '80', /primaryIndigo/],
  ] as const) {
    // The root is a group named by its label; the thumb's range input takes the same name.
    const root = demo.getByRole('group', { name })
    const thumb = root.getByRole('slider', { name })
    await expect(thumb).toHaveAttribute('aria-valuenow', value)
    await expect(thumb).toHaveAttribute('min', '0')
    await expect(thumb).toHaveAttribute('max', '100')
    await expect(thumb).toBeEnabled()
    await expect(root.locator('output')).toHaveText(value)
    // `primary` lands on the root as a scale class; omitted, the slider inherits the scope.
    if (scale) await expect(root).toHaveClass(scale)
    else await expect(root).not.toHaveClass(/primary[A-Z]/)
    // `secondary` is unused, so no secondary scale class appears.
    await expect(root).not.toHaveClass(/secondary[A-Z]/)
  }

  // The colour does not change behaviour: the plum slider still steps from the keyboard.
  const plum = demo.getByRole('slider', { name: 'Primary Plum' })
  await plum.focus()
  await page.keyboard.press('ArrowRight')
  await expect(plum).toHaveAttribute('aria-valuenow', '61')
  await page.keyboard.press('PageDown')
  await expect(plum).toHaveAttribute('aria-valuenow', '51')
  await expect(demo.getByRole('group', { name: 'Primary Plum' }).locator('output')).toHaveText('51')
  // The others are untouched.
  await expect(demo.getByRole('slider', { name: 'Scope Colors' })).toHaveAttribute('aria-valuenow', '40')
  await expect(demo.getByRole('slider', { name: 'Primary Indigo' })).toHaveAttribute('aria-valuenow', '80')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
