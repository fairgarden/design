import path from 'node:path'
import { test, expect, type Locator, type Page } from '@playwright/test'

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
  // The Demo's preview surface (a CSS Module class, whose local name is stable across builds),
  // so the code panel's source text never matches the rendered tags.
  return demo.locator('[class*="__preview"]').first()
}

/** A tag's root element (a `span`, or an `a` when linked), found by its label text. */
function tagByLabel(scope: Locator, label: string) {
  return scope.getByText(label, { exact: true }).locator('xpath=..')
}

/** A tag's subject icon: a decorative SVG in an aria-hidden wrapper. */
function iconOf(tag: Locator) {
  return tag.locator(':scope > span[aria-hidden="true"] > svg')
}

test('color shows the scope accent and the primary and secondary scales', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const labels = ['Scope accent', 'Indigo taxonomy', 'Orange taxonomy', 'Primary plum']
  const tags = labels.map((label) => tagByLabel(demo, label))

  // Four plain tags, each with its icon; none are links.
  await expect(demo.getByRole('link')).toHaveCount(0)
  for (const tag of tags) {
    await expect(tag).toBeVisible()
    await expect(tag).toHaveJSProperty('tagName', 'SPAN')
    await expect(iconOf(tag)).toHaveCount(1)
    // Outside a Ground the tag inherits the default paper scope.
    await expect(tag).toHaveAttribute('data-ground', 'paper')
    await expect(tag).toHaveAttribute('data-scheme', 'page')
  }

  // The scale props land as scale classes (CSS Module local names, stable across builds);
  // the scope-accent tag carries none, so it inherits.
  const [scope, indigo, orange, plum] = tags
  await expect(scope).not.toHaveClass(/secondary[A-Z]|primary[A-Z]/)
  await expect(indigo).toHaveClass(/secondaryIndigo/)
  await expect(indigo).not.toHaveClass(/primary[A-Z]/)
  await expect(orange).toHaveClass(/secondaryOrange/)
  await expect(orange).not.toHaveClass(/primary[A-Z]/)
  await expect(plum).toHaveClass(/primaryPlum/)
  await expect(plum).not.toHaveClass(/secondary[A-Z]/)

  // `secondary` colors the icon only: the indigo and orange icons differ from the scope accent,
  // while their labels keep the same ink as the scope-accent label.
  const color = (locator: Locator) =>
    locator.evaluate((element) => getComputedStyle(element).color)
  const labelOf = (tag: Locator) => tag.locator(':scope > span:not([aria-hidden])')
  const scopeIcon = await color(iconOf(scope).locator('xpath=..'))
  expect(await color(iconOf(indigo).locator('xpath=..'))).not.toBe(scopeIcon)
  expect(await color(iconOf(orange).locator('xpath=..'))).not.toBe(scopeIcon)
  const scopeLabel = await color(labelOf(scope))
  expect(await color(labelOf(indigo))).toBe(scopeLabel)
  expect(await color(labelOf(orange))).toBe(scopeLabel)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
