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
  // The Demo's preview surface, without its code panel (a stable CSS Module local name).
  return demo.locator('[class*="__preview"]').first()
}

test('statuses shows each status with its glyph name, role and scale', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  // Info, success and warning are polite status regions; danger is an alert.
  const statuses = demo.getByRole('status')
  await expect(statuses).toHaveCount(3)
  await expect(demo.getByRole('alert')).toHaveCount(1)

  const expected = [
    { alert: statuses.nth(0), glyph: 'Information', scale: /secondaryIndigo/, title: 'Trail closed.', message: 'The ridge loop reopens after the nesting season.' },
    { alert: statuses.nth(1), glyph: 'Success', scale: /secondaryGreen/, title: 'Saved.', message: 'Your volunteer shift is on the calendar.' },
    { alert: statuses.nth(2), glyph: 'Warning', scale: /secondaryAmber/, title: 'High water.', message: 'The lower ford may be impassable after rain.' },
    { alert: demo.getByRole('alert'), glyph: 'Error', scale: /secondaryRed/, title: "Couldn't load.", message: "The map service didn't answer." },
  ]

  for (const { alert, glyph, scale, title, message } of expected) {
    await expect(alert.getByRole('img', { name: glyph, exact: true })).toBeVisible()
    await expect(alert.locator('strong')).toHaveText(title)
    await expect(alert).toContainText(message)
    await expect(alert).toHaveClass(scale)
  }

  // Only the danger alert carries an action.
  await expect(demo.getByRole('button')).toHaveCount(1)
  await expect(demo.getByRole('alert').getByRole('button', { name: 'Retry' })).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('statuses counts retries from the pointer and the keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const danger = demo.getByRole('alert')
  const retry = danger.getByRole('button', { name: 'Retry' })

  await expect(danger).toContainText("The map service didn't answer.")
  await expect(danger).not.toContainText('retries')

  await retry.click()
  await expect(danger).toContainText("The map service didn't answer (1 retries).")

  // Enter and Space both activate the focused button.
  await retry.focus()
  await page.keyboard.press('Enter')
  await expect(danger).toContainText('(2 retries)')
  await page.keyboard.press('Space')
  await expect(danger).toContainText('(3 retries)')
  await expect(retry).toBeFocused()

  // The other alerts are untouched.
  await expect(demo.getByRole('status')).toHaveCount(3)
  await expect(demo.getByRole('status').filter({ hasText: 'retries' })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
