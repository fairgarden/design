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

test('weights steps each tier up one stroke at the same size', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  for (const head of ['Tier', 'Rest', 'Emphasis']) {
    await expect(demo.getByText(head, { exact: true })).toBeVisible()
  }

  const tiers = [
    { label: 'inline 16 px', px: 16 },
    { label: 'tag 20 px', px: 20 },
    { label: 'block 36 px', px: 36 },
  ]

  // Every sample sits beside its tier and weight in text, so the icons are decorative.
  const icons = demo.locator('svg')
  await expect(icons).toHaveCount(tiers.length * 4)
  await expect(demo.getByRole('img')).toHaveCount(0)
  await expect(demo.locator('svg:not([aria-hidden="true"])')).toHaveCount(0)

  for (const [index, { label, px }] of tiers.entries()) {
    await expect(demo.getByText(label, { exact: true })).toBeVisible()

    // Rows are display: contents; the samples for tier `index` are icons 4i..4i+3:
    // search and close at rest, then search and close at emphasis.
    const sample = (offset: number) => icons.nth(index * 4 + offset)
    const sizes = []
    for (let offset = 0; offset < 4; offset++) {
      await expect(sample(offset).locator('path')).toHaveCount(1)
      const box = await sample(offset).boundingBox()
      sizes.push([box?.width, box?.height])
    }
    // The glyph never grows: rest and emphasis share the tier's size.
    for (const [width, height] of sizes) {
      expect(width).toBeCloseTo(px, 0)
      expect(height).toBeCloseTo(px, 0)
    }

    // Same glyph, different weight: the emphasis path differs from the rest path.
    const d = async (offset: number) => sample(offset).locator('path').getAttribute('d')
    expect(await d(2)).not.toEqual(await d(0))
    expect(await d(3)).not.toEqual(await d(1))
  }

  // The weight captions read rest then emphasis, tier by tier.
  await expect(demo.locator('code').filter({ hasText: /^\d{3}$/ })).toHaveText([
    '600',
    '700',
    '500',
    '700',
    '400',
    '600',
  ])

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
