import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

const phrases = ['Grown Here', 'Picked This Morning', 'Never Frozen']

test('grounds sets a forest field, the page ground and the ticker', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const outer = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before asserting.
  await expect(
    outer.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  // Scope to the preview surface: the code panel carries its own text and grounds.
  const demo = outer.locator('[class*="__preview"]').first()

  // Three labelled marquee sections, named by their `label`.
  const fielded = demo.getByRole('region', { name: 'What we stand for', exact: true })
  const onPage = demo.getByRole('region', { name: 'What we stand for, on the page ground' })
  const ticker = demo.getByRole('region', { name: 'What visitors say' })
  await expect(fielded).toBeVisible()
  await expect(onPage).toBeVisible()
  await expect(ticker).toBeVisible()

  // The default static marquee: its phrases sit in a forest field, an always-dark scope.
  const field = fielded.locator('[data-ground="forest"]')
  await expect(field).toHaveCount(1)
  await expect(field).toHaveAttribute('data-theme', 'dark')
  for (const phrase of phrases) {
    await expect(field.getByText(phrase, { exact: true })).toBeVisible()
  }
  // Each phrase shows whole, once, separated by two decorative dots.
  await expect(field.locator('p svg[aria-hidden="true"]')).toHaveCount(phrases.length - 1)

  // The hanging drawing is decorative, outside the field, and hidden from assistive technology.
  const drawing = fielded.locator('[aria-hidden="true"] > svg[viewBox="0 0 120 160"]')
  await expect(drawing).toHaveCount(1)
  await expect(field.locator('svg[viewBox="0 0 120 160"]')).toHaveCount(0)
  await expect(demo.getByText('Page content continues below the hanging drawing.')).toBeVisible()

  // `fielded={false}`: the same phrases on the page ground, with no field and no drawing.
  await expect(onPage.locator('[data-ground="forest"]')).toHaveCount(0)
  await expect(onPage.locator('svg[viewBox="0 0 120 160"]')).toHaveCount(0)
  for (const phrase of phrases) {
    await expect(onPage.getByText(phrase, { exact: true })).toBeVisible()
  }
  await expect(onPage.locator('p svg[aria-hidden="true"]')).toHaveCount(phrases.length - 1)

  // The ticker: two quotes on the page ground, one dot between them, never a field.
  await expect(ticker.locator('[data-ground]')).toHaveCount(0)
  await expect(ticker.getByText('“The best tomatoes in the valley.”')).toBeVisible()
  await expect(ticker.getByText('“Worth the drive.”')).toBeVisible()
  await expect(ticker.locator('p svg[aria-hidden="true"]')).toHaveCount(1)

  // Static only: nothing in the marquees is focusable or moves.
  await expect(demo.getByRole('region').locator('a, button, [tabindex]')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
