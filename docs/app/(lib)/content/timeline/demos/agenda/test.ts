import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('agenda groups sessions under a dated day', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before asserting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  // The rendered demo, without its code panel.
  const preview = demo.locator('[class*="__preview"]').first()

  // The day: an h3 date head and the scope caption stating the time zone once.
  const dateHead = preview.getByRole('heading', { level: 3 })
  await expect(dateHead).toHaveCount(1)
  await expect(dateHead).toHaveText('Saturday, 3 October')
  await expect(preview.getByText('All times are Eastern.', { exact: true })).toBeVisible()

  // Two sessions in one ordered list, each led by a decorative » marker.
  const list = preview.getByRole('list')
  await expect(list).toHaveCount(1)
  await expect(list.evaluate((el) => el.tagName)).resolves.toBe('OL')
  const sessions = list.getByRole('listitem')
  await expect(sessions).toHaveCount(2)
  for (const session of await sessions.all()) {
    await expect(session.locator('svg').first()).toHaveAttribute('aria-hidden', 'true')
  }

  // Session titles are h4s with their meta joined by pipes (no-break space before each pipe).
  const titles = preview.getByRole('heading', { level: 4 })
  await expect(titles).toHaveCount(2)
  await expect(titles.nth(0)).toHaveText(/^Warblers of the ravine\s\|\sWalk\s\|\s9–11 a\.m\.$/)
  await expect(titles.nth(1)).toHaveText(/^Why meadows burn\s\|\sTalk\s\|\s1–2 p\.m\.$/)
  const firstTitleText = await titles.nth(0).textContent()
  expect(firstTitleText, 'a no-break space precedes each pipe').toContain(' |')

  // "Happening now" is said in words on the first session only.
  await expect(sessions.nth(0)).toContainText('Happening now')
  await expect(sessions.nth(1)).not.toContainText('Happening now')
  await expect(sessions.nth(0)).toContainText('A slow loop with the bird count leaders.')
  await expect(sessions.nth(1)).toContainText('Our stewardship director on fire as a tool.')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
