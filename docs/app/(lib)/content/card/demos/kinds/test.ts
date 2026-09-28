import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('kinds shows bare, faced, block and entry cards', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const cards = demo.getByRole('article')
  await expect(cards).toHaveCount(4)
  const [bare, faced, block, entry] = [0, 1, 2, 3].map((index) => cards.nth(index))

  // Bare (the default): an h3 title link and no face scope.
  await expect(bare.getByRole('heading', { level: 3 })).toHaveText('Spring bird count')
  await expect(bare.getByText('Editorial · bare (default)')).toBeVisible()
  await expect(bare.locator('[data-ground]')).toHaveCount(0)

  // Faced: a nested white face, and a standalone "Read more" link in its footer.
  await expect(faced.getByRole('heading', { level: 3 })).toHaveText('Meadow restoration')
  await expect(faced.getByText('Editorial · faced')).toBeVisible()
  await expect(faced.locator('[data-ground]').first()).toHaveAttribute('data-ground', 'white')
  await expect(faced.getByRole('link', { name: 'Read more' })).toHaveAttribute('href', '#kinds')

  // Block: always faced.
  await expect(block.getByRole('heading', { level: 3 })).toHaveText('Protect the headwaters')
  await expect(block.getByText('Block · featured')).toBeVisible()
  await expect(block.locator('[data-ground]').first()).toHaveAttribute('data-ground', 'white')

  // Entry: a decorative square image, a kicker, and a paragraph title (not a heading).
  await expect(entry.locator('[data-ground]').first()).toHaveAttribute('data-ground', 'white')
  await expect(entry.locator('figure img')).toHaveCount(1)
  await expect(entry.locator('figure img')).toHaveAttribute('alt', '')
  await expect(entry.getByText('Entry · hero')).toBeVisible()
  await expect(entry.getByRole('heading')).toHaveCount(0)
  await expect(entry.getByRole('link', { name: 'Find a garden plot' })).toBeVisible()

  // Three card headings in all: the entry card's title is a paragraph.
  await expect(cards.getByRole('heading', { level: 3 })).toHaveCount(3)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds reaches each card link by keyboard and follows the stretched title link', async ({
  page,
}) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const cards = demo.getByRole('article')
  const link = (name: string) => cards.getByRole('link', { name, exact: true })

  // Each title link, and the faced card's footer link, is its own tab stop, in reading order.
  await link('Spring bird count').focus()
  await expect(link('Spring bird count')).toBeFocused()
  for (const name of [
    'Meadow restoration',
    'Read more',
    'Protect the headwaters',
    'Find a garden plot',
  ]) {
    await page.keyboard.press('Tab')
    await expect(link(name)).toBeFocused()
  }

  // Enter follows the focused title link.
  await expect(page).not.toHaveURL(/#kinds$/)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#kinds$/)

  // The title link's hit area stretches over the card: clicking the body text follows it too.
  await page.goto(route)
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  await expect(page).not.toHaveURL(/#kinds$/)
  await cards
    .first()
    .getByText('Volunteers tally migrants along the river trail every May.')
    .click()
  await expect(page).toHaveURL(/#kinds$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
