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

test('grounds shows the same tags on the paper face and the forest field', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  // Two grounds, each named by its preset.
  await expect(demo.locator('section[data-ground]')).toHaveCount(2)
  const paper = demo.locator('section[data-ground="paper"]')
  const forest = demo.locator('section[data-ground="forest"]')

  // The paper face follows the page mode; the forest field is always dark.
  await expect(paper).toHaveAttribute('data-scheme', 'page')
  await expect(paper).not.toHaveAttribute('data-theme')
  await expect(forest).toHaveAttribute('data-scheme', 'dark')
  await expect(forest).toHaveAttribute('data-theme', 'dark')

  for (const [ground, preset, scheme] of [
    [paper, 'paper', 'page'],
    [forest, 'forest', 'dark'],
  ] as const) {
    await expect(ground.getByText(preset, { exact: true })).toBeVisible()

    // A plain tag with its icon, carrying its ground's scope.
    const plain = tagByLabel(ground, 'Land protection')
    await expect(plain).toBeVisible()
    await expect(plain).toHaveJSProperty('tagName', 'SPAN')
    await expect(iconOf(plain)).toHaveCount(1)
    await expect(plain).toHaveAttribute('data-ground', preset)
    await expect(plain).toHaveAttribute('data-scheme', scheme)

    // A linked tag, named by its label.
    const link = ground.getByRole('link', { name: 'Clean water', exact: true })
    await expect(link).toHaveCount(1)
    await expect(link).toHaveAttribute('href', '#water')
    await expect(iconOf(link)).toHaveCount(1)
    await expect(link).toHaveAttribute('data-ground', preset)
    await expect(link).toHaveAttribute('data-scheme', scheme)
  }

  // The icon takes each ground's accent, so it differs between paper and forest.
  const iconColor = (ground: Locator) =>
    iconOf(tagByLabel(ground, 'Land protection'))
      .locator('xpath=..')
      .evaluate((element) => getComputedStyle(element).color)
  expect(await iconColor(paper)).not.toBe(await iconColor(forest))

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('grounds linked tags are reachable by keyboard and pointer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const links = demo.getByRole('link', { name: 'Clean water', exact: true })
  await expect(links).toHaveCount(2)

  await links.nth(0).focus()
  await expect(links.nth(0)).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(links.nth(1)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#water$/)

  const reloaded = await openDemo(page)
  await reloaded.getByRole('link', { name: 'Clean water', exact: true }).first().click()
  await expect(page).toHaveURL(/#water$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
