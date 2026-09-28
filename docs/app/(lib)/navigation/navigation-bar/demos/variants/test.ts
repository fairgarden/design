import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

const sections = ['Our Work', 'Programs', 'Get Involved']

// Wide enough that the Navigation Menu shows inline rather than moving into the drawer.
test.use({ viewport: { width: 1440, height: 1400 } })

test('variants renders the ruled, masthead and compact bars', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // Three headers, one per variant, in order: ruled, masthead, compact.
  const bars = demo.locator('header[data-ground]')
  await expect(bars).toHaveCount(3)
  const [ruled, masthead, compact] = [bars.nth(0), bars.nth(1), bars.nth(2)]

  await expect(ruled).toHaveClass(/ruled/)
  await expect(masthead).toHaveClass(/masthead/)
  await expect(compact).toHaveClass(/compact/)
  // Only the ruled bar sets a preset: the tide band. The others take the default paper ground.
  await expect(ruled).toHaveAttribute('data-ground', 'tide')
  await expect(masthead).toHaveAttribute('data-ground', 'paper')
  await expect(compact).toHaveAttribute('data-ground', 'paper')
  // None is docked: `compact` is set as a prop, not by the sticky observer.
  for (const bar of [ruled, masthead, compact]) {
    await expect(bar).not.toHaveAttribute('data-docked', /.*/)
  }

  // Each bar has its home link, its Main landmark with the three sections, and the action.
  for (const bar of [ruled, masthead, compact]) {
    await expect(bar.getByRole('link', { name: 'FairGarden home' })).toBeVisible()
    const nav = bar.getByRole('navigation', { name: 'Main' })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link')).toHaveText(sections)
    await expect(bar.getByRole('button', { name: 'Donate' })).toBeVisible()
  }
  await expect(demo.getByRole('link', { name: 'FairGarden home' })).toHaveCount(3)
  await expect(demo.getByRole('navigation', { name: 'Main' })).toHaveCount(3)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('variants marks the current page and the parent of current', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const bars = demo.locator('header[data-ground]')
  await expect(bars).toHaveCount(3)
  const link = (bar: number, name: string) =>
    bars.nth(bar).getByRole('navigation', { name: 'Main' }).getByRole('link', { name })

  // Ruled: currentPath "/get-involved" makes Get Involved the current page.
  await expect(link(0, 'Get Involved')).toHaveAttribute('aria-current', 'page')
  await expect(link(0, 'Our Work')).not.toHaveAttribute('aria-current', /.*/)
  await expect(link(0, 'Programs')).not.toHaveAttribute('aria-current', /.*/)

  // Masthead: currentPath "/programs/gardens" lies under Programs, the parent of current.
  await expect(link(1, 'Programs')).toHaveAttribute('aria-current', 'true')
  await expect(link(1, 'Our Work')).not.toHaveAttribute('aria-current', /.*/)
  await expect(link(1, 'Get Involved')).not.toHaveAttribute('aria-current', /.*/)

  // Compact: no currentPath, so no item is current.
  await expect(
    bars.nth(2).getByRole('navigation', { name: 'Main' }).locator('[aria-current]'),
  ).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('variants moves focus through each bar in order from the keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const masthead = demo.locator('header[data-ground]').nth(1)
  const home = masthead.getByRole('link', { name: 'FairGarden home' })
  const nav = masthead.getByRole('navigation', { name: 'Main' })

  await home.focus()
  await expect(home).toBeFocused()
  for (const name of sections) {
    await page.keyboard.press('Tab')
    await expect(nav.getByRole('link', { name })).toBeFocused()
  }
  await page.keyboard.press('Tab')
  await expect(masthead.getByRole('button', { name: 'Donate' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(nav.getByRole('link', { name: 'Get Involved' })).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
