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

/** The paper band above the seam and the night band the fringe hangs from. */
async function bands(page: Page) {
  const { preview, pageErrors } = await openDemo(page)
  const grounds = preview.locator('[data-ground]')
  await expect(grounds).toHaveCount(2)
  return { paper: grounds.nth(0), night: grounds.nth(1), pageErrors }
}

test('fringe hangs from the night band below a paper band', async ({ page }) => {
  const { paper, night, pageErrors } = await bands(page)
  await expect(paper).toHaveAttribute('data-ground', 'paper')
  await expect(paper).toHaveAttribute('data-scheme', 'page')
  await expect(paper).not.toHaveAttribute('data-theme')
  await expect(paper).not.toHaveClass(/ornamentFringe/)
  await expect(paper.getByText('The page band above the seam.', { exact: true })).toBeVisible()

  // The night band is always dark and carries the fringe; the paper band does not.
  await expect(night).toHaveAttribute('data-ground', 'night')
  await expect(night).toHaveAttribute('data-tone', 'dark-base')
  await expect(night).toHaveAttribute('data-theme', 'dark')
  await expect(night).toHaveClass(/ornamentFringe/)
  await expect(night.getByText('Field Notes', { exact: true })).toBeVisible()

  // The fringe is a masked row of ticks on the band's top edge, behind its content.
  expect(await maskImage(night, '::after')).toContain('url(')
  expect(await pseudo(night, '::after', 'top')).toBe('0px')
  expect(await pseudo(night, '::after', 'z-index')).toBe('-1')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test.describe('in light mode', () => {
  test.use({ colorScheme: 'light' })

  test('fringe shows its shaped edge where tone separates the seam', async ({ page }) => {
    const { night, pageErrors } = await bands(page)
    await expect.poll(() => pseudo(night, '::after', 'display')).toBe('block')

    // In print the band draws its straight seam rule instead.
    await page.emulateMedia({ media: 'print' })
    await expect.poll(() => pseudo(night, '::after', 'display')).toBe('none')

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})

test.describe('in dark mode', () => {
  test.use({ colorScheme: 'dark' })

  test('fringe gives way to the straight seam rule', async ({ page }) => {
    const { night, pageErrors } = await bands(page)
    await expect(night).toHaveClass(/ornamentFringe/)
    await expect.poll(() => pseudo(night, '::after', 'display')).toBe('none')
    await expect(night.getByText('Field Notes', { exact: true })).toBeVisible()

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})
