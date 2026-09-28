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

test('sizes draws the three tiers at 16, 20 and 36 px', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  const tiers = [
    { name: 'Search, inline (16 px)', px: 16 },
    { name: 'Search, tag (20 px)', px: 20 },
    { name: 'Search, block (36 px)', px: 36 },
  ]
  await expect(demo.getByRole('img', { name: /^Search, / })).toHaveCount(tiers.length)

  const glyphs: (string | null)[] = []
  for (const { name, px } of tiers) {
    const icon = demo.getByRole('img', { name, exact: true })
    await expect(icon).toBeVisible()
    await expect(icon).toHaveAttribute('aria-label', name)
    await expect(icon).toHaveAttribute('fill', 'currentColor')
    // Square at its tier, never scaled in between.
    const box = await icon.boundingBox()
    expect(box?.width).toBeCloseTo(px, 0)
    expect(box?.height).toBeCloseTo(px, 0)
    await expect(icon.locator('path')).toHaveCount(1)
    glyphs.push(await icon.locator('path').getAttribute('d'))
  }

  // Each tier draws its own calibrated weight, so each path differs.
  expect(new Set(glyphs).size).toBe(tiers.length)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
