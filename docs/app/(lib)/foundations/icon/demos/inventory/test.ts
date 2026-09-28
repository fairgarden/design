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
  // The rendered demo, without its code panel and toolbar (a CSS Module class, whose local
  // name is stable across builds), so counts and text only see what the demo draws.
  return demo.locator('[class*="__preview"]').first()
}

const inventory = [
  'search',
  'arrow_forward',
  'arrow_upward',
  'expand_more',
  'close',
  'remove',
  'add',
  'check',
  'circle',
  'chevron_right',
  'chevron_left',
  'menu',
  'more_horiz',
  'more_vert',
  'play_arrow',
  'pause',
  'download',
  'zoom_in',
  'zoom_out',
  'recenter',
  'help',
  'mail',
  'content_copy',
  'link',
  'open_in_new',
  'restart_alt',
  'description',
  'widgets',
  'deployed_code',
  'format_h2',
  'format_h3',
]

test('inventory lists every icon with its name', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  const list = demo.getByRole('list')
  await expect(list).toHaveCount(1)
  const items = list.getByRole('listitem')
  await expect(items).toHaveCount(inventory.length)

  // In inventory order, each cell names its glyph in code.
  await expect(items.locator('code')).toHaveText(inventory)

  for (const [index, name] of inventory.entries()) {
    const item = items.nth(index)
    const icon = item.locator('svg')
    await expect(icon).toHaveCount(1)
    // Beside its visible name, the icon is decorative: hidden, unlabelled, not focusable.
    await expect(icon).toHaveAttribute('aria-hidden', 'true')
    await expect(icon).not.toHaveAttribute('aria-label')
    await expect(icon).toHaveAttribute('focusable', 'false')
    await expect(icon).toHaveAttribute('viewBox', '0 -960 960 960')
    // Rest weight only: one path.
    await expect(icon.locator('path')).toHaveCount(1)
    await expect(item.getByText(name, { exact: true })).toBeVisible()
  }

  // No icon reaches the accessibility tree as an image.
  await expect(demo.getByRole('img')).toHaveCount(0)

  // Every glyph is its own path, drawn at the tag tier (20 px).
  const paths = await items.locator('svg path').evaluateAll((els) =>
    els.map((el) => el.getAttribute('d')),
  )
  expect(new Set(paths).size).toBe(inventory.length)
  const box = await items.first().locator('svg').boundingBox()
  expect(box?.width).toBeCloseTo(20, 0)
  expect(box?.height).toBeCloseTo(20, 0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
