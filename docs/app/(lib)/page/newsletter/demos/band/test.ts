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

test('band shows two bands and a ruled row, each a named section', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  await expect(demo.getByRole('heading', { level: 2 })).toHaveText([
    'Field Notes, Every Friday',
    'Join the Spring Planting',
    'Letters from the Orchard',
  ])

  // The page-ground band: no campaign field, so it follows the page mode.
  const notes = demo.getByRole('region', { name: 'Field Notes, Every Friday' })
  await expect(notes).toBeVisible()
  await expect(
    notes.getByText('One story, one walk and one thing to do this weekend.'),
  ).toBeVisible()
  await expect(notes.getByRole('textbox', { name: /Email Address/ })).toHaveAttribute(
    'type',
    'email',
  )
  await expect(notes.getByRole('button', { name: 'Subscribe' })).toBeVisible()
  await expect(notes.locator('[data-ground]')).toHaveCount(0)

  // The leaf campaign field: an always-light field card with its own submit label.
  const planting = demo.getByRole('region', { name: 'Join the Spring Planting' })
  const leaf = planting.locator('[data-ground="leaf"]')
  await expect(leaf).toHaveCount(1)
  await expect(leaf).toHaveAttribute('data-theme', 'light')
  await expect(planting.getByText("We'll send dates and places near you.")).toBeVisible()
  await expect(planting.getByRole('button', { name: 'Count Me In' })).toBeVisible()
  await expect(planting.getByRole('button', { name: 'Subscribe' })).toHaveCount(0)

  // The ruled row reports a server failure above its submit.
  const letters = demo.getByRole('region', { name: 'Letters from the Orchard' })
  const status = letters.getByRole('status')
  await expect(status).toHaveText(/Warning:\s*We couldn't reach the server\. Try again in a minute\./)
  await expect(letters.getByRole('textbox', { name: /Email Address/ })).toBeVisible()
  await expect(letters.getByRole('button', { name: 'Subscribe' })).toBeEnabled()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('band validates the email on submit, by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const notes = demo.getByRole('region', { name: 'Field Notes, Every Friday' })
  const email = notes.getByRole('textbox', { name: /Email Address/ })
  const error = notes.getByText('Enter an email address, like name@example.org.')

  await expect(error).toHaveCount(0)

  // An empty submit shows the field error.
  await notes.getByRole('button', { name: 'Subscribe' }).click()
  await expect(error).toBeVisible()

  // A valid address submitted from the keyboard clears it; the form stays in place.
  await email.fill('reader@example.org')
  await email.press('Enter')
  await expect(error).toHaveCount(0)
  await expect(email).toHaveValue('reader@example.org')
  await expect(notes.getByRole('status')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
