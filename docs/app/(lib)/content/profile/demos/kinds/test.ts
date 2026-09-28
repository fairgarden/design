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

test('kinds shows a byline, an author block and a bio row', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  // Byline: "By" and a linked name (a span, not a heading), then the date.
  const bylineLink = demo.getByRole('link', { name: 'Ana Díaz', exact: true })
  await expect(bylineLink).toHaveCount(1)
  await expect(bylineLink).toHaveAttribute('href', '#kinds')
  await expect(bylineLink.locator('xpath=..')).toHaveText(/^\s*By\s+Ana Díaz\s*$/)
  const date = demo.locator('time[datetime="2026-09-12"]')
  await expect(date).toHaveText('12 Sep 2026')

  // Only the author block and the bio row name with headings, both h3.
  const headings = demo.getByRole('heading', { level: 3 })
  await expect(headings).toHaveCount(2)
  await expect(headings).toHaveText(['Hemlock Ravine Commons', 'Ana Díaz'])

  // Author block: an initials portrait, the name and a description.
  const author = demo.getByRole('heading', { name: 'Hemlock Ravine Commons' }).locator('xpath=..')
  await expect(author).toContainText('HR')
  await expect(author).toContainText('40 acres of garden, orchard and meadow since 1987')
  await expect(author.getByRole('link')).toHaveCount(0)

  // Bio row: name, role, bio and two separate contact links in a list.
  const details = demo.getByRole('heading', { name: 'Ana Díaz', exact: true }).locator('xpath=..')
  await expect(details).toContainText('Stewardship director')
  await expect(details).toContainText('Ana leads the trail crews and the spring bird count.')
  const links = details.getByRole('list')
  await expect(links.getByRole('listitem')).toHaveCount(2)
  await expect(links.getByRole('link')).toHaveText(['ana@example.org', '@anadiaz'])

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds keeps the name link and each social link as their own tab stops', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const nameLink = demo.getByRole('link', { name: 'Ana Díaz', exact: true })
  const email = demo.getByRole('link', { name: 'ana@example.org' })
  const handle = demo.getByRole('link', { name: '@anadiaz' })

  await nameLink.focus()
  await expect(nameLink).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(email).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(handle).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(email).toBeFocused()

  // Keyboard and pointer activation follow the link.
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#kinds$/)
  await page.evaluate(() => history.replaceState(null, '', location.pathname))
  await handle.click()
  await expect(page).toHaveURL(/#kinds$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
