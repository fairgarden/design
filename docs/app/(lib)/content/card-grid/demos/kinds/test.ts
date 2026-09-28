import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

async function openDemo(page: Page) {
  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return demo
}

test('kinds labels each grid by its header and lists its cards', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  // Editorial: the `header` props object renders a band SectionHeader (h2) that labels the section.
  const programs = demo.getByRole('region', { name: 'Get outside' })
  await expect(programs).toBeVisible()
  await expect(programs.getByRole('heading', { level: 2, name: 'Get outside' })).toBeVisible()
  await expect(programs.getByText('Programs', { exact: true })).toBeVisible()
  const programItems = programs.getByRole('list').first().getByRole('listitem')
  await expect(programItems).toHaveCount(3)
  for (const title of ['Spring bird count', 'Meadow restoration', 'Night walk']) {
    await expect(programs.getByRole('link', { name: title })).toHaveAttribute('href', '#kinds')
  }
  await expect(programItems.first()).toContainText('Program · May')
  await expect(programItems.first()).toContainText('Volunteers tally migrants along the river trail.')
  const seeAll = programs.getByRole('link', { name: /See all programs/ })
  await expect(seeAll).toBeVisible()
  await expect(seeAll).toHaveAttribute('href', '#kinds')

  // Compact: a SectionHeader element (module level, h3), labelled through aria-labelledby.
  const species = demo.getByRole('region', { name: 'On the preserve' })
  await expect(species).toBeVisible()
  await expect(species).toHaveAttribute('aria-labelledby', 'card-grid-species')
  await expect(species.getByRole('heading', { level: 3, name: 'On the preserve' })).toHaveAttribute(
    'id',
    'card-grid-species',
  )
  const speciesItems = species.getByRole('list').first().getByRole('listitem')
  await expect(speciesItems).toHaveCount(4)
  for (const name of ['Barred owl', 'Wood thrush', 'Red eft', 'Pawpaw']) {
    await expect(species.getByRole('link', { name })).toBeVisible()
  }
  await expect(species.getByText('Seen this week')).toHaveCount(4)
  // The compact grid has no footer link.
  await expect(species.getByRole('link', { name: /See all/ })).toHaveCount(0)

  // Each grid is a section of its own; the cards never mix between them.
  await expect(demo.locator('section[aria-labelledby]')).toHaveCount(2)
  await expect(programs.getByRole('link', { name: 'Barred owl' })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
