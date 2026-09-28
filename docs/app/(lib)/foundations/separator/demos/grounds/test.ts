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

const grounds = [
  { preset: 'paper', tone: 'light-base', scheme: 'page', theme: null },
  { preset: 'forest', tone: 'dark-tinted', scheme: 'dark', theme: 'dark' },
  { preset: 'leaf', tone: 'solid-light', scheme: 'light', theme: 'light' },
] as const

test('grounds draws three separators in each ground scope', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { preview } = await openDemo(page)
  const faces = preview.locator('[data-ground]:not([role="separator"])')
  await expect(faces).toHaveCount(3)

  for (const [index, { preset, tone, scheme, theme }] of grounds.entries()) {
    const face = faces.nth(index)
    await expect(face).toHaveAttribute('data-ground', preset)
    await expect(face).toHaveAttribute('data-tone', tone)
    await expect(face).toHaveAttribute('data-scheme', scheme)
    if (theme) await expect(face).toHaveAttribute('data-theme', theme)
    else await expect(face).not.toHaveAttribute('data-theme', /./)
    await expect(face.getByText(preset, { exact: true })).toBeVisible()

    // rule, hairline and ruleDot, each carrying its ground's scope so the roles re-resolve.
    const separators = face.getByRole('separator')
    await expect(separators).toHaveCount(3)
    await expect(separators.nth(0)).toHaveClass(/__rule(\s|$)/)
    await expect(separators.nth(1)).toHaveClass(/__hairline(\s|$)/)
    await expect(separators.nth(2)).toHaveClass(/__ruleDot(\s|$)/)
    await expect(separators.nth(2).locator('svg circle')).toHaveCount(1)
    for (const i of [0, 1, 2]) {
      await expect(separators.nth(i)).toHaveAttribute('data-ground', preset)
      await expect(separators.nth(i)).toHaveAttribute('data-tone', tone)
      await expect(separators.nth(i)).toHaveAttribute('data-scheme', scheme)
    }
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
