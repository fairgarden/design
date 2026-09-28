import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test.describe('in light mode', () => {
  test.use({ colorScheme: 'light' })

  test('hill rises from the paper band into the night hero', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    await page.goto(route)
    const demo = page.locator('.demo').first()
    // The preview remounts, losing its state, when the demo's code content replaces the loading
    // fallback. The tabs are disabled until then, so wait for them before interacting.
    await expect(
      demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
    ).toHaveCount(0, { timeout: 15000 })

    const night = demo.locator('section[data-ground="night"]')
    const paper = demo.locator('section[data-ground="paper"]')
    await expect(night).toHaveCount(1)
    await expect(paper).toHaveCount(1)
    await expect(night).toHaveAttribute('data-theme', 'dark')
    await expect(night.getByText('Night: the media hero')).toBeVisible()
    await expect(paper.getByText('Paper rises into it')).toBeVisible()
    await expect(paper.getByText('The curve is 4.6% of the width, clamped 12–64 px.')).toBeVisible()

    // The hill is the paper band's first child, in the paper scope, hidden from assistive tech.
    const divider = paper.locator(':scope > :first-child')
    await expect(divider).toHaveAttribute('aria-hidden', 'true')
    await expect(divider).toHaveAttribute('data-ground', 'paper')
    await expect(paper.getByRole('separator')).toHaveCount(0)

    // Its shape host is a night Ground carrying only the shaped-edge switch.
    const shape = divider.locator(':scope > span[data-ground="night"]')
    await expect(shape).toHaveCount(1)
    await expect(shape).toHaveAttribute('data-theme', 'dark')

    // In light mode the curve shows, its amplitude clamped 12–64 px.
    await expect(shape).toBeVisible()
    const box = await shape.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.height).toBeGreaterThanOrEqual(11.5)
    expect(box!.height).toBeLessThanOrEqual(64.5)

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})

test.describe('in dark mode', () => {
  test.use({ colorScheme: 'dark' })

  test('hill drops for the straight seam on a dark page', async ({ page }) => {
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
    const divider = paper.locator(':scope > :first-child')
    await expect(divider).toHaveAttribute('aria-hidden', 'true')
    const shape = divider.locator(':scope > span[data-ground="night"]')
    await expect(shape).toHaveCount(1)
    await expect(shape).toBeHidden()
    await expect(paper.getByText('Paper rises into it')).toBeVisible()

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})
