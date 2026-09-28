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
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return { demo, pageErrors }
}

const message = "TypeError: Cannot read properties of undefined (reading 'species')"

test('error lays the reported error across the preview and clears it', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)
  const alert = demo.getByRole('alert')
  const toggle = demo.getByRole('button', { name: /^(Pass a Plot|Drop the Plot)$/ })

  // The provider reports the error from the start.
  await expect(alert).toHaveText(message)
  await expect(toggle).toHaveText('Pass a Plot')

  // The button clears it; the preview stays put.
  await toggle.click()
  await expect(alert).toHaveCount(0)
  await expect(toggle).toHaveText('Drop the Plot')
  await expect(toggle).toBeVisible()

  // And reports it again, from the keyboard.
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(alert).toHaveText(message)
  await expect(toggle).toHaveText('Pass a Plot')
  await expect(toggle).toBeFocused()

  await page.keyboard.press('Space')
  await expect(alert).toHaveCount(0)
  await expect(toggle).toHaveText('Drop the Plot')

  // The error is reported through the engine, never thrown.
  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
