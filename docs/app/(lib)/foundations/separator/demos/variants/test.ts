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
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before asserting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  // The Demo's preview surface, without its code (a CSS Module class, stable across builds).
  const preview = demo.locator('[class*="__preview"]').first()
  return { demo, preview }
}

const variants = ['rule', 'hairline', 'dotted', 'doubleHair', 'ruleDot'] as const

test('variants labels each horizontal variant with its own separator', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { preview } = await openDemo(page)
  const separators = preview.getByRole('separator')
  // Five horizontal variants and two vertical hairlines.
  await expect(separators).toHaveCount(7)

  for (const [index, variant] of variants.entries()) {
    await expect(preview.locator('code').nth(index)).toHaveText(variant)
    const separator = separators.nth(index)
    await expect(separator).not.toHaveAttribute('aria-orientation', 'vertical')
    await expect(separator).toHaveClass(new RegExp(`__${variant}(\\s|$)`))
  }

  // dotted draws a run of dots; ruleDot draws hairline, dot, hairline; the others draw no parts.
  await expect(separators.nth(2).locator('svg line')).toHaveCount(1)
  await expect(separators.nth(4).locator('svg circle')).toHaveCount(1)
  await expect(separators.nth(4).locator('svg')).toHaveAttribute('aria-hidden', 'true')
  for (const index of [0, 1, 3]) {
    await expect(separators.nth(index).locator('svg')).toHaveCount(0)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('variants divides an inline row with vertical hairlines', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { preview } = await openDemo(page)
  const vertical = preview.locator('[role="separator"][aria-orientation="vertical"]')
  await expect(vertical).toHaveCount(2)
  for (const index of [0, 1]) {
    await expect(vertical.nth(index)).toHaveClass(/__hairline(\s|$)/)
  }

  // Each vertical separator sits between two labels, and stretches to a visible height.
  const row = vertical.first().locator('..')
  await expect(row).toHaveText(/Trails\s*Maps\s*Events/)
  for (const label of ['Trails', 'Maps', 'Events']) {
    await expect(row.getByText(label, { exact: true })).toBeVisible()
  }
  const box = await vertical.first().boundingBox()
  expect(box, 'the vertical separator should be laid out').not.toBeNull()
  expect(box!.height).toBeGreaterThan(box!.width)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
