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
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before asserting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  // The Demo's preview surface, without its code (a CSS Module class, stable across builds).
  const preview = demo.locator('[class*="__preview"]').first()
  return { demo, preview }
}

test('color recolors separators with the primary scale', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { preview } = await openDemo(page)
  const labels = preview.locator('code')
  await expect(labels).toHaveText([
    'scope default (olive)',
    'primary="plum"',
    'primary="indigo" variant="doubleHair"',
  ])

  const separators = preview.getByRole('separator')
  await expect(separators).toHaveCount(3)
  for (const index of [0, 1, 2]) {
    await expect(separators.nth(index)).not.toHaveAttribute('aria-orientation', 'vertical')
  }

  // Without a primary, the separator inherits the scope: no primary scale class of its own.
  await expect(separators.nth(0)).not.toHaveClass(/__primary[A-Z]/)
  await expect(separators.nth(0)).toHaveClass(/__rule(\s|$)/)
  await expect(separators.nth(1)).toHaveClass(/__primaryPlum(\s|$)/)
  await expect(separators.nth(1)).toHaveClass(/__rule(\s|$)/)
  await expect(separators.nth(2)).toHaveClass(/__primaryIndigo(\s|$)/)
  await expect(separators.nth(2)).toHaveClass(/__doubleHair(\s|$)/)

  // The plum and indigo rules actually paint differently from the scope default.
  const colors = await separators.evaluateAll((elements) =>
    // The line is drawn in currentColor, set from --role-rule on each separator's own root.
    elements.map((element) => getComputedStyle(element).color),
  )
  expect(new Set(colors).size, 'each primary scale should paint its own line').toBe(3)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
