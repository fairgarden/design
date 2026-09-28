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
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return demo
}

type PseudoElement = '::before' | '::after'

/** The computed value of a CSS property on one of the element's pseudo-elements. */
function pseudo(locator: Locator, pseudoElement: PseudoElement, property: string) {
  return locator.evaluate(
    (element, [which, name]) => getComputedStyle(element, which).getPropertyValue(name),
    [pseudoElement, property] as const,
  )
}

/** The mask image of a mark layer: the element's `::before` unless another is given. */
function maskImage(locator: Locator, pseudoElement: PseudoElement = '::before') {
  return locator.evaluate((element, which) => {
    const style = getComputedStyle(element, which)
    return style.maskImage || style.getPropertyValue('-webkit-mask-image')
  }, pseudoElement)
}

// The legend in order: each fill's class name, its note and whether it takes the secondary ink.
const fills = [
  { name: 'patternHatch', note: '45°; series 2', secondary: false },
  { name: 'patternHatch0', note: '0°; series 4', secondary: false },
  { name: 'patternHatchCrossed', note: 'Crossed, secondary ink; series 5', secondary: true },
  { name: 'patternHatch135', note: '135°; projected or partial', secondary: false },
  { name: 'patternDotscreen', note: '1.25 px at 6 px', secondary: false },
  {
    name: 'patternDotscreenPitch2',
    note: '1.25 px at 5 px, secondary ink; series 3',
    secondary: true,
  },
  { name: 'patternDotscreenPitch3', note: '1.25 px at 4 px', secondary: false },
  { name: 'patternDotscreenHeavy', note: '2 px at 4 px', secondary: false },
] as const

test('semantic lists each fill as an outlined legend swatch with its name and note', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const preview = await openDemo(page)
  const legend = preview.getByRole('list')
  await expect(legend).toHaveCount(1)
  const items = legend.getByRole('listitem')
  await expect(items).toHaveCount(fills.length)
  await expect(legend.locator('code')).toHaveText(fills.map(({ name }) => name))

  const inks: string[] = []
  for (const [index, fill] of fills.entries()) {
    const item = items.nth(index)
    await expect(item.locator('code')).toHaveText(fill.name)
    await expect(item.getByText(fill.note, { exact: true })).toBeVisible()

    // The swatch is decorative: hidden from assistive technology, its meaning in the words.
    const swatch = item.locator('[aria-hidden="true"]')
    await expect(swatch).toHaveCount(1)
    await expect(swatch).toHaveClass(new RegExp(`${fill.name}(?![A-Za-z0-9])`))
    if (fill.secondary) await expect(swatch).toHaveClass(/patternInkSecondary/)
    else await expect(swatch).not.toHaveClass(/patternInkSecondary/)

    // Every fill keeps a 1 px outline, and its marks are a masked layer that prints exactly.
    expect(await swatch.evaluate((element) => getComputedStyle(element).borderTopStyle)).toBe('solid')
    expect(await swatch.evaluate((element) => getComputedStyle(element).borderTopWidth)).toBe('1px')
    expect(await maskImage(swatch)).toContain('url(')
    expect(await pseudo(swatch, '::before', 'print-color-adjust')).toBe('exact')
    inks.push(await pseudo(swatch, '::before', 'background-color'))
  }

  // The secondary-ink fills draw in a different ink from the primary ones.
  const primaryInk = inks[0]
  fills.forEach((fill, index) => {
    if (fill.secondary) expect(inks[index]).not.toBe(primaryInk)
    else expect(inks[index]).toBe(primaryInk)
  })

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('semantic fills stay in print', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const preview = await openDemo(page)
  const swatches = preview.getByRole('listitem').locator('[aria-hidden="true"]')
  await expect(swatches).toHaveCount(fills.length)
  await page.emulateMedia({ media: 'print' })
  // Unlike the decorative patterns, the semantic marks carry meaning and keep drawing.
  for (const swatch of await swatches.all()) {
    await expect.poll(() => pseudo(swatch, '::before', 'display')).not.toBe('none')
    expect(await maskImage(swatch)).toContain('url(')
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
