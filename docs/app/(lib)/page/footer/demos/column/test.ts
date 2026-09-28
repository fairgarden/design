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

test('column renders the newsletter, ruled and minimal footers', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  await page.setViewportSize({ width: 1280, height: 1400 })

  const demo = await openDemo(page)
  const footers = demo.locator('footer')
  await expect(footers).toHaveCount(3)

  // The newsletter column: the guide footer on the night band, the sitemap beside the form.
  const column = footers.nth(0)
  await expect(column).toHaveAttribute('data-ground', 'night')
  await expect(column).toHaveAttribute('data-theme', 'dark')
  await expect(
    column.getByRole('heading', { name: 'Get the Latest Conservation News' }),
  ).toBeVisible()
  await expect(column.getByRole('textbox', { name: /Email Address/ })).toBeVisible()
  await expect(column.getByRole('button', { name: 'Subscribe' })).toBeVisible()
  // Above 1024 px the 28 sitemap links stay open in their groups; the Accordion is for phones.
  const site = column.getByRole('navigation', { name: 'Site' })
  await expect(site.getByRole('link', { name: 'Stories: Our Work' })).toBeVisible()
  await expect(site.getByRole('link', { name: 'Clean Water' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(site.getByRole('button')).toHaveCount(0)
  await expect(column.getByRole('navigation', { name: 'Legal' }).getByRole('link')).toHaveCount(1)

  // The ruled grid on the paper ground: section cells and labelled contact rows.
  const ruled = footers.nth(1)
  await expect(ruled).toHaveAttribute('data-ground', 'paper')
  const cells = ruled.getByRole('navigation', { name: 'Site' }).getByRole('link')
  await expect(cells).toHaveCount(5)
  await expect(cells.first()).toHaveText('Our Work')
  await expect(cells.nth(1)).toHaveText('Programs')
  await expect(cells.nth(2)).toHaveText('Get Involved')
  await expect(ruled.getByText('Email', { exact: true })).toBeVisible()
  await expect(ruled.getByRole('link', { name: 'hello@example.org' })).toHaveAttribute(
    'href',
    'mailto:hello@example.org',
  )
  await expect(ruled.getByRole('link', { name: '202 555 0100' })).toHaveAttribute(
    'href',
    'tel:+12025550100',
  )

  // The minimal footer on the white ground: one link line, the legal row and the colophon.
  const minimal = footers.nth(2)
  await expect(minimal).toHaveAttribute('data-ground', 'white')
  await expect(minimal.getByRole('navigation', { name: 'Site' }).getByRole('link')).toHaveCount(5)
  const legal = minimal.getByRole('navigation', { name: 'Legal' }).getByRole('link')
  await expect(legal).toHaveText(['Privacy', 'Terms'])
  await expect(minimal.getByText('Version 0.1.0.').first()).toBeVisible()
  await expect(minimal.getByText('© 2026 FairGarden').first()).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('column collapses the large sitemap into an Accordion on phones', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  await page.setViewportSize({ width: 390, height: 1400 })

  const demo = await openDemo(page)
  const site = demo.locator('footer').first().getByRole('navigation', { name: 'Site' })

  const rows = site.getByRole('button')
  await expect(rows).toHaveCount(4)
  const ourWork = site.getByRole('button', { name: 'Our Work' })
  const programs = site.getByRole('button', { name: 'Programs' })
  await expect(ourWork).toHaveAttribute('aria-expanded', 'false')
  await expect(site.getByRole('link', { name: 'Stories: Our Work' })).toBeHidden()

  // Pointer: open a group; its landing link leads the list.
  await ourWork.click()
  await expect(ourWork).toHaveAttribute('aria-expanded', 'true')
  await expect(site.getByRole('link', { name: 'Stories: Our Work' })).toBeVisible()
  await expect(site.getByRole('link', { name: 'Climate' })).toBeVisible()

  // Keyboard: open another group, then close it again.
  await programs.focus()
  await page.keyboard.press('Enter')
  await expect(programs).toHaveAttribute('aria-expanded', 'true')
  await expect(site.getByRole('link', { name: 'Stories: Programs' })).toBeVisible()
  await page.keyboard.press('Space')
  await expect(programs).toHaveAttribute('aria-expanded', 'false')
  await expect(site.getByRole('link', { name: 'Stories: Programs' })).toBeHidden()
  await expect(programs).toBeFocused()

  // Pointer again closes the first group.
  await ourWork.click()
  await expect(ourWork).toHaveAttribute('aria-expanded', 'false')
  await expect(site.getByRole('link', { name: 'Stories: Our Work' })).toBeHidden()

  // The small sitemaps (24 links or fewer) never collapse.
  await expect(demo.locator('footer').nth(1).getByRole('button')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
