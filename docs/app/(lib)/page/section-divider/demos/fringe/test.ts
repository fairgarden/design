import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test.use({ colorScheme: 'light' })

test('fringe hangs from the night footer as a decorative edge', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const paper = demo.locator('section[data-ground="paper"]')
  const footer = demo.locator('footer[data-ground="night"]')
  await expect(paper).toHaveCount(1)
  await expect(footer).toHaveCount(1)

  // The paper band follows the page; the night footer is always dark.
  await expect(paper.getByText('Paper', { exact: true })).toBeVisible()
  await expect(paper).not.toHaveAttribute('data-theme')
  await expect(footer).toHaveAttribute('data-theme', 'dark')
  await expect(footer).toHaveAttribute('data-tone', /.+/)
  await expect(footer.getByText('Night: the footer')).toBeVisible()
  await expect(footer.getByText('Ticks hang from its top edge in light mode only.')).toBeVisible()

  // The divider is the footer's first child, in the footer's own scope, hidden from assistive tech.
  const divider = footer.locator(':scope > :first-child')
  await expect(divider).toHaveAttribute('aria-hidden', 'true')
  await expect(divider).toHaveAttribute('data-ground', 'night')
  await expect(divider).toHaveAttribute('data-scheme', 'dark')
  // Inside the night band the ticks take its own ink: no nested night Ground host.
  await expect(divider.locator('[data-ground]')).toHaveCount(0)
  await expect(divider.locator(':scope > span')).toHaveCount(2)

  // Decorative only: nothing in the preview is exposed as a separator.
  await expect(demo.locator('section, footer').getByRole('separator')).toHaveCount(0)
  // A page carries one shaped edge: the paper band holds no divider.
  await expect(paper.locator('[aria-hidden="true"]')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
