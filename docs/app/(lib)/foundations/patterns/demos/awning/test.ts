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

test('awning draws its stripes on a paper band and on the clay field', async ({ page }) => {
  const { preview, pageErrors } = await openDemo(page)
  const grounds = preview.locator('[data-ground]:not(button)')
  await expect(grounds).toHaveCount(2)

  // The paper band follows the page mode; the clay field is always light.
  const paper = grounds.nth(0)
  const clay = grounds.nth(1)
  await expect(paper).toHaveAttribute('data-ground', 'paper')
  await expect(paper).toHaveAttribute('data-scheme', 'page')
  await expect(paper).not.toHaveAttribute('data-theme')
  await expect(clay).toHaveAttribute('data-ground', 'clay')
  await expect(clay).toHaveAttribute('data-tone', 'solid-light')
  await expect(clay).toHaveAttribute('data-theme', 'light')

  for (const ground of [paper, clay]) {
    await expect(ground).toHaveClass(/patternAwning/)
    // Display type and one action.
    await expect(ground.getByText('Summer Market', { exact: true })).toBeVisible()
    const action = ground.getByRole('button', { name: 'Get Tickets' })
    await expect(action).toHaveCount(1)
    await expect(action).toBeEnabled()
    // The stripes: a masked mark layer behind the content, repeating across the band.
    expect(await maskImage(ground)).toContain('url(')
    expect(await pseudo(ground, '::before', 'z-index')).toBe('-1')
    expect(await pseudo(ground, '::before', 'pointer-events')).toBe('none')
  }

  // The action is reachable from the keyboard over the stripes.
  const first = paper.getByRole('button', { name: 'Get Tickets' })
  await first.focus()
  await expect(first).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(clay.getByRole('button', { name: 'Get Tickets' })).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('awning drops out in print', async ({ page }) => {
  const { preview, pageErrors } = await openDemo(page)
  const grounds = preview.locator('[data-ground]:not(button)')
  await expect(grounds).toHaveCount(2)
  await page.emulateMedia({ media: 'print' })
  for (const ground of await grounds.all()) {
    await expect.poll(() => pseudo(ground, '::before', 'display')).toBe('none')
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
