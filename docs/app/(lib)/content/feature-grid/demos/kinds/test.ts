import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

const ways = ['Find a trail', 'Take the map', 'Ask a steward']
const steps = ['Pick a date', 'Bring gloves', 'Meet at the kiosk']
const qualities = ['Quiet', 'Shaded', 'Level', 'Open daily']

// Opens the demo, collecting uncaught errors from the start, and waits for it to finish loading.
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
  // The Demo's preview surface, without its code (a stable CSS Module local name).
  const preview = demo.locator('[class*="__preview"]').first()
  return { pageErrors, preview }
}

test('kinds renders the icon, numbered, rule-topped and framed grids', async ({ page }) => {
  const { pageErrors, preview } = await openDemo(page)

  // Four grids, each a section of cells.
  const grids = preview.locator('section')
  await expect(grids).toHaveCount(4)

  // The icon grid: labelled by its §11.8 header heading, so it is a named region.
  const visit = preview.getByRole('region', { name: 'Plan your walk' })
  await expect(visit).toBeVisible()
  await expect(visit.getByRole('heading', { level: 2, name: 'Plan your walk' })).toBeVisible()
  await expect(visit.getByText('Visit', { exact: true })).toBeVisible()
  const visitList = visit.getByRole('list')
  await expect(visitList).toHaveCount(1)
  await expect(visitList.getByRole('listitem')).toHaveCount(3)
  await expect(visitList.getByRole('heading', { level: 3 })).toHaveText(ways)
  await expect(visitList.getByText('Search 40 preserves by distance, terrain and dogs allowed.')).toBeVisible()

  // Only a props header labels the grid: the other three are unnamed.
  await expect(grids.nth(0)).toHaveAttribute('aria-labelledby', /.+/)
  for (const index of [1, 2, 3]) {
    await expect(grids.nth(index)).not.toHaveAttribute('aria-labelledby')
  }

  // The numbered grid is an ordered list; its numerals are decorative.
  const numbered = grids.nth(1)
  await expect(numbered.locator('ol')).toHaveCount(1)
  await expect(numbered.locator('ul')).toHaveCount(0)
  const numberedCells = numbered.getByRole('listitem')
  await expect(numberedCells).toHaveCount(3)
  await expect(numbered.getByRole('heading', { level: 3 })).toHaveText(steps)
  await expect(numbered.locator('li > span[aria-hidden="true"]')).toHaveCount(3)
  await expect(numbered.getByRole('link')).toHaveCount(0)

  // The rule-topped grid: the same three steps in an unordered list, no numerals.
  const ruleTopped = grids.nth(2)
  await expect(ruleTopped.locator('ul')).toHaveCount(1)
  await expect(ruleTopped.locator('ol')).toHaveCount(0)
  await expect(ruleTopped.getByRole('listitem')).toHaveCount(3)
  await expect(ruleTopped.getByRole('heading', { level: 3 })).toHaveText(steps)
  await expect(ruleTopped.locator('li > span[aria-hidden="true"]')).toHaveCount(0)

  // The framed grid: four cells inside one faced frame (a nested face Ground).
  const framed = grids.nth(3)
  await expect(framed.getByRole('listitem')).toHaveCount(4)
  await expect(framed.getByRole('heading', { level: 3 })).toHaveText(qualities)
  await expect(framed.locator('[data-ground]').filter({ has: page.locator('ul') })).toHaveCount(1)
  await expect(
    framed.getByText('One sentence on what it means for your visit.'),
  ).toHaveCount(4)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds links each icon cell through its heading, by keyboard and pointer', async ({ page }) => {
  const { pageErrors, preview } = await openDemo(page)
  const visit = preview.getByRole('region', { name: 'Plan your walk' })

  // One link per cell, each inside its h3 heading.
  const links = visit.getByRole('link')
  await expect(links).toHaveCount(3)
  for (const name of ways) {
    const heading = visit.getByRole('heading', { level: 3, name })
    const link = heading.getByRole('link', { name })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '#kinds')
  }
  // Only the icon grid links its cells.
  await expect(preview.getByRole('link')).toHaveCount(3)

  // Keyboard: Tab moves between the cell links in order; Enter follows one.
  const first = links.nth(0)
  await first.focus()
  await expect(first).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(links.nth(1)).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(links.nth(2)).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(links.nth(1)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#kinds$/)

  // Pointer: clicking a title link follows it too.
  await page.evaluate(() => history.replaceState(null, '', location.pathname))
  await expect(page).not.toHaveURL(/#kinds$/)
  await visit.getByRole('link', { name: 'Ask a steward' }).click()
  await expect(page).toHaveURL(/#kinds$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
