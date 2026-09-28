import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

/** Opens the demo once its code has loaded, and returns its preview surface. */
async function openDemo(page: Page) {
  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before asserting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  // The Demo's preview surface, without its code (a CSS Module class, whose local name is
  // stable across builds).
  return demo.locator('[class*="__preview"]').first()
}

test('ornaments shows the trails, the four marker sets and the blob mount', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const preview = await openDemo(page)

  // Every ornament is decorative: nothing in the demo is exposed as an image.
  await expect(preview.getByRole('img')).toHaveCount(0)
  const svgs = preview.locator('svg')
  const hiddenSvgs = preview.locator('svg[aria-hidden="true"][focusable="false"]')
  await expect(hiddenSvgs).toHaveCount(await svgs.count())

  // The trail: a short tail on its own, and an entry that runs level into its label.
  const label = preview.getByText('Get outside', { exact: true })
  await expect(label).toBeVisible()
  const entry = label.locator('xpath=..')
  await expect(entry.locator('svg[aria-hidden="true"]')).toHaveCount(1)
  const entryBox = await entry.locator('svg').boundingBox()
  const labelBox = await label.boundingBox()
  expect(entryBox && labelBox && labelBox.x >= entryBox.x + entryBox.width).toBeTruthy()

  // Each marker set: its markers, named in words beside them.
  const set = (name: string) => preview.getByText(name, { exact: true }).locator('xpath=..')

  // On a trail: origin, waypoint and terminal.
  await expect(set('On a trail').locator('svg[aria-hidden="true"]')).toHaveCount(3)
  // On a timeline: origin, waypoint, current and terminal.
  await expect(set('On a timeline').locator('svg[aria-hidden="true"]')).toHaveCount(4)

  // The index circles are zero-padded to two digits.
  const index = set('Index')
  await expect(index.locator('svg')).toHaveCount(0)
  await expect(index.locator('span').filter({ hasNotText: 'Index' })).toHaveText(['01', '02', '12'])

  // The rank numerals take no padding and no period.
  const rank = set('Rank')
  await expect(rank.locator('svg')).toHaveCount(0)
  await expect(rank.locator('span').filter({ hasNotText: 'Rank' })).toHaveText(['1', '2', '10'])

  // The blob mount holds a stat numeral, readable as text over its decorative discs.
  const numeral = preview.getByText('40', { exact: true })
  await expect(numeral).toBeVisible()
  await expect(preview.getByText('Blob mount with a stat numeral', { exact: true })).toBeVisible()
  // The numeral sits in the blob's mark, a sibling of the decorative discs.
  const blob = preview.locator('[class*="ornamentBlob"]')
  await expect(blob).toHaveCount(1)
  await expect(blob.getByText('40', { exact: true })).toBeVisible()
  await expect(blob.locator('svg[aria-hidden="true"]')).toHaveCount(1)

  // Trails (2), trail markers (3), timeline markers (4) and the blob's discs (1).
  await expect(svgs).toHaveCount(10)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('ornaments timeline markers are larger than the trail markers', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const preview = await openDemo(page)
  const set = (name: string) => preview.getByText(name, { exact: true }).locator('xpath=..')
  const trail = set('On a trail').locator('svg')
  const timeline = set('On a timeline').locator('svg')
  await expect(trail).toHaveCount(3)
  await expect(timeline).toHaveCount(4)

  // size="timeline" enlarges the origin and terminal.
  const trailOrigin = await trail.nth(0).boundingBox()
  const timelineOrigin = await timeline.nth(0).boundingBox()
  expect(trailOrigin && timelineOrigin).toBeTruthy()
  expect(timelineOrigin!.width).toBeGreaterThan(trailOrigin!.width)
  const trailTerminal = await trail.nth(2).boundingBox()
  const timelineTerminal = await timeline.nth(3).boundingBox()
  expect(timelineTerminal!.width).toBeGreaterThan(trailTerminal!.width)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
