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

// Each preset in order, with its tone and the mode it fixes.
const faces = [
  { preset: 'forest', tone: 'dark-tinted', theme: 'dark', body: 'A forest field.' },
  { preset: 'night', tone: 'dark-base', theme: 'dark', body: 'The night band.' },
  { preset: 'leaf', tone: 'solid-light', theme: 'light', body: 'A leaf field.' },
  { preset: 'amber', tone: 'solid-light', theme: 'light', body: 'A amber field.' },
  { preset: 'clay', tone: 'solid-light', theme: 'light', body: 'A clay field.' },
  { preset: 'pink', tone: 'solid-light', theme: 'light', body: 'A pink field.' },
  { preset: 'royal', tone: 'solid-dark', theme: 'dark', body: 'A royal field.' },
  { preset: 'brick', tone: 'solid-dark', theme: 'dark', body: 'A brick field.' },
] as const

test('grain stipples the seven fields and the night band', async ({ page }) => {
  const { preview, pageErrors } = await openDemo(page)
  const grounds = preview.locator('[data-ground]')
  await expect(grounds).toHaveCount(faces.length)
  await expect(preview.getByText('Join the Count', { exact: true })).toHaveCount(faces.length)

  for (const [index, face] of faces.entries()) {
    const ground = grounds.nth(index)
    await expect(ground).toHaveAttribute('data-ground', face.preset)
    await expect(ground).toHaveAttribute('data-tone', face.tone)
    await expect(ground).toHaveAttribute('data-scheme', face.theme)
    await expect(ground).toHaveAttribute('data-theme', face.theme)
    await expect(ground).toHaveClass(/patternGrain/)
    await expect(ground.getByText('Join the Count', { exact: true })).toBeVisible()
    await expect(ground.getByText(face.body, { exact: true })).toBeVisible()

    // Grain takes two mark layers, the light flecks and the dark flecks, both behind the text.
    for (const layer of ['::before', '::after'] as const) {
      expect(await maskImage(ground, layer)).toContain('url(')
      expect(await pseudo(ground, layer, 'z-index')).toBe('-1')
    }
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('grain drops out in print', async ({ page }) => {
  const { preview, pageErrors } = await openDemo(page)
  const grounds = preview.locator('[data-ground]')
  await expect(grounds).toHaveCount(faces.length)
  await page.emulateMedia({ media: 'print' })
  for (const ground of await grounds.all()) {
    await expect.poll(() => pseudo(ground, '::before', 'display')).toBe('none')
    await expect.poll(() => pseudo(ground, '::after', 'display')).toBe('none')
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
