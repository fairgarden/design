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
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return { demo: demo.locator('[class*="__preview"]').first(), pageErrors }
}

test('illustrated sets the lockup and sticker in the leaf field', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const hero = demo.locator('header')
  await expect(hero).toHaveCount(1)
  await expect(hero).toHaveAttribute('data-ground', 'paper')

  // The Display Lockup is real text in the one h1.
  const title = demo.getByRole('heading', { level: 1 })
  await expect(title).toHaveCount(1)
  await expect(title).toHaveText('Grown right here')
  await expect(title.getByText('Grown right', { exact: true })).toBeVisible()
  await expect(title.getByText('here', { exact: true })).toBeVisible()

  // The campaign field is a leaf Ground inside the band, fixed to light mode.
  const field = hero.locator('[data-ground="leaf"][class*="ground-module__"]')
  await expect(field).toHaveCount(1)
  await expect(field).toHaveAttribute('data-theme', 'light')
  await expect(field).toContainText('Grown right here')
  await expect(field.getByRole('img', { name: 'A sprouting seed' })).toBeVisible()
  await expect(
    field.getByText('Vegetables from plots within a mile, sold at the corner stand since 2011.'),
  ).toBeVisible()
  await expect(hero.getByRole('button')).toHaveCount(1)
  await expect(field.getByRole('button', { name: 'Order Now' })).toBeEnabled()

  // One rail link is ever in the accessibility tree (the inline copy or the corner label).
  const rail = hero.getByRole('link', { name: /Find a stand/ })
  await expect(rail).toHaveCount(1)
  await expect(rail).toHaveAttribute('href', '#illustrated')

  // The exit seam on paper carries the rail's decorative trail.
  const seam = demo.locator('header + [data-ground="paper"]')
  await expect(seam).toHaveCount(1)
  await expect(seam.locator('svg[aria-hidden="true"]')).toHaveCount(1)
  await expect(demo.getByText('crosses into this band.', { exact: false })).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('illustrated follows the rail by keyboard and pointer', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)
  const rail = demo.locator('header').getByRole('link', { name: /Find a stand/ })

  await rail.focus()
  await expect(rail).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#illustrated$/)

  await page.goto(route)
  const reloaded = page.locator('.demo').first()
  await expect(
    reloaded.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  await reloaded.locator('header').getByRole('link', { name: /Find a stand/ }).click()
  await expect(page).toHaveURL(/#illustrated$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
