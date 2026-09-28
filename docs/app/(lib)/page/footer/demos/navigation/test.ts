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
  await page.setViewportSize({ width: 1280, height: 1400 })
  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return demo
}

test('navigation footer sitemap mirrors the header sections', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const footer = demo.locator('footer')
  await expect(footer).toHaveAttribute('data-ground', 'night')

  // The header's bar: one item per section, from the same data.
  const main = demo.getByRole('navigation', { name: 'Main' })
  await expect(main).toBeVisible()
  await expect(main.getByRole('button', { name: 'Programs' })).toBeVisible()
  await expect(main.getByRole('link', { name: 'Find a Garden' })).toBeVisible()

  // The footer: a group per section, each heading linked to the section's landing page.
  const site = footer.getByRole('navigation', { name: 'Site' })
  const headings = site.getByRole('heading', { level: 2 })
  await expect(headings).toHaveText(['Our Work', 'Programs', 'Get Involved', 'Find a Garden'])
  await expect(site.getByRole('link', { name: /^Programs/ })).toHaveAttribute('href', '/programs')
  await expect(site.getByRole('link', { name: /^Find a Garden/ })).toHaveAttribute(
    'href',
    '/find-a-garden',
  )
  // Four heading links and the second-tier links; the third tier stays in the mega panels.
  await expect(site.getByRole('link')).toHaveCount(12)
  await expect(site.getByRole('link', { name: 'Stewardship' })).toBeVisible()
  await expect(site.getByRole('link', { name: 'Why grow together' })).toHaveCount(0)
  await expect(site.getByRole('link', { name: 'Plot matching' })).toHaveCount(0)
  // The data marks the current page for the footer.
  await expect(site.getByRole('link', { name: 'Garden programs' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(site.locator('[aria-current="page"]')).toHaveCount(1)
  await expect(footer.getByRole('navigation', { name: 'Legal' }).getByRole('link')).toHaveText([
    'Privacy',
    'Accessibility',
  ])

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('navigation header panel shows the third tier and closes on Escape', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const trigger = demo
    .getByRole('navigation', { name: 'Main' })
    .getByRole('button', { name: 'Programs' })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  // The panel may render outside the demo, so look for its links page-wide.
  await expect(page.getByRole('link', { name: 'Plot matching' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('link', { name: 'Plot matching' })).toBeHidden()
  await expect(trigger).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('navigation back to top moves focus to the page content', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const content = demo.locator('#navigation-demo-content')
  await expect(content).toHaveText('Page content starts here.')
  const backToTop = demo.locator('footer').getByRole('link', { name: 'Back to top' })
  await expect(backToTop).toHaveAttribute('href', '#navigation-demo-content')

  // Pointer.
  await backToTop.click()
  await expect(content).toBeFocused()

  // Keyboard.
  await backToTop.focus()
  await expect(backToTop).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(content).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
