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

test('filtered narrows the list and updates the count by pointer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const virtualOnly = demo.getByRole('button', { name: 'Virtual Only' })
  const hideVirtual = demo.getByRole('button', { name: 'Hide Virtual' })
  const count = demo.getByRole('status').filter({ hasText: /\d+ events?/ })
  const items = demo.getByRole('listitem')

  await expect(virtualOnly).toHaveAttribute('aria-pressed', 'false')
  await expect(hideVirtual).toHaveAttribute('aria-pressed', 'false')
  await expect(count).toHaveText('4 events')
  await expect(count).toHaveAttribute('aria-live', 'polite')
  await expect(items).toHaveCount(4)
  for (const title of ['Night walk', 'Seed swap', 'Stream ecology talk', 'Trail crew day']) {
    await expect(demo.getByRole('link', { name: title })).toBeVisible()
  }

  await virtualOnly.click()
  await expect(virtualOnly).toHaveAttribute('aria-pressed', 'true')
  await expect(count).toHaveText('1 event')
  await expect(items).toHaveCount(1)
  await expect(items.first()).toContainText('Stream ecology talk')
  await expect(items.first()).toContainText('Virtual')

  await virtualOnly.click()
  await expect(virtualOnly).toHaveAttribute('aria-pressed', 'false')
  await hideVirtual.click()
  await expect(hideVirtual).toHaveAttribute('aria-pressed', 'true')
  await expect(count).toHaveText('3 events')
  await expect(items).toHaveCount(3)
  await expect(demo.getByRole('link', { name: 'Stream ecology talk' })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('filtered shows the empty state and clears it from the keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const virtualOnly = demo.getByRole('button', { name: 'Virtual Only' })
  const hideVirtual = demo.getByRole('button', { name: 'Hide Virtual' })
  const count = demo.getByRole('status').filter({ hasText: /\d+ events?/ })

  await virtualOnly.focus()
  await page.keyboard.press('Space')
  await expect(virtualOnly).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Tab')
  await expect(hideVirtual).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(hideVirtual).toHaveAttribute('aria-pressed', 'true')

  // Both filters leave nothing: the list gives way to a filtered EmptyState (a status region),
  // and the count stays mounted with its new text.
  await expect(count).toHaveText('0 events')
  await expect(demo.getByRole('listitem')).toHaveCount(0)
  const empty = demo.getByRole('status').filter({ hasText: 'No events match these filters' })
  await expect(empty).toBeVisible()
  await expect(
    empty.getByRole('heading', { level: 3, name: 'No events match these filters' }),
  ).toBeVisible()
  await expect(empty).toContainText('leave nothing to show')

  const clear = empty.getByRole('button', { name: 'Clear Filters' })
  await clear.focus()
  await page.keyboard.press('Enter')

  await expect(empty).toHaveCount(0)
  await expect(count).toHaveText('4 events')
  await expect(demo.getByRole('listitem')).toHaveCount(4)
  await expect(virtualOnly).toHaveAttribute('aria-pressed', 'false')
  await expect(hideVirtual).toHaveAttribute('aria-pressed', 'false')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
