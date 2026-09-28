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

test('sunburst draws its rays behind the one call to action on a white band', async ({ page }) => {
  const { preview, pageErrors } = await openDemo(page)
  const grounds = preview.locator('[data-ground]:not(button)')
  await expect(grounds).toHaveCount(1)

  const band = grounds.first()
  await expect(band).toHaveAttribute('data-ground', 'white')
  await expect(band).toHaveAttribute('data-scheme', 'page')
  await expect(band).not.toHaveAttribute('data-theme')
  await expect(band).toHaveClass(/patternSunburst/)

  await expect(band.getByText('Find a garden near you', { exact: true })).toBeVisible()
  // One call to action on the band.
  await expect(band.getByRole('button')).toHaveCount(1)
  const action = band.getByRole('button', { name: 'Find a Garden' })
  await expect(action).toBeEnabled()

  // The rays: a masked mark layer behind the content that never takes the pointer.
  expect(await maskImage(band)).toContain('url(')
  expect(await pseudo(band, '::before', 'z-index')).toBe('-1')
  expect(await pseudo(band, '::before', 'pointer-events')).toBe('none')

  // The action takes focus from the keyboard and the pointer over the rays.
  await action.focus()
  await expect(action).toBeFocused()
  await action.click()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('sunburst drops out in print', async ({ page }) => {
  const { preview, pageErrors } = await openDemo(page)
  const band = preview.locator('[data-ground]:not(button)').first()
  await expect(band).toHaveClass(/patternSunburst/)
  await page.emulateMedia({ media: 'print' })
  await expect.poll(() => pseudo(band, '::before', 'display')).toBe('none')
  // The display type prints; action buttons drop out of print by design (§9.2).
  await expect(band.getByText('Find a garden near you', { exact: true })).toBeVisible()
  await expect(band.locator('button')).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
