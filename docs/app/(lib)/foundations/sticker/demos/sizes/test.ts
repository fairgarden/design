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

test('sizes draws S and L with a halo and S bare', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  const figures = demo.getByRole('figure')
  await expect(figures).toHaveCount(3)

  const expected = [
    { caption: 'S, with halo', width: 152, halo: true },
    { caption: 'L, with halo', width: 312, halo: true },
    { caption: 'S, bare', width: 152, halo: false },
  ] as const

  for (const { caption, width, halo } of expected) {
    // Each figure is named by its caption; the sticker itself is decorative.
    const figure = demo.getByRole('figure', { name: caption })
    await expect(figure).toBeVisible()
    await expect(figure.getByText(caption, { exact: true })).toBeVisible()

    const sticker = figure.locator('span[aria-hidden="true"]:has(> svg)')
    await expect(sticker).toHaveCount(1)
    const art = sticker.locator('svg')
    await expect(art).toHaveAttribute('aria-hidden', 'true')
    await expect(art).toHaveAttribute('focusable', 'false')
    // The asset is drawn at S; the L sticker swaps the box, never the asset.
    await expect(art).toHaveAttribute('viewBox', '0 0 152 152')

    // Fixed native sizes: 152 px at S, 312 px at L.
    const box = await sticker.boundingBox()
    expect(box?.width).toBeCloseTo(width, 0)

    const own = art.locator('g[data-ground="white"]')
    if (halo) {
      // Its own white scope, holding the halo and the line art.
      await expect(own).toHaveCount(1)
      await expect(own.locator(':scope > g')).toHaveCount(2)
    } else {
      // Bare: no scope of its own and no halo, just the line art in the host's ink.
      await expect(own).toHaveCount(0)
      await expect(art.locator(':scope > g')).toHaveCount(1)
      await expect(art.locator(':scope > g > g')).toHaveCount(1)
    }
  }

  // L is larger than S.
  const [s, l] = await Promise.all(
    ['S, with halo', 'L, with halo'].map((name) =>
      demo.getByRole('figure', { name }).locator('span[aria-hidden="true"]').boundingBox(),
    ),
  )
  expect(l!.width).toBeGreaterThan(s!.width)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
