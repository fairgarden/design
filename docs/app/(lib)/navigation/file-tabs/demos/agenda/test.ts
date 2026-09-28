import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

/** Opens the demo and waits until it has finished loading; returns the demo container. */
async function open(page: Page, hash = '') {
  await page.goto(route + hash)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The code's tabs are disabled until then, so wait for them before interacting.
  const files = demo.getByRole('tablist', { name: 'Files' })
  await expect(files).toBeVisible({ timeout: 15000 })
  await expect(files.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]')).toHaveCount(0, {
    timeout: 15000,
  })
  return demo
}

test('agenda selects and focuses an attachment from a cover link', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page)

  const tablist = demo.getByRole('tablist', { name: 'Attachments' })
  const tabs = tablist.getByRole('tab')
  await expect(tabs).toHaveText(["Treasurer's report", 'Plot waitlist', 'Tool shed quote', 'Spring planting plan'])
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
  await expect(tablist.getByRole('tab', { name: 'Tool shed quote' })).toHaveAttribute(
    'href',
    '#committee-meeting:tool-shed-quote',
  )
  await expect(demo.getByRole('heading', { name: 'Garden committee, March meeting' })).toBeVisible()

  // A plain click on a cover link selects that tab and moves focus to it, leaving the hash alone.
  await demo.getByRole('link', { name: 'Tool shed quote' }).click()
  const quote = tablist.getByRole('tab', { name: 'Tool shed quote' })
  await expect(quote).toHaveAttribute('aria-selected', 'true')
  await expect(quote).toBeFocused()
  await expect(demo.getByRole('heading', { name: 'Tool shed quote' })).toBeVisible()
  await expect(demo.getByText(/cedar lean-to/)).toBeVisible()
  expect(new URL(page.url()).hash).toBe('')

  // From the focused tab, the arrows move focus and Enter chooses.
  await page.keyboard.press('ArrowRight')
  const plan = tablist.getByRole('tab', { name: 'Spring planting plan' })
  await expect(plan).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(plan).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByRole('heading', { name: 'Spring planting plan' })).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('agenda switches its cover to the minutes, whose links select attachments too', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page)

  const cover = demo.getByRole('group', { name: 'Cover document' })
  const agenda = cover.getByRole('button', { name: 'Agenda' })
  const minutes = cover.getByRole('button', { name: 'Minutes' })
  await expect(agenda).toHaveAttribute('aria-pressed', 'true')
  await expect(minutes).toHaveAttribute('aria-pressed', 'false')

  await minutes.click()
  await expect(minutes).toHaveAttribute('aria-pressed', 'true')
  await expect(agenda).toHaveAttribute('aria-pressed', 'false')
  await expect(demo.getByRole('heading', { name: 'Garden committee, March minutes' })).toBeVisible()

  await demo.getByRole('link', { name: 'waitlist', exact: true }).click()
  const waitlist = demo.getByRole('tablist', { name: 'Attachments' }).getByRole('tab', { name: 'Plot waitlist' })
  await expect(waitlist).toHaveAttribute('aria-selected', 'true')
  await expect(waitlist).toBeFocused()
  await expect(demo.getByText(/Four households wait for a plot/)).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('agenda selects the attachment named by the hash on load', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page, '#committee-meeting:spring-planting-plan')

  const tablist = demo.getByRole('tablist', { name: 'Attachments' })
  await expect(tablist.getByRole('tab', { name: 'Spring planting plan' })).toHaveAttribute('aria-selected', 'true')
  await expect(tablist.getByRole('tab', { name: "Treasurer's report" })).toHaveAttribute('aria-selected', 'false')
  await expect(demo.getByRole('heading', { name: 'Spring planting plan' })).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
