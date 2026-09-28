import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('kinds shows the leader list, form box and manual page', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before asserting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // Three sheets: the innermost sections of the preview.
  const sheets = demo.locator('section').filter({ hasNot: page.locator('section') })
  await expect(sheets).toHaveCount(3)

  // Two sheets are named by their module heads (H3); the manual has no heading.
  const leader = demo.getByRole('region', { name: 'Bench, Oak' })
  await expect(leader).toBeVisible()
  await expect(leader.getByRole('heading', { level: 3, name: 'Bench, Oak' })).toBeVisible()

  // Leader: one column of label/value rows.
  await expect(leader.getByRole('term')).toHaveText(['Width', 'Depth', 'Seat height', 'Finish'])
  await expect(leader.getByRole('definition')).toHaveText([
    '180 cm (71 in)',
    '45 cm (18 in)',
    '46 cm (18 in)',
    'Oiled, food-safe',
  ])
  // No disclosure on these sheets.
  await expect(demo.getByRole('button', { name: /Details/ })).toHaveCount(0)

  // Form box: the grid, with the estimated cell prefixed by "≈".
  const formBox = demo.getByRole('region', { name: 'Survey Record' })
  await expect(formBox).toBeVisible()
  await expect(formBox.getByRole('heading', { level: 3, name: 'Survey Record' })).toBeVisible()
  await expect(formBox.getByRole('term')).toHaveText(['Plot', 'Observer', 'Date', 'Cover'])
  await expect(formBox.getByRole('definition')).toHaveText([
    'B-14',
    'A. Díaz',
    '22 Sept 2026',
    '≈ 60%',
  ])

  // Manual: no heading and no grid; a double-framed title and numbered list.
  const manual = sheets.filter({ has: page.locator('ol') })
  await expect(manual).toHaveCount(1)
  await expect(manual.getByRole('heading')).toHaveCount(0)
  await expect(manual.getByRole('term')).toHaveCount(0)
  await expect(manual.getByText('Garden Plate', { exact: true })).toBeVisible()
  const steps = manual.getByRole('list')
  await expect(steps).toBeVisible()
  expect(await steps.evaluate((el) => el.tagName)).toBe('OL')
  await expect(steps.getByRole('listitem')).toHaveText([
    'Roasted roots, warm',
    'Leaves from the east beds',
    'Seed crumble',
  ])

  // Only the leader and form box hold spec terms.
  await expect(sheets.filter({ has: page.getByRole('term') })).toHaveCount(2)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
