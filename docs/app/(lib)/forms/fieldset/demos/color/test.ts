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

test('color shows two groups, each taking its own primary scale', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  // A native fieldset is a group named by its legend.
  const groups = demo.getByRole('group')
  await expect(groups).toHaveCount(2)

  const plum = demo.getByRole('group', { name: 'Primary Plum' })
  const indigo = demo.getByRole('group', { name: 'Primary Indigo' })
  await expect(plum).toBeVisible()
  await expect(indigo).toBeVisible()

  // The primary axis is a scales module class; the open default and the framed outline differ.
  await expect(plum).toHaveClass(/primaryPlum/)
  await expect(plum).toHaveClass(/__text/)
  await expect(indigo).toHaveClass(/primaryIndigo/)
  await expect(indigo).toHaveClass(/__outline/)

  // Each group holds one labelled, enabled field.
  const city = plum.getByRole('textbox', { name: 'City' })
  const region = indigo.getByRole('textbox', { name: 'Region' })
  await expect(city).toBeEnabled()
  await expect(region).toBeEnabled()
  await expect(plum.getByRole('textbox')).toHaveCount(1)
  await expect(indigo.getByRole('textbox')).toHaveCount(1)

  // The legend's rule is decorative.
  await expect(plum.locator('legend [aria-hidden="true"]')).toHaveCount(1)

  // Colour does not change behaviour: the fields take focus and input.
  await city.click()
  await expect(city).toBeFocused()
  await page.keyboard.type('Portland')
  await expect(city).toHaveValue('Portland')
  await page.keyboard.press('Tab')
  await expect(region).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
