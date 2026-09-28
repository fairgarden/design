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

test('speckle draws its mark layer on a paper band and on the leaf field', async ({ page }) => {
  const { preview, pageErrors } = await openDemo(page)
  const grounds = preview.locator('[data-ground]')
  await expect(grounds).toHaveCount(2)

  // The paper band follows the page mode; the leaf field is always light.
  const paper = grounds.nth(0)
  const leaf = grounds.nth(1)
  await expect(paper).toHaveAttribute('data-ground', 'paper')
  await expect(paper).toHaveAttribute('data-scheme', 'page')
  await expect(paper).not.toHaveAttribute('data-theme')
  await expect(leaf).toHaveAttribute('data-ground', 'leaf')
  await expect(leaf).toHaveAttribute('data-tone', 'solid-light')
  await expect(leaf).toHaveAttribute('data-scheme', 'light')
  await expect(leaf).toHaveAttribute('data-theme', 'light')

  for (const ground of [paper, leaf]) {
    await expect(ground).toHaveClass(/patternSpeckle/)
    // Display type and one action sit on the speckle.
    await expect(ground.getByText('Land for good', { exact: true })).toBeVisible()
    const action = ground.getByRole('button', { name: 'Our Mission' })
    await expect(action).toHaveCount(1)
    await expect(action).toBeEnabled()
    // The speckle is a masked mark layer behind the content.
    expect(await maskImage(ground)).toContain('url(')
    expect(await pseudo(ground, '::before', 'z-index')).toBe('-1')
    expect(await pseudo(ground, '::before', 'pointer-events')).toBe('none')
  }

  // The mark layer never takes the pointer: the action stays clickable.
  await leaf.getByRole('button', { name: 'Our Mission' }).click()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('speckle drops out in print', async ({ page }) => {
  const { preview, pageErrors } = await openDemo(page)
  const grounds = preview.locator('[data-ground]')
  await expect(grounds).toHaveCount(2)
  await page.emulateMedia({ media: 'print' })
  for (const ground of await grounds.all()) {
    await expect.poll(() => pseudo(ground, '::before', 'display')).toBe('none')
    await expect(ground.getByText('Land for good', { exact: true })).toBeVisible()
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
