import path from 'node:path'
import { test, expect, type Locator, type Page } from '@playwright/test'

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

/** A labelled number field: its input, its group and its step cells. */
function field(demo: Locator, name: string) {
  const input = demo.getByRole('textbox', { name, exact: true })
  const group = input.locator('xpath=ancestor::*[@role="group"][1]')
  return {
    input,
    group,
    decrease: group.getByRole('button', { name: 'Decrease' }),
    increase: group.getByRole('button', { name: 'Increase' }),
  }
}

test('states shows each kind and state', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.getByRole('textbox')).toHaveCount(6)

  // Stepper at its minimum: − is disabled, + is not; the unit follows the value.
  const tickets = field(demo, 'Tickets')
  await expect(tickets.input).toHaveValue('1')
  await expect(tickets.decrease).toBeDisabled()
  await expect(tickets.increase).toBeEnabled()
  await expect(tickets.group.getByText('adults')).toBeVisible()

  // Amount: no step cells, a prefix and a suffix.
  const donation = field(demo, 'Donation')
  await expect(donation.input).toHaveValue('50')
  await expect(donation.group.getByRole('button')).toHaveCount(0)
  await expect(donation.group.getByText('$')).toBeVisible()
  await expect(donation.group.getByText('USD')).toBeVisible()

  // Readout: circular − / + around the value, labelled by its scrub label.
  const water = field(demo, 'Water')
  await expect(water.input).toHaveValue('2.5')
  await expect(water.decrease).toBeEnabled()
  await expect(water.increase).toBeEnabled()
  await expect(water.group.getByText('litres')).toBeVisible()

  // Invalid: out of range, flagged and explained with an en dash.
  const group = field(demo, 'Group Size')
  await expect(group.input).toHaveValue('14')
  await expect(group.input).toHaveAttribute('aria-invalid', 'true')
  await expect(demo.getByText('Enter 1–12.')).toBeVisible()

  // Read-only and disabled.
  const nights = field(demo, 'Nights Booked')
  await expect(nights.input).toHaveValue('3')
  await expect(nights.input).toHaveAttribute('readonly', '')
  const guides = field(demo, 'Guides')
  await expect(guides.input).toHaveValue('2')
  await expect(guides.input).toBeDisabled()
  await expect(guides.decrease).toBeDisabled()
  await expect(guides.increase).toBeDisabled()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states steps by pointer and keyboard within the range', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const tickets = field(demo, 'Tickets')

  // Pointer: + raises the value and enables −; − brings it back to the minimum.
  await tickets.increase.click()
  await expect(tickets.input).toHaveValue('2')
  await expect(tickets.decrease).toBeEnabled()
  await tickets.decrease.click()
  await expect(tickets.input).toHaveValue('1')
  await expect(tickets.decrease).toBeDisabled()

  // Keyboard: arrows step, End and Home jump to the maximum and minimum.
  await tickets.input.focus()
  await page.keyboard.press('ArrowUp')
  await expect(tickets.input).toHaveValue('2')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await expect(tickets.input).toHaveValue('1')
  await page.keyboard.press('End')
  await expect(tickets.input).toHaveValue('12')
  await expect(tickets.increase).toBeDisabled()
  await expect(tickets.decrease).toBeEnabled()
  await page.keyboard.press('Home')
  await expect(tickets.input).toHaveValue('1')
  await expect(tickets.input).toBeFocused()

  // The readout steps by its half-litre step.
  const water = field(demo, 'Water')
  await water.increase.click()
  await expect(water.input).toHaveValue('3')
  await water.input.focus()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await expect(water.input).toHaveValue('2')

  // Typing a value commits it on blur.
  const donation = field(demo, 'Donation')
  await donation.input.fill('75')
  await donation.input.blur()
  await expect(donation.input).toHaveValue('75')

  // Read-only does not step.
  const nights = field(demo, 'Nights Booked')
  await nights.input.focus()
  await page.keyboard.press('ArrowUp')
  await expect(nights.input).toHaveValue('3')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
