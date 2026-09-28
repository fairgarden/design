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

test('split sets the text beside the captioned photo on the night band', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const hero = demo.locator('header')
  await expect(hero).toHaveCount(1)
  await expect(hero).toHaveAttribute('data-ground', 'night')
  await expect(hero).toHaveAttribute('data-theme', 'dark')

  // Wayfinding: the Breadcrumb with its parent link and the current page.
  const breadcrumb = hero.getByRole('navigation', { name: 'Breadcrumb' })
  await expect(breadcrumb).toBeVisible()
  await expect(breadcrumb.getByRole('link', { name: 'Programs' }).first()).toHaveAttribute(
    'href',
    '#split',
  )
  await expect(breadcrumb.locator('[aria-current="page"]').first()).toHaveText('Farmland')

  const title = demo.getByRole('heading', { level: 1 })
  await expect(title).toHaveCount(1)
  await expect(title).toHaveText('Keeping farms in farming')
  await expect(
    hero.getByText('Easements that let a family keep working the land, and keep it open for good.'),
  ).toBeVisible()
  await expect(hero.getByRole('button', { name: 'Talk to Us' })).toBeEnabled()

  // The photo is its own figure, never under the text, with its caption and media Button.
  const figure = hero.getByRole('figure')
  await expect(figure).toHaveCount(1)
  await expect(figure.getByRole('heading')).toHaveCount(0)
  await expect(
    figure.getByRole('img', { name: 'A family walking a hayfield at the edge of a wood' }),
  ).toBeVisible()
  await expect(figure.locator('figcaption')).toHaveText('The Okafor farm, Wisconsin. Photo: J. Lee')
  const enlarge = figure.getByRole('button', { name: 'Enlarge the Photo' })
  await expect(enlarge).toBeEnabled()
  // The media Button sits in a night face.
  await expect(figure.locator('[data-ground="night"][class*="ground-module__"]')).toContainText('Enlarge the Photo')

  // The rail, and its trail in the paper seam below.
  const rail = hero.getByRole('link', { name: /Explore the garden/ })
  await expect(rail).toHaveCount(1)
  await expect(rail).toHaveAttribute('href', '#split')
  const seam = demo.locator('header + [data-ground="paper"]')
  await expect(seam).toHaveCount(1)
  await expect(seam.locator('svg[aria-hidden="true"]')).toHaveCount(1)
  await expect(demo.getByText('The trail lands in this band, in its accent.')).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('split reaches its controls by keyboard and follows the rail by pointer', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)
  const hero = demo.locator('header')

  const action = hero.getByRole('button', { name: 'Talk to Us' })
  await action.focus()
  await expect(action).toBeFocused()

  const enlarge = hero.getByRole('button', { name: 'Enlarge the Photo' })
  await enlarge.focus()
  await expect(enlarge).toBeFocused()

  const rail = hero.getByRole('link', { name: /Explore the garden/ })
  await rail.focus()
  await expect(rail).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#split$/)

  await hero.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Programs' }).first().click()
  await expect(page).toHaveURL(/#split$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
