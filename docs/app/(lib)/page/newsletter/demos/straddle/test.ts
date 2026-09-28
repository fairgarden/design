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

test('straddle shows the royal card across the night band', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  // The paper band above follows the page mode; the night band below is always dark.
  await expect(demo.locator('[data-ground="paper"]')).toHaveCount(1)
  await expect(demo.locator('[data-ground="paper"]')).not.toHaveAttribute('data-theme', /.+/)
  const night = demo.locator('[data-ground="night"]')
  await expect(night).toHaveAttribute('data-theme', 'dark')

  const card = night.getByRole('region', { name: 'Get the Latest Garden Stewardship News' })
  await expect(card).toBeVisible()
  // The card is the page's one royal field, always dark.
  const royal = card.locator('[data-ground="royal"]')
  await expect(royal).toHaveCount(1)
  await expect(royal).toHaveAttribute('data-theme', 'dark')

  await expect(card.getByRole('textbox', { name: /Email Address/ })).toHaveAttribute(
    'type',
    'email',
  )
  await expect(card.getByRole('textbox', { name: /Postcode/ })).toHaveAttribute(
    'autocomplete',
    'postal-code',
  )
  await expect(card.getByRole('button', { name: 'Sign Up' })).toBeEnabled()
  await expect(card.getByRole('link', { name: 'terms' })).toHaveAttribute(
    'href',
    'https://example.org/terms',
  )
  await expect(night.getByText('The footer continues here.')).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('straddle toggles the reading width by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const toggle = demo.getByRole('checkbox', { name: 'Reading page (align to the prose column)' })
  const card = demo.getByRole('region', { name: 'Get the Latest Garden Stewardship News' })

  await expect(toggle).toBeChecked()
  await expect(card).toHaveClass(/reading/)

  await toggle.click()
  await expect(toggle).not.toBeChecked()
  await expect(card).not.toHaveClass(/reading/)

  await toggle.focus()
  await page.keyboard.press('Space')
  await expect(toggle).toBeChecked()
  await expect(toggle).toBeFocused()
  await expect(card).toHaveClass(/reading/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('straddle validates the email on submit', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const card = demo.getByRole('region', { name: 'Get the Latest Garden Stewardship News' })
  const error = card.getByText('Enter an email address, like name@example.org.')

  await card.getByRole('button', { name: 'Sign Up' }).click()
  await expect(error).toBeVisible()

  const email = card.getByRole('textbox', { name: /Email Address/ })
  await email.fill('reader@example.org')
  await email.press('Enter')
  await expect(error).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
