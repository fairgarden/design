import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('kinds opens a panel with a close button and returns focus', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const trigger = demo.getByRole('button', { name: 'Trail Details' })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  // Pointer: open, then close with the panel's own X.
  await trigger.click()
  const panel = page.getByRole('dialog', { name: 'Ridge Loop' })
  await expect(panel).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(panel).toContainText('6.4 km with 310 m of climbing.')
  const close = panel.getByRole('button', { name: 'Close' })
  await expect(close).toBeVisible()
  await close.click()
  await expect(panel).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()

  // Keyboard: open with Enter, dismiss with Escape.
  await page.keyboard.press('Enter')
  await expect(panel).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(trigger).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds opens a definition with its source and closes on an outside press', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  await expect(demo.getByRole('button')).toContainText(['Trail Details', 'Riparian Buffer'])
  const trigger = demo.getByRole('button', { name: 'Riparian Buffer' })

  await trigger.focus()
  await page.keyboard.press('Space')
  const definition = page.getByRole('dialog', { name: 'Riparian buffer' })
  await expect(definition).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(definition).toContainText('The strip of native plants along a stream')
  await expect(definition).toContainText('State Watershed Guide, 2024')
  // The definition kind has no close X.
  await expect(definition.getByRole('button', { name: 'Close' })).toHaveCount(0)

  // An outside press closes it.
  await page.mouse.click(5, 5)
  await expect(definition).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
