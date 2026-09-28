import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('groups lists the page tree under linked group headings and marks the current page', async ({
  page,
}) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback.
  // The tabs are disabled until then, so wait for them before asserting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // A nav landmark named by the `label` prop.
  const nav = demo.getByRole('navigation', { name: 'Handbook' })
  await expect(nav).toBeVisible()

  // Three groups, each heading a link to the group's index page (caps are set by CSS).
  const groups = nav.locator(':scope > ul > li')
  await expect(groups).toHaveCount(3)
  const heading = (name: RegExp) => nav.getByRole('link', { name })
  await expect(heading(/^getting started$/i)).toHaveAttribute('href', '/handbook')
  await expect(heading(/^garden care$/i)).toHaveAttribute('href', '/handbook/garden-care')
  await expect(heading(/^shared spaces$/i)).toHaveAttribute('href', '/handbook/shared-spaces')

  // Each group's page list is named by its heading.
  const gettingStarted = nav.getByRole('list', { name: /^getting started$/i })
  await expect(gettingStarted.getByRole('link')).toHaveText([
    'Welcome',
    'Your first season',
    'Plot agreements',
  ])
  const gardenCare = nav.getByRole('list', { name: /^garden care$/i })
  await expect(gardenCare.locator(':scope > li')).toHaveCount(4)
  await expect(gardenCare.locator(':scope > li > a')).toHaveText([
    'Soil and beds',
    'Watering',
    'Composting',
    'Seed saving',
  ])
  const sharedSpaces = nav.getByRole('list', { name: /^shared spaces$/i })
  await expect(sharedSpaces.getByRole('link')).toHaveText(['Tool shed', 'Water points', 'Work days'])

  // Composting's subpages nest one level in, on their own list.
  const composting = gardenCare.locator(':scope > li').nth(2)
  await expect(composting.getByRole('list').getByRole('link')).toHaveText(['Hot compost', 'Worm bins'])
  await expect(nav.getByRole('link', { name: 'Worm bins' })).toHaveAttribute(
    'href',
    '/handbook/composting/worms',
  )

  // Every heading and page is a link: 3 headings + 3 + 4 + 2 + 3 pages.
  await expect(nav.getByRole('link')).toHaveCount(15)

  // Only the current page is marked, and nothing folds: no toggles without `collapsible`.
  await expect(nav.locator('[aria-current]')).toHaveCount(1)
  await expect(nav.getByRole('link', { name: 'Composting', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(nav.getByRole('link', { name: 'Watering', exact: true })).not.toHaveAttribute(
    'aria-current',
  )
  await expect(nav.getByRole('button')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('groups moves focus through the links in reading order', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const nav = demo.getByRole('navigation', { name: 'Handbook' })

  // From the Garden care heading, Tab walks its pages, into Composting's subpages, and on.
  await nav.getByRole('link', { name: /^garden care$/i }).focus()
  for (const name of [
    'Soil and beds',
    'Watering',
    'Composting',
    'Hot compost',
    'Worm bins',
    'Seed saving',
  ]) {
    await page.keyboard.press('Tab')
    await expect(nav.getByRole('link', { name, exact: true })).toBeFocused()
  }
  await page.keyboard.press('Tab')
  await expect(nav.getByRole('link', { name: /^shared spaces$/i })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(nav.getByRole('link', { name: 'Seed saving', exact: true })).toBeFocused()

  // Hovering a page link changes no state: the current page stays the only one marked.
  await nav.getByRole('link', { name: 'Watering', exact: true }).hover()
  await expect(nav.locator('[aria-current="page"]')).toHaveText('Composting')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
