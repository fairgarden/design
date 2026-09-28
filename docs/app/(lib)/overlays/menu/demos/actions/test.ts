import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('actions moves through its items with the arrow keys', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const trigger = demo.getByRole('button', { name: 'Note Actions' })
  await trigger.focus()
  await page.keyboard.press('Enter')

  const menu = page.getByRole('menu', { name: 'Note Actions' })
  await expect(menu).toBeVisible()
  const item = (name: string) => menu.getByRole('menuitem', { name })
  await expect(item('Download note')).toBeFocused()

  await page.keyboard.press('ArrowDown')
  await expect(item('Find similar notes')).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(item('Move to')).toBeFocused()
  // Over the separator, into the Danger zone group.
  await page.keyboard.press('ArrowDown')
  await expect(item('Delete note')).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(item('Move to')).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
