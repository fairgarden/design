import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

// The buttons in source order, with the variant and scale classes each one
// takes (CSS Module local names, stable across builds).
const buttons = [
  { name: 'Scope Action', variant: /solid/, scale: null },
  { name: 'Secondary Indigo', variant: /solid/, scale: /secondaryIndigo/ },
  { name: 'Primary Plum', variant: /outline/, scale: /primaryPlum/ },
  { name: 'Secondary Orange', variant: /(__|_)text(__|_|\s|$)/, scale: /secondaryOrange/ },
] as const

test('color renders each variant with its primary or secondary scale', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const all = demo.getByRole('button')
  await expect(all).toHaveCount(buttons.length)
  await expect(all).toHaveText(buttons.map((b) => b.name))

  for (const { name, variant, scale } of buttons) {
    const button = demo.getByRole('button', { name, exact: true })
    await expect(button).toBeVisible()
    await expect(button).toBeEnabled()
    await expect(button).toHaveClass(variant)
    if (scale) await expect(button).toHaveClass(scale)
  }

  // The scope's own action scale: no secondary override on the first button.
  await expect(demo.getByRole('button', { name: 'Scope Action' })).not.toHaveClass(/secondary[A-Z]/)
  await expect(demo.getByRole('button', { name: 'Scope Action' })).not.toHaveClass(/primary[A-Z]/)

  // The text button's glyph trails its label and stays out of the accessible name.
  const orange = demo.getByRole('button', { name: 'Secondary Orange', exact: true })
  const glyph = orange.locator('[aria-hidden="true"]').first()
  await expect(glyph).toBeAttached()
  const glyphTrails = await orange.evaluate((el) => {
    const hidden = el.querySelector('[aria-hidden="true"]')
    const label = Array.from(el.children).find((child) => child.textContent?.includes('Secondary Orange'))
    return !!hidden && !!label && !!(label.compareDocumentPosition(hidden) & Node.DOCUMENT_POSITION_FOLLOWING)
  })
  expect(glyphTrails, 'the text button glyph should sit after its label').toBe(true)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('color moves focus through the buttons by keyboard and takes presses', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const first = demo.getByRole('button', { name: buttons[0].name, exact: true })
  await first.focus()
  await expect(first).toBeFocused()
  for (const { name } of buttons.slice(1)) {
    await page.keyboard.press('Tab')
    await expect(demo.getByRole('button', { name, exact: true })).toBeFocused()
  }
  await page.keyboard.press('Shift+Tab')
  await expect(demo.getByRole('button', { name: buttons[2].name, exact: true })).toBeFocused()

  // Keyboard and pointer presses leave each button in place and focusable.
  await page.keyboard.press('Enter')
  await page.keyboard.press('Space')
  await expect(demo.getByRole('button', { name: buttons[2].name, exact: true })).toBeFocused()
  const indigo = demo.getByRole('button', { name: buttons[1].name, exact: true })
  await indigo.click()
  await expect(indigo).toBeFocused()
  await expect(demo.getByRole('button')).toHaveCount(buttons.length)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
