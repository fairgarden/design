import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('color sets the primary scale per field and gives the error the danger scale', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const trail = demo.getByRole('textbox', { name: 'Trail Name', exact: true })
  const group = demo.getByRole('textbox', { name: 'Group Size', exact: true })
  await expect(demo.getByRole('textbox')).toHaveCount(2)

  // Plum field: at rest, described by its helper text.
  await expect(trail).toHaveAttribute('placeholder', 'Ridge loop…')
  await expect(trail).not.toHaveAttribute('aria-invalid', 'true')
  await expect(trail).toHaveAccessibleDescription('Primary plum: label, edge, value and ring.')
  // The Field root carries the plum primary scale (a CSS Module class, stable by local name).
  const plumField = demo.locator('[class*="primaryPlum"]', { has: trail })
  await expect(plumField).toHaveCount(1)
  await expect(plumField).not.toHaveAttribute('data-invalid')

  // Slate field with an indigo secondary, forced invalid.
  await expect(group).toHaveValue('40')
  await expect(group).toHaveAttribute('aria-invalid', 'true')
  const slateField = demo.locator('[class*="primarySlate"]', { has: group })
  await expect(slateField).toHaveCount(1)
  await expect(slateField).toHaveClass(/secondaryIndigo/)
  await expect(slateField).toHaveAttribute('data-invalid', '')

  // While invalid, the error takes the danger (red) scale in place of the indigo secondary.
  const message = 'Groups are 12 or fewer. Enter 1–12.'
  await expect(demo.getByText(message, { exact: true })).toBeVisible()
  await expect(group).toHaveAccessibleDescription(message)
  const errorPart = slateField.locator('[class*="secondaryRed"]', { hasText: message })
  await expect(errorPart).toHaveCount(1)
  await expect(errorPart).not.toHaveClass(/secondaryIndigo/)

  // The two labels resolve to different inks: the primary scale reaches the label.
  const ink = (text: string) =>
    demo.getByText(text, { exact: true }).evaluate((element) => getComputedStyle(element).color)
  expect(await ink('Trail Name')).not.toBe(await ink('Group Size'))

  // The recolored control still takes input.
  await trail.click()
  await expect(trail).toBeFocused()
  await page.keyboard.type('Ridge Loop')
  await expect(trail).toHaveValue('Ridge Loop')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
