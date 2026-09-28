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

test('kinds ranked list is ordered with ranks, counts and a current row', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  const ranked = demo
    .locator('section')
    .filter({ has: page.getByRole('heading', { level: 2, name: 'Most read topics' }) })
  await expect(ranked).toHaveCount(1)

  // Ranked rows render an ordered list, whose order means something.
  const list = ranked.getByRole('list')
  await expect(list).toHaveJSProperty('tagName', 'OL')
  const rows = list.getByRole('listitem')
  await expect(rows).toHaveCount(3)

  const topics = [
    { label: 'Birding', count: '(29)' },
    { label: 'Trail work', count: '(21)' },
    { label: 'Native plants', count: '(17)' },
  ]
  for (const [index, topic] of topics.entries()) {
    const row = rows.nth(index)
    // The rank numeral has no period.
    await expect(row).toContainText(String(index + 1))
    await expect(row).not.toContainText(`${index + 1}.`)
    const heading = row.getByRole('heading', { level: 3 })
    await expect(heading).toContainText(topic.label)
    await expect(heading).toContainText(topic.count)
    // One title link per row.
    await expect(row.getByRole('link')).toHaveCount(1)
    await expect(row.getByRole('link', { name: topic.label })).toHaveAttribute('href', '#kinds')
  }

  // Only the second row is marked current.
  await expect(ranked.locator('[aria-current]')).toHaveCount(1)
  await expect(rows.nth(1).getByRole('link', { name: 'Trail work' })).toHaveAttribute(
    'aria-current',
    'page',
  )

  // The footer's standalone link sits outside the list.
  const seeAll = ranked.getByRole('link', { name: 'See all topics' })
  await expect(seeAll).toBeVisible()
  await expect(list.getByRole('link', { name: 'See all topics' })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds related and article lists show thumbnails, meta and deks', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  // Three listings in all, two of them with a header heading.
  await expect(demo.locator('section')).toHaveCount(3)
  await expect(demo.getByRole('heading', { level: 2 })).toHaveText(['Most read topics', 'Related'])

  // Related: an unordered list, a decorative thumbnail beside each title.
  const related = demo
    .locator('section')
    .filter({ has: page.getByRole('heading', { level: 2, name: 'Related' }) })
  const relatedList = related.getByRole('list')
  await expect(relatedList).toHaveJSProperty('tagName', 'UL')
  const relatedRows = relatedList.getByRole('listitem')
  await expect(relatedRows).toHaveCount(2)
  for (const [index, title] of ['How owls hear', 'Nest boxes that work'].entries()) {
    const row = relatedRows.nth(index)
    await expect(row.getByRole('heading', { level: 3, name: title })).toBeVisible()
    await expect(row.getByRole('link')).toHaveCount(1)
    const img = row.locator('img')
    await expect(img).toHaveCount(1)
    // Empty alt: the thumbnail is decorative, so it has no image role.
    await expect(img).toHaveAttribute('alt', '')
    await expect(row.getByRole('img')).toHaveCount(0)
  }

  // Article: the listing without a header.
  const article = demo.locator('section').nth(2)
  await expect(article.getByRole('heading', { level: 2 })).toHaveCount(0)
  const articleList = article.getByRole('list')
  await expect(articleList).toHaveJSProperty('tagName', 'UL')
  const articleRows = articleList.getByRole('listitem')
  await expect(articleRows).toHaveCount(2)

  const otter = articleRows.nth(0)
  await expect(
    otter.getByRole('heading', { level: 3, name: 'The long return of the river otter' }),
  ).toBeVisible()
  await expect(otter.getByText('Field notes · 12 Sep 2026')).toBeVisible()
  await expect(
    otter.getByText('Twenty years after the last sighting, tracks on the sandbar.'),
  ).toBeVisible()

  const trees = articleRows.nth(1)
  await expect(
    trees.getByRole('heading', { level: 3, name: 'Why we leave the dead trees standing' }),
  ).toBeVisible()
  await expect(trees.getByText('Stewardship · 3 Sep 2026')).toBeVisible()
  // The dek is optional: the second row has only its title and meta.
  await expect(trees.locator('p')).toHaveCount(1)

  // No row outside the ranked list is marked current.
  await expect(related.locator('[aria-current]')).toHaveCount(0)
  await expect(article.locator('[aria-current]')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds title links move focus by keyboard in reading order', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  const order = [
    'Birding',
    'Trail work',
    'Native plants',
    'See all topics',
    'How owls hear',
    'Nest boxes that work',
    'The long return of the river otter',
    'Why we leave the dead trees standing',
  ]
  await demo.getByRole('link', { name: order[0] }).focus()
  await expect(demo.getByRole('link', { name: order[0] })).toBeFocused()
  for (const name of order.slice(1)) {
    await page.keyboard.press('Tab')
    await expect(demo.getByRole('link', { name })).toBeFocused()
  }

  // Following a title link stays on the demo route, at its #kinds anchor.
  await demo.getByRole('link', { name: 'How owls hear' }).click()
  await expect(page).toHaveURL(/#kinds$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
