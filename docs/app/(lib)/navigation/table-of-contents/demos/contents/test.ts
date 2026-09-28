import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('contents lists the nested headings and marks the section in view', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback.
  // The tabs are disabled until then, so wait for them before asserting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // A nav named by its visible "On this page" heading.
  const nav = demo.getByRole('navigation', { name: 'On this page' })
  await expect(nav).toBeVisible()
  await expect(nav.getByText('On this page', { exact: true })).toBeVisible()

  // Seven in-page links, in order, each to its heading's #id.
  const links = nav.getByRole('link')
  await expect(links).toHaveCount(7)
  await expect(links).toHaveText([
    'What goes in',
    'Greens',
    'Browns',
    'The three bays',
    'Turning days',
    'Worm bins',
    'Sharing finished compost with the other plots',
  ])
  await expect(nav.getByRole('link', { name: 'Greens', exact: true })).toHaveAttribute(
    'href',
    '#compost-greens',
  )
  await expect(nav.getByRole('link', { name: 'Worm bins', exact: true })).toHaveAttribute(
    'href',
    '#compost-worm-bins',
  )

  // H2s at the top level, H3s nested in an ordered list under the H2 before them.
  const topList = nav.getByRole('list').first()
  await expect(topList.locator(':scope > li')).toHaveCount(4)
  const whatGoesIn = topList.locator(':scope > li').nth(0)
  await expect(whatGoesIn.getByRole('list').getByRole('link')).toHaveText(['Greens', 'Browns'])
  const threeBays = topList.locator(':scope > li').nth(1)
  await expect(threeBays.getByRole('list').getByRole('link')).toHaveText(['Turning days'])
  await expect(topList.locator(':scope > li').nth(2).getByRole('list')).toHaveCount(0)

  // Only the section in view is marked, as the current location.
  await expect(nav.locator('[aria-current]')).toHaveCount(1)
  await expect(nav.getByRole('link', { name: 'The three bays', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  )
  await expect(nav.getByRole('link', { name: 'What goes in', exact: true })).not.toHaveAttribute(
    'aria-current',
    /.*/,
  )

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
