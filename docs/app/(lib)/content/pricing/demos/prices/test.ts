import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('prices renders inline, sale and menu prices as data elements', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before asserting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // Every price is a `data` element with a machine-readable value.
  const prices = demo.locator('data')
  await expect(prices).toHaveCount(4)
  await expect(prices.nth(0)).toHaveAttribute('value', '12')
  await expect(prices.nth(1)).toHaveAttribute('value', '480')
  await expect(prices.nth(2)).toHaveAttribute('value', '180')
  await expect(prices.nth(3)).toHaveAttribute('value', '4.50')

  // Inline: a span in running text, with the qualifier, figure and period.
  const copy = demo.locator('p').filter({ hasText: 'Guided walks' })
  await expect(copy).toHaveText(/Guided walks\s+from \$12\s+per person, children free\./)
  const inline = copy.locator('span').filter({ has: page.locator('data[value="12"]') }).first()
  await expect(inline).toBeVisible()
  await expect(prices.nth(0)).toContainText('from')
  await expect(prices.nth(0)).toContainText('per person')

  // Sale: the original struck with a hidden "Was", the current price with a hidden "Now",
  // and the saving as a word.
  const struck = demo.locator('s')
  await expect(struck).toHaveCount(1)
  await expect(struck).toHaveText(/^Was\s*\$480$/)
  await expect(struck.locator('data')).toHaveAttribute('value', '480')
  await expect(prices.nth(2)).toHaveText(/^Now\s*\$180$/)
  await expect(demo.getByText('Save $300', { exact: true })).toBeVisible()

  // Menu: the figure with superscript cents.
  await expect(prices.nth(3)).toHaveText('$450')
  await expect(prices.nth(3).getByText('50', { exact: true })).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
