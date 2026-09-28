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

test('basic shows its live button above its one-file code', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)
  // The loading state's actions are disabled stand-ins; the loaded ones are live.
  const copy = demo.getByRole('button', { name: 'Copy JoinCrew.tsx source' })
  await expect(copy).toBeEnabled({ timeout: 15000 })
  await expect(demo.getByRole('button', { name: 'Copy JoinCrew.tsx link' })).toBeEnabled()

  // One named file: its actions are inline, never in the "More actions" menu.
  await expect(demo.getByRole('button', { name: 'More actions' })).toHaveCount(0)
  // One variant: no variant Select, and no runtime error.
  await expect(demo.getByRole('combobox', { name: 'Variant' })).toHaveCount(0)
  await expect(demo.getByRole('alert')).toHaveCount(0)

  // The live component renders in the preview, reachable by keyboard.
  const join = demo.getByRole('button', { name: 'Join the Crew' })
  await expect(join).toBeVisible()
  await join.focus()
  await expect(join).toBeFocused()

  // The code beneath is the demo's source.
  await expect(demo.locator('pre').first()).toContainText('export function JoinCrew()')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
