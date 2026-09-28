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

test('kinds nests a face and a field in a band, with a light island in the field', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  // Ground renders a section; the Link roots inside write data-ground too.
  await expect(demo.locator('section[data-ground]')).toHaveCount(5)

  // The tide band follows the page mode, so it writes no data-theme.
  const tide = demo.locator('section[data-ground="tide"]')
  await expect(tide).toHaveCount(1)
  await expect(tide).toHaveAttribute('data-tone', 'tinted')
  await expect(tide).toHaveAttribute('data-scheme', 'page')
  await expect(tide).not.toHaveAttribute('data-theme', /.*/)
  await expect(tide.getByText('Band: tide')).toBeVisible()

  // The white face on the page ground follows the mode with the page.
  const face = tide.locator(':scope > div > section[data-ground="white"]')
  await expect(face).toHaveCount(1)
  await expect(face).toHaveAttribute('data-scheme', 'page')
  await expect(face).not.toHaveAttribute('data-theme', /.*/)
  await expect(face.getByText('Face on the page ground')).toBeVisible()
  await expect(face.getByRole('link', { name: 'Field notes' })).toHaveAttribute('href', '#kinds')

  // Royal, tide's companion field, is always dark.
  const royal = tide.locator('section[data-ground="royal"]')
  await expect(royal).toHaveCount(1)
  await expect(royal).toHaveAttribute('data-tone', 'solid-dark')
  await expect(royal).toHaveAttribute('data-scheme', 'dark')
  await expect(royal).toHaveAttribute('data-theme', 'dark')
  await expect(royal.getByText("Field: royal, tide's companion")).toBeVisible()

  // A page ground inside a fixed scope is a light island.
  const island = royal.locator('section[data-ground="white"]')
  await expect(island).toHaveCount(1)
  await expect(island).toHaveAttribute('data-scheme', 'light')
  await expect(island).toHaveAttribute('data-theme', 'light')
  await expect(island.getByText('Light island')).toBeVisible()
  await expect(island.getByRole('link', { name: 'Field notes' })).toBeVisible()

  // The night band is always dark and sits beside the tide band, not inside it.
  const night = demo.locator('section[data-ground="night"]')
  await expect(night).toHaveCount(1)
  await expect(tide.locator('section[data-ground="night"]')).toHaveCount(0)
  await expect(night).toHaveAttribute('data-tone', 'dark-base')
  await expect(night).toHaveAttribute('data-scheme', 'dark')
  await expect(night).toHaveAttribute('data-theme', 'dark')
  await expect(night.getByText('Band: night')).toBeVisible()
  await expect(night.getByRole('link', { name: 'Footer and media hero only' })).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds keeps the island light and the follows-mode scopes unthemed in dark mode', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.emulateMedia({ colorScheme: 'dark' })
  const demo = await openDemo(page)

  const themes = await demo.locator('section[data-ground]').evaluateAll((nodes) =>
    nodes.map((node) => [node.getAttribute('data-ground'), node.getAttribute('data-theme')]),
  )
  expect(themes).toEqual([
    ['tide', null],
    ['white', null],
    ['royal', 'dark'],
    ['white', 'light'],
    ['night', 'dark'],
  ])

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds moves through its links from the keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const links = demo.locator('section[data-ground]').getByRole('link')
  await expect(links).toHaveCount(3)

  await links.first().focus()
  await expect(links.first()).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(demo.locator('section[data-ground="royal"]').getByRole('link', { name: 'Field notes' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(demo.getByRole('link', { name: 'Footer and media hero only' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(demo.locator('section[data-ground="royal"]').getByRole('link', { name: 'Field notes' })).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
