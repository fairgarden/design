import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

async function openDemo(page: import('@playwright/test').Page) {
  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return demo
}

test('row sets each stat as a term and its definitions', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  // Two rows: four stats, then two.
  const rows = demo.locator('dl')
  await expect(rows).toHaveCount(2)
  const [four, two] = [rows.nth(0), rows.nth(1)]

  await expect(four.getByRole('term')).toHaveText([
    'Land protected',
    'Members',
    'Species counted',
    'Trail closures',
  ])
  await expect(two.getByRole('term')).toHaveText(['Volunteer hours', 'Wetland restored'])

  // Figures with their units, qualifiers, deltas and source, as definitions of each term.
  const fourDefs = four.getByRole('definition')
  await expect(fourDefs.filter({ hasText: /^4,200\s*ha$/ })).toHaveCount(1)
  await expect(fourDefs.filter({ hasText: 'across 38 preserves' })).toHaveCount(1)
  await expect(fourDefs.filter({ hasText: /^15,000\+$/ })).toHaveCount(1)
  await expect(fourDefs.filter({ hasText: /^312$/ })).toHaveCount(1)
  await expect(fourDefs.filter({ hasText: 'in the 2026 bird count' })).toHaveCount(1)
  await expect(fourDefs.filter({ hasText: /^3$/ })).toHaveCount(1)
  const twoDefs = two.getByRole('definition')
  await expect(twoDefs.filter({ hasText: /^8,640\s*h$/ })).toHaveCount(1)
  await expect(twoDefs.filter({ hasText: /^≈ 62\s*ha$/ })).toHaveCount(1)
  await expect(twoDefs.filter({ hasText: 'since 2019' })).toHaveCount(1)
  await expect(twoDefs.filter({ hasText: 'in 2026' })).toHaveCount(1)

  // Deltas are drawn after a named glyph, never colour alone.
  const up = four.getByRole('img', { name: 'Up' })
  const down = four.getByRole('img', { name: 'Down' })
  await expect(up).toHaveCount(1)
  await expect(down).toHaveCount(1)
  await expect(fourDefs.filter({ has: up })).toHaveText('12% since 2025')
  await expect(fourDefs.filter({ has: down })).toHaveText('2 fewer than last spring')
  await expect(two.getByRole('img')).toHaveCount(0)

  // The one source is a note reference to the note below the rows.
  await expect(demo.getByRole('link')).toHaveCount(1)
  const noteref = four.getByRole('link', { name: '1' })
  await expect(noteref).toHaveAttribute('href', '#stat-note-1')
  await expect(demo.locator('#stat-note-1')).toHaveText(
    '1. Conservation easements and owned preserves, as of June 2026.',
  )

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('row follows its note reference by keyboard and pointer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const noteref = demo.getByRole('link', { name: '1' })
  const note = demo.locator('#stat-note-1')

  await noteref.focus()
  await expect(noteref).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#stat-note-1$/)
  await expect(note).toBeInViewport()

  // Back to the route without the hash, then follow it with the pointer.
  await page.goBack()
  await expect(page).not.toHaveURL(/#stat-note-1$/)
  await noteref.click()
  await expect(page).toHaveURL(/#stat-note-1$/)
  await expect(note).toBeInViewport()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
