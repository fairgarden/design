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

test('kinds shows inline, standalone, nav, list, muted and external links', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.getByRole('link')).toHaveCount(10)

  // Inline, in running text.
  const inline = demo.getByRole('link', { name: 'trail conditions' })
  await expect(inline).toHaveAttribute('href', '#kinds')
  await expect(demo.getByText('before you set out.')).toBeVisible()

  // Standalone, with a decorative chevron that stays out of its name.
  const standalone = demo.getByRole('link', { name: 'See all trails', exact: true })
  await expect(standalone).toBeVisible()
  await expect(standalone.locator('svg[aria-hidden="true"]')).toHaveCount(1)

  // Nav: the current link is marked with data-active, the rest are not.
  const nav = demo.getByRole('navigation', { name: 'Example navigation' })
  await expect(nav.getByRole('link')).toHaveCount(3)
  await expect(nav.getByRole('link', { name: 'Trails' })).toHaveAttribute('data-active', '')
  for (const name of ['Maps', 'Events']) {
    await expect(nav.getByRole('link', { name })).not.toHaveAttribute('data-active', /.*/)
  }

  // List links.
  const list = demo.getByRole('list', { name: 'Example list links' })
  await expect(list.getByRole('listitem')).toHaveCount(2)
  await expect(list.getByRole('link', { name: 'Trail maps' })).toBeVisible()
  await expect(list.getByRole('link', { name: 'Volunteer days' })).toBeVisible()

  // Muted links.
  const muted = demo.getByRole('navigation', { name: 'Example muted links' })
  await expect(muted.getByRole('link')).toHaveCount(2)
  await expect(muted.getByRole('link', { name: 'Guides' })).toBeVisible()
  await expect(muted.getByRole('link', { name: 'Trail care' })).toBeVisible()

  // External: the arrow mark is hidden, "(external site)" is announced.
  const external = demo.getByRole('link', { name: /^USGS\s*\(external site\)/ })
  await expect(external).toHaveAttribute('href', 'https://www.usgs.gov')
  await expect(external.locator('svg[aria-hidden="true"]')).toHaveCount(1)

  // Every link is in the tab order, in source order.
  await inline.focus()
  await page.keyboard.press('Tab')
  await expect(standalone).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(nav.getByRole('link', { name: 'Trails' })).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
