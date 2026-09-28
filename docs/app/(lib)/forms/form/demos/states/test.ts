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
  return { demo, pageErrors }
}

test('states shows the summary and field errors on an empty submit', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const form = demo.locator('form').first()
  const email = form.getByRole('textbox', { name: 'Email Address' })
  const city = form.getByRole('textbox', { name: /^City/ })
  const postcode = form.getByRole('textbox', { name: 'Postcode' })
  const submit = form.locator('button[type="submit"]')

  await expect(form.getByRole('textbox')).toHaveCount(3)
  await expect(email).toHaveAttribute('placeholder', 'Email address…')
  await expect(form.getByText('(optional)')).toBeVisible()
  await expect(form.getByRole('button', { name: 'Clear' })).toHaveAttribute('type', 'reset')
  await expect(submit).toHaveText('Join the Walk')
  await expect(form.getByRole('alert')).toHaveCount(0)

  // Pointer: submit with every field empty.
  await submit.click()

  const summary = form.getByRole('alert')
  await expect(summary).toBeVisible()
  await expect(summary).toBeFocused()
  await expect(summary.getByRole('heading', { name: 'Fix 2 fields to continue' })).toBeVisible()
  const links = summary.getByRole('link')
  await expect(links).toHaveCount(2)
  const emailLink = summary.getByRole('link', {
    name: 'Enter an email address, like name@example.com.',
  })
  const postcodeLink = summary.getByRole('link', { name: 'Enter a postcode.' })
  await expect(emailLink).toHaveAttribute('href', '#form-demo-email')
  await expect(postcodeLink).toHaveAttribute('href', '#form-demo-postcode')

  await expect(email).toHaveAttribute('aria-invalid', 'true')
  await expect(postcode).toHaveAttribute('aria-invalid', 'true')
  await expect(city).not.toHaveAttribute('aria-invalid', 'true')

  // Keyboard: the first link follows the summary and moves focus to its field.
  await page.keyboard.press('Tab')
  await expect(emailLink).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(email).toBeFocused()

  // Pointer: the postcode link moves focus to the postcode.
  await postcodeLink.click()
  await expect(postcode).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states submits from the keyboard and shows the busy form', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const form = demo.locator('form').first()
  const email = form.getByRole('textbox', { name: 'Email Address' })
  const postcode = form.getByRole('textbox', { name: 'Postcode' })
  const submit = form.locator('button[type="submit"]')

  // One field missing: the summary counts one.
  await email.click()
  await page.keyboard.type('name@example.com')
  await page.keyboard.press('Enter')
  const summary = form.getByRole('alert')
  await expect(summary.getByRole('heading', { name: 'Fix 1 field to continue' })).toBeVisible()
  await expect(summary.getByRole('link')).toHaveCount(1)
  await expect(postcode).toHaveAttribute('aria-invalid', 'true')

  // Fill the postcode and submit with Enter.
  await postcode.focus()
  await page.keyboard.type('AB1 2CD')
  await page.keyboard.press('Enter')

  await expect(form.getByRole('alert')).toHaveCount(0)
  await expect(form).toHaveAttribute('aria-busy', 'true')
  await expect(form).toHaveAttribute('inert', '')
  await expect(submit).toHaveText('Sending…')
  await expect(submit).toHaveAttribute('aria-busy', 'true')

  // The busy state clears on its own.
  await expect(submit).toHaveText('Join the Walk', { timeout: 5000 })
  await expect(form).not.toHaveAttribute('aria-busy', /.*/)
  await expect(form).not.toHaveAttribute('inert', /.*/)
  await expect(submit).not.toHaveAttribute('aria-busy', /.*/)
  await expect(email).toHaveValue('name@example.com')

  // Clear resets the values.
  await form.getByRole('button', { name: 'Clear' }).click()
  await expect(email).toHaveValue('')
  await expect(postcode).toHaveValue('')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
