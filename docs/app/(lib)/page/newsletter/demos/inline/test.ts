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
  return demo.locator('[class*="__preview"]').first()
}

test('inline shows the footer form on the night band', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  const band = demo.locator('[data-ground="night"][class*="ground-module__"]')
  await expect(band).toHaveCount(1)
  await expect(band).toHaveAttribute('data-theme', 'dark')

  await expect(band.getByRole('heading', { level: 2, name: 'Subscribe' })).toBeVisible()
  await expect(band.getByText('Stories from the land, once a month.')).toBeVisible()
  // The envelope is decorative.
  await expect(band.locator('svg[aria-hidden="true"]').first()).toBeAttached()

  const email = band.getByRole('textbox', { name: /Email Address/ })
  await expect(email).toHaveAttribute('type', 'email')
  await expect(email).toHaveAttribute('autocomplete', 'email')
  // The butted submit cell is named by the submit label.
  await expect(band.getByRole('button', { name: 'Subscribe' })).toBeVisible()

  const privacy = band.getByRole('link', { name: 'Privacy' })
  await expect(privacy).toHaveAttribute('href', 'https://example.org/privacy')
  await expect(band.getByText('We never share your address.')).toBeVisible()
  await expect(band.getByRole('status')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('inline rejects an empty submit, then sends and moves focus to success', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const email = demo.getByRole('textbox', { name: /Email Address/ })
  const submit = demo.getByRole('button', { name: 'Subscribe' })

  // Pointer: an empty submit shows the field error and sends nothing.
  await submit.click()
  await expect(demo.getByText('Enter an email address, like name@example.org.')).toBeVisible()
  await expect(demo.getByRole('button', { name: 'Sending…' })).toHaveCount(0)

  // Keyboard: a valid address submitted with Enter.
  await email.fill('reader@example.org')
  await email.press('Enter')

  // While busy the form is inert and the cell reads "Sending…".
  const sending = demo.getByRole('button', { name: 'Sending…' })
  await expect(sending).toHaveAttribute('aria-busy', 'true')
  await expect(demo.locator('form')).toHaveAttribute('aria-busy', 'true')

  // Success replaces the form and takes focus.
  const status = demo.getByRole('status')
  await expect(status).toHaveText(/Subscribed\s+Check your inbox to confirm\./)
  await expect(status).toBeFocused()
  await expect(demo.locator('form')).toHaveCount(0)
  await expect(demo.getByRole('textbox', { name: /Email Address/ })).toHaveCount(0)
  await expect(demo.getByRole('heading', { level: 2, name: 'Subscribe' })).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
