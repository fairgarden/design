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
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  // The Demo's preview surface, the container the rendered demo sits in, without its code
  // (a CSS Module class, whose local name is stable across builds).
  const preview = demo.locator('[class*="__preview"]').first()
  return { preview, pageErrors }
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

// The three dot fields in order, with the mode each fixes and the plate scheme inside it.
const fields = [
  { preset: 'paper', theme: null, scheme: 'page', plateTheme: null, plateScheme: 'page' },
  { preset: 'forest', theme: 'dark', scheme: 'dark', plateTheme: 'light', plateScheme: 'light' },
  { preset: 'amber', theme: 'light', scheme: 'light', plateTheme: 'light', plateScheme: 'light' },
] as const

test('dotgrid puts display type and one action on the dots, other text on a plate', async ({ page }) => {
  const { preview, pageErrors } = await openDemo(page)
  const hosts = preview.locator('[class*="patternDotgrid"]')
  await expect(hosts).toHaveCount(fields.length + 1)
  await expect(preview.getByRole('button', { name: 'Explore' })).toHaveCount(fields.length)

  for (const [index, field] of fields.entries()) {
    const ground = hosts.nth(index)
    await expect(ground).toHaveAttribute('data-ground', field.preset)
    await expect(ground).toHaveAttribute('data-scheme', field.scheme)
    if (field.theme) await expect(ground).toHaveAttribute('data-theme', field.theme)
    else await expect(ground).not.toHaveAttribute('data-theme')
    await expect(ground.getByText('Field Notes', { exact: true })).toBeVisible()
    await expect(ground.getByRole('button', { name: 'Explore' })).toBeEnabled()
    expect(await maskImage(ground)).toContain('url(')

    // The name sits on a paper face: a light island inside a fixed field.
    const plate = ground.locator('[data-ground]')
    await expect(plate).toHaveCount(1)
    await expect(plate).toHaveAttribute('data-ground', 'paper')
    await expect(plate).toHaveText(field.preset)
    await expect(plate).toHaveAttribute('data-scheme', field.plateScheme)
    if (field.plateTheme) await expect(plate).toHaveAttribute('data-theme', field.plateTheme)
    else await expect(plate).not.toHaveAttribute('data-theme')
    await expect(plate).not.toHaveClass(/patternDotgrid/)
  }

  // The figure plate: a white face on the hairline grid, captioned.
  const figure = hosts.nth(fields.length)
  await expect(figure).toHaveJSProperty('tagName', 'FIGURE')
  await expect(figure).toHaveAttribute('data-ground', 'white')
  await expect(figure).toHaveClass(/patternPlate/)
  await expect(preview.getByRole('figure')).toHaveCount(1)
  await expect(figure.locator('figcaption')).toHaveText(
    'Figure 1. A specimen plate on the hairline grid.',
  )
  expect(await maskImage(figure)).toContain('url(')
  // On the plate the dots take the hairline role rather than the tint of the dot fields.
  const plateDots = await pseudo(figure, '::before', 'background-color')
  const paperDots = await pseudo(hosts.nth(0), '::before', 'background-color')
  expect(plateDots).not.toBe('')
  expect(plateDots).not.toBe(paperDots)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('dotgrid drops out in print', async ({ page }) => {
  const { preview, pageErrors } = await openDemo(page)
  const hosts = preview.locator('[class*="patternDotgrid"]')
  await expect(hosts).toHaveCount(fields.length + 1)
  await page.emulateMedia({ media: 'print' })
  for (const host of await hosts.all()) {
    await expect.poll(() => pseudo(host, '::before', 'display')).toBe('none')
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
