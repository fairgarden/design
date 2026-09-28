import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('seams joins four bands with seam rules and breaks three with pauses', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // paper → paper → tide → white, each band a page ground that follows the mode.
  const bands = demo.locator('section[data-ground]')
  await expect(bands).toHaveCount(4)
  const grounds = await bands.evaluateAll((els) => els.map((el) => el.getAttribute('data-ground')))
  expect(grounds).toEqual(['paper', 'paper', 'tide', 'white'])
  for (const band of await bands.all()) await expect(band).not.toHaveAttribute('data-theme')

  const heads = [
    'Paper: the dotted pause',
    'Paper again: the seam rule',
    'Tide: the page-seam hairline',
    'White: the terminal band',
  ]
  for (const [index, head] of heads.entries()) {
    await expect(bands.nth(index).getByText(head, { exact: true })).toBeVisible()
  }

  // Every divider is decorative: none reaches the accessibility tree.
  await expect(bands.getByRole('separator')).toHaveCount(0)
  const rules = bands.getByRole('separator', { includeHidden: true })
  await expect(rules).toHaveCount(3)
  for (const rule of await rules.all()) {
    await expect(rule).toHaveAttribute('aria-orientation', 'horizontal')
  }

  // The first band opens with no seam (the page's top); each later band's first child is its seam,
  // taking that band's scope.
  await expect(bands.nth(0).locator(':scope > :first-child')).not.toHaveAttribute('aria-hidden')
  for (const [index, ground] of [
    [1, 'paper'],
    [2, 'tide'],
    [3, 'white'],
  ] as const) {
    const seam = bands.nth(index).locator(':scope > :first-child')
    await expect(seam).toHaveAttribute('aria-hidden', 'true')
    await expect(seam).toHaveAttribute('data-ground', ground)
    await expect(seam.getByRole('separator', { includeHidden: true })).toHaveCount(1)
  }

  // One pause per text band, between two runs of text: dotted, rule–dot–rule, dot-and-star.
  const pauseIn = (index: number) =>
    bands
      .nth(index)
      .locator('p + [aria-hidden="true"]')
      .filter({ has: page.locator('svg') })
  const dotted = pauseIn(0)
  const dot = pauseIn(2)
  const star = pauseIn(3)
  await expect(pauseIn(1)).toHaveCount(0)
  for (const pause of [dotted, dot, star]) {
    await expect(pause).toHaveCount(1)
    await expect(pause).toBeVisible()
    await expect(pause.locator('xpath=following-sibling::p[1]')).toBeVisible()
    await expect(pause.getByRole('separator', { includeHidden: true })).toHaveCount(0)
  }
  // Dotted: one run of round dots.
  await expect(dotted.locator('svg')).toHaveCount(1)
  await expect(dotted.locator('svg line')).toHaveCount(1)
  // Rule–dot–rule: a single dot between two rule segments.
  await expect(dot.locator('svg')).toHaveCount(1)
  await expect(dot.locator('svg circle')).toHaveCount(1)
  // Dot-and-star: two dotted runs around one star.
  await expect(star.locator('svg line')).toHaveCount(2)
  await expect(star.locator('svg path')).toHaveCount(1)
  // No ornament graphic is focusable.
  await expect(demo.locator('section svg:not([focusable="false"])')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
