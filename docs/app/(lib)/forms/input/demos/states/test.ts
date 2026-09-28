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
  const demoRoot = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demoRoot.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  // Scope to the preview surface; the code panel also carries grounds, buttons and text.
  const demo = demoRoot.locator('[class*="__preview"]').first()
  return demo
}

test('states shows each build and state', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  await expect(demo.getByLabel('Email Address')).toHaveAttribute('type', 'email')
  await expect(demo.getByLabel('Email Address')).toHaveAttribute('placeholder', 'Email address…')

  const donation = demo.getByLabel('Donation')
  await expect(donation).toHaveValue('50')
  await expect(donation).toHaveAttribute('inputmode', 'decimal')
  await expect(demo.getByText('$', { exact: true })).toBeVisible()
  await expect(demo.getByText('USD', { exact: true })).toBeVisible()

  await expect(demo.getByLabel('Find a Trail')).toHaveAttribute('placeholder', 'Trail or town…')
  await expect(demo.getByLabel('Full Name')).toHaveValue('Ada Heron')
  await expect(demo.getByLabel('Display Name')).toHaveValue('heron_watch')

  const notes = demo.getByLabel('Trip Notes')
  await expect(notes).toHaveJSProperty('tagName', 'TEXTAREA')
  await expect(notes).toHaveAttribute('rows', '3')
  await expect(demo.getByText('Up to 200 characters.')).toBeVisible()
  await expect(demo.getByText('0/200')).toBeVisible()

  const password = demo.getByLabel('Password', { exact: true })
  await expect(password).toHaveAttribute('type', 'password')
  await expect(password).toHaveValue('marsh-lantern')
  await expect(demo.getByRole('button', { name: 'Show' })).toBeVisible()

  await expect(demo.getByLabel('Newsletter')).toHaveAttribute('type', 'email')
  const signUp = demo.getByRole('button', { name: 'Sign Up' }).first()
  await expect(signUp).toBeVisible()
  await expect(signUp).toHaveAttribute('type', 'button')

  // Invalid: the control reports it and the error shows.
  const website = demo.getByLabel('Website')
  await expect(website).toHaveValue('fairgarden')
  await expect(website).toHaveAttribute('aria-invalid', 'true')
  await expect(demo.getByText('Enter a full address, starting with https://.')).toBeVisible()

  // Read-only keeps its value and focus but takes no edits.
  const memberSince = demo.getByLabel('Member Since')
  await expect(memberSince).toHaveValue('March 2019')
  await expect(memberSince).toHaveAttribute('readonly', '')
  await expect(memberSince).not.toBeEditable()

  await expect(demo.getByLabel('Referral Code')).toBeDisabled()

  // Only the invalid field is invalid.
  await expect(demo.locator('[aria-invalid="true"]')).toHaveCount(1)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states reveals and hides the password by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const password = demo.getByLabel('Password', { exact: true })
  await expect(password).toHaveAttribute('type', 'password')

  await demo.getByRole('button', { name: 'Show' }).click()
  await expect(password).toHaveAttribute('type', 'text')
  await expect(password).toHaveValue('marsh-lantern')
  const hide = demo.getByRole('button', { name: 'Hide' })
  await expect(hide).toBeFocused()
  await expect(demo.getByRole('button', { name: 'Show' })).toHaveCount(0)

  await page.keyboard.press('Enter')
  await expect(password).toHaveAttribute('type', 'password')
  await expect(demo.getByRole('button', { name: 'Show' })).toBeFocused()

  // The toggle follows its field in the tab order.
  await password.focus()
  await page.keyboard.press('Tab')
  await expect(demo.getByRole('button', { name: 'Show' })).toBeFocused()
  await page.keyboard.press('Space')
  await expect(password).toHaveAttribute('type', 'text')
  await expect(demo.getByRole('button', { name: 'Hide' })).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states counts the notes against the limit', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const notes = demo.getByLabel('Trip Notes')
  await demo.getByText('Trip Notes', { exact: true }).click()
  await expect(notes).toBeFocused()
  await page.keyboard.type('Heron')
  await expect(notes).toHaveValue('Heron')
  await expect(demo.getByText('5/200')).toBeVisible()

  // Over the soft limit the count keeps counting; the value is not cut.
  await notes.fill('a'.repeat(201))
  await expect(demo.getByText('201/200')).toBeVisible()
  await expect(notes).toHaveValue('a'.repeat(201))

  await notes.fill('')
  await expect(demo.getByText('0/200')).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states edits the open fields and skips the disabled one', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const donation = demo.getByLabel('Donation')
  await donation.click()
  await expect(donation).toBeFocused()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('75')
  await expect(donation).toHaveValue('75')

  await page.keyboard.press('Tab')
  await expect(demo.getByLabel('Find a Trail')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(demo.getByLabel('Full Name')).toBeFocused()

  // Read-only: focusable, value unchanged by typing.
  const memberSince = demo.getByLabel('Member Since')
  await memberSince.focus()
  await expect(memberSince).toBeFocused()
  await page.keyboard.type('x')
  await expect(memberSince).toHaveValue('March 2019')

  // The disabled field is never reached by the keyboard.
  await page.keyboard.press('Tab')
  await expect(demo.getByLabel('Referral Code')).not.toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
