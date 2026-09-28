import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('hero sets one numeral on the mount with its caption, and one inline in text', async ({
  page,
}) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before asserting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // The hero is a figure: the numeral on the mount, then the caption with label and qualifier.
  const hero = demo.getByRole('figure')
  await expect(hero).toHaveCount(1)
  await expect(hero.locator('p')).toHaveText('42')
  const caption = hero.locator('figcaption')
  await expect(caption).toContainText('Nesting pairs')
  await expect(caption).toContainText('of bald eagles on the river, up from 6 in 2001')

  // The blob mount is decoration: hidden from assistive technology and never focusable.
  const mount = hero.locator('svg')
  await expect(mount).toHaveCount(1)
  await expect(mount).toHaveAttribute('aria-hidden', 'true')
  await expect(mount).toHaveAttribute('focusable', 'false')

  // The inline stat sits in the running text, not in a figure or a list of its own.
  const paragraph = demo.locator('p').filter({ hasText: 'The new index answers a query in' })
  await expect(paragraph).toHaveCount(1)
  await expect(paragraph).toHaveText(
    /answers a query in\s*38\s*ms\s*at the 95th percentile\s*, fast enough for the search field to update as you type\./,
  )
  await expect(paragraph.getByRole('figure')).toHaveCount(0)
  await expect(paragraph.locator('dl, figure, div')).toHaveCount(0)
  await expect(paragraph.getByText(/^38\s*ms$/)).toBeVisible()

  // Neither stat draws a delta glyph or offers anything to focus.
  await expect(demo.getByRole('img', { name: /^(Up|Down)$/ })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
