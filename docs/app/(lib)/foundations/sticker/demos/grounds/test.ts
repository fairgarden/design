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

test('grounds keeps the sticker its own white scope on every ground', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  // Each sticker is a decorative span holding its SVG art.
  const stickers = demo.locator('span[aria-hidden="true"]:has(> svg)')
  await expect(stickers).toHaveCount(4)

  // One host ground per preset, each holding one sticker and its name.
  const grounds = demo.locator('[data-ground]:not([data-ground="white"])').filter({ has: stickers })
  await expect(grounds).toHaveCount(4)

  // The sticker's own scope is a light island inside a fixed field; on a page ground it
  // follows the page mode, so it writes no theme of its own.
  const expected = [
    { preset: 'paper', theme: null, scope: null },
    { preset: 'rose', theme: null, scope: null },
    { preset: 'forest', theme: 'dark', scope: 'light' },
    { preset: 'leaf', theme: 'light', scope: 'light' },
  ] as const

  for (const [index, { preset, theme, scope }] of expected.entries()) {
    const ground = grounds.nth(index)
    await expect(ground).toHaveAttribute('data-ground', preset)
    if (theme) await expect(ground).toHaveAttribute('data-theme', theme)
    else await expect(ground).not.toHaveAttribute('data-theme')
    await expect(ground.getByText(preset, { exact: true })).toBeVisible()

    const sticker = ground.locator('span[aria-hidden="true"]:has(> svg)')
    await expect(sticker).toHaveCount(1)
    await expect(sticker).toBeVisible()

    // Decorative art at the S size (152 px), never focusable.
    const art = sticker.locator('svg')
    await expect(art).toHaveAttribute('aria-hidden', 'true')
    await expect(art).toHaveAttribute('focusable', 'false')
    await expect(art).toHaveAttribute('viewBox', '0 0 152 152')
    const box = await sticker.boundingBox()
    expect(box?.width).toBeCloseTo(152, 0)

    // Its scope: a nested white face group holding the halo and the line art.
    const own = art.locator('g[data-ground="white"]')
    await expect(own).toHaveCount(1)
    if (scope) await expect(own).toHaveAttribute('data-theme', scope)
    else await expect(own).not.toHaveAttribute('data-theme')
    await expect(own.locator(':scope > g')).toHaveCount(2)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
