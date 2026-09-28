import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('guide renders the field-guide footer on the night band', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  await page.setViewportSize({ width: 1280, height: 1400 })

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const footer = demo.locator('footer')
  await expect(footer).toHaveCount(1)
  await expect(footer).toHaveAttribute('data-ground', 'night')
  await expect(footer).toHaveAttribute('data-theme', 'dark')

  // The brand column: the home link, the address, the contact line and social links.
  await expect(footer.locator('a[href="/"]')).toBeVisible()
  await expect(footer.locator('address')).toContainText('88 Allotment Lane, Studio 2')
  await expect(footer.getByRole('link', { name: 'info@example.org' })).toHaveAttribute(
    'href',
    'mailto:info@example.org',
  )
  await expect(footer.getByRole('link', { name: '802 555 0100' })).toHaveAttribute(
    'href',
    'tel:+18025550100',
  )
  // An icon-only social link is named by its label.
  await expect(footer.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
    'href',
    'https://instagram.com/example',
  )
  await expect(footer.getByRole('link', { name: 'Newsletter', exact: true })).toBeVisible()

  // Three action blocks, each a region named by its heading, with its Button link.
  const blocks = [
    ['Talk to a Garden Mentor', 'Find One Near You', '/find'],
    ['Get the Guide', 'Download the Guide', '/guide'],
    ['Support the Work', 'Donate', '/donate'],
  ] as const
  for (const [heading, action, href] of blocks) {
    const block = footer.getByRole('region', { name: heading })
    await expect(block.getByRole('heading', { level: 2, name: heading })).toBeVisible()
    await expect(block.getByRole('link', { name: action })).toHaveAttribute('href', href)
  }

  // The sitemap: one group per section, headed by its (linked) label, all open at 12 links.
  const site = footer.getByRole('navigation', { name: 'Site' })
  await expect(site.getByRole('heading', { level: 2 })).toHaveCount(4)
  await expect(site.getByRole('heading', { name: 'Find a Garden' })).toBeVisible()
  await expect(site.getByRole('link', { name: /^Our Work/ })).toHaveAttribute('href', '/our-work')
  await expect(site.getByRole('link')).toHaveCount(15)
  await expect(site.getByRole('button')).toHaveCount(0)
  await expect(site.getByRole('link', { name: 'Clean Water' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(site.locator('[aria-current="page"]')).toHaveCount(1)
  await expect(site.getByRole('link', { name: /Regional Garden Network/ })).toHaveAttribute(
    'href',
    'https://example.org/network',
  )

  // The legal row, the ©, the colophon and the in-flow back-to-top link.
  await expect(footer.getByRole('navigation', { name: 'Legal' }).getByRole('link')).toHaveText([
    'Privacy',
    'Accessibility',
    'Non-Discrimination',
  ])
  await expect(footer.getByText('© 2026 FairGarden').first()).toBeVisible()
  await expect(footer.getByText(/^Set in Fraunces/).first()).toBeVisible()
  await expect(footer.getByRole('link', { name: 'Back to top' })).toHaveAttribute('href', '#top')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('guide moves through the block actions from the keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  await page.setViewportSize({ width: 1280, height: 1400 })

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const footer = demo.locator('footer')
  const find = footer.getByRole('link', { name: 'Find One Near You' })
  await find.focus()
  await expect(find).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(footer.getByRole('link', { name: 'Download the Guide' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(footer.getByRole('link', { name: 'Donate' }).first()).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(footer.getByRole('link', { name: 'Download the Guide' })).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
