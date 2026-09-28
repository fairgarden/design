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

  return {
    demo,
    email: demo.getByRole('textbox', { name: 'Email Address', exact: true }),
    phone: demo.getByRole('textbox', { name: 'Phone Number (optional)', exact: true }),
    postcode: demo.getByRole('textbox', { name: 'Postcode', exact: true }),
    member: demo.getByRole('textbox', { name: 'Member Number', exact: true }),
  }
}

test('states shows rest, optional, invalid and disabled fields', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { demo, email, phone, postcode, member } = await openDemo(page)

  // Four fields, each control named by its label.
  await expect(demo.getByRole('textbox')).toHaveCount(4)

  // Rest: an email box with its placeholder, described by its helper text.
  await expect(email).toHaveAttribute('type', 'email')
  await expect(email).toHaveAttribute('placeholder', 'Email address…')
  await expect(email).toBeEditable()
  await expect(email).not.toHaveAttribute('aria-invalid', 'true')
  await expect(email).toHaveAccessibleDescription('We send one trail report a month.')

  // Optional: the marker sits inside the label, in words, never an asterisk.
  await expect(phone).toHaveAttribute('type', 'tel')
  await expect(phone).toBeEditable()
  await expect(demo.getByText('(optional)', { exact: true })).toBeVisible()
  await expect(demo.getByText('*')).toHaveCount(0)

  // Invalid: the control is marked invalid and the error says how to fix it.
  const error = demo.getByText('Postcode is too short. Enter all 5 digits.', { exact: true })
  await expect(postcode).toHaveValue('12')
  await expect(postcode).toHaveAttribute('aria-invalid', 'true')
  await expect(error).toBeVisible()
  await expect(postcode).toHaveAccessibleDescription(/Postcode is too short\. Enter all 5 digits\./)
  // The error takes the danger (red) scale, with the ◆ glyph hidden from assistive technology.
  const errorPart = demo.locator('[class*="secondaryRed"]', { hasText: 'Postcode is too short' })
  await expect(errorPart).toHaveCount(1)
  await expect(errorPart.locator('svg[aria-hidden="true"]')).toHaveCount(1)
  await expect(demo.locator('[data-invalid]', { has: page.getByRole('textbox', { name: 'Postcode', exact: true }) }).first()).toBeVisible()

  // Disabled: the value stays readable but can't be edited; the field is marked disabled.
  await expect(member).toHaveValue('FG-2041')
  await expect(member).toBeDisabled()
  await expect(member).toHaveAccessibleDescription('Assigned when your membership starts.')
  await expect(demo.locator('[data-disabled]', { has: page.getByRole('textbox', { name: 'Member Number', exact: true }) }).first()).toBeVisible()

  // Only the invalid field shows an error message.
  await expect(demo.getByText(/Enter all 5 digits/)).toHaveCount(1)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states focuses by label and tabs past the disabled field', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { demo, email, phone, postcode, member } = await openDemo(page)

  // Pointer: clicking a label focuses its control, and typing fills it.
  await demo.getByText('Email Address', { exact: true }).click()
  await expect(email).toBeFocused()
  await page.keyboard.type('heron@example.com')
  await expect(email).toHaveValue('heron@example.com')

  // Keyboard: Tab walks the enabled fields in order.
  await page.keyboard.press('Tab')
  await expect(phone).toBeFocused()
  await page.keyboard.type('555 0100')
  await expect(phone).toHaveValue('555 0100')

  await page.keyboard.press('Tab')
  await expect(postcode).toBeFocused()
  await page.keyboard.press('End')
  await page.keyboard.type('345')
  await expect(postcode).toHaveValue('12345')

  // The disabled field is skipped, and clicking its label doesn't focus it.
  await page.keyboard.press('Tab')
  await expect(member).not.toBeFocused()
  await demo.getByText('Member Number', { exact: true }).click({ force: true })
  await expect(member).not.toBeFocused()
  await expect(member).toHaveValue('FG-2041')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
