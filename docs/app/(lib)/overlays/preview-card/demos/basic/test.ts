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
  const demo = demoRoot.locator('[class*="__preview"]').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demoRoot.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return demo
}

/** The card renders in a portal outside the demo, as a nested `white` scope. */
function card(page: Page) {
  return page
    .locator('[data-ground="white"]')
    .filter({ has: page.getByRole('img', { name: 'Map sketch of the Ridge Connector' }) })
}

test('basic renders the link in its sentence with the card closed', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.getByText(/From the saddle, the loop meets the/)).toBeVisible()

  // The trigger is a real link, so it navigates and prints like any link.
  const trigger = demo.getByRole('link', { name: 'Ridge Connector' })
  await expect(trigger).toHaveCount(1)
  await expect(trigger).toHaveAttribute('href', 'https://example.org/trails/ridge-connector')

  // Nothing of the card is on the page until it is asked for.
  await expect(card(page)).toHaveCount(0)
  await expect(page.getByText('A 2.1 km link from the saddle to the reservoir dam.', { exact: true })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('basic opens the card on hover and closes it when the pointer leaves', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const trigger = demo.getByRole('link', { name: 'Ridge Connector' })
  await trigger.hover()

  // Opens after the 600 ms hover delay.
  const popup = card(page)
  await expect(popup).toBeVisible()
  await expect(popup).toHaveAttribute('data-ground', 'white')
  await expect(popup).toHaveAttribute('data-scheme', 'page')
  await expect(popup.getByRole('img', { name: 'Map sketch of the Ridge Connector' })).toBeVisible()
  await expect(popup.getByText('Ridge Connector', { exact: true })).toBeVisible()
  await expect(popup.getByText('A 2.1 km link from the saddle to the reservoir dam.')).toBeVisible()
  await expect(popup.getByText('example.org', { exact: true })).toBeVisible()
  // A preview card holds at most one link, and this one holds none.
  await expect(popup.getByRole('link')).toHaveCount(0)
  // The card lives outside the demo, in its portal.
  await expect(demo.getByText('A 2.1 km link from the saddle to the reservoir dam.')).toHaveCount(0)

  // Moving well away from the link and the card closes it after the 300 ms close delay.
  await page.mouse.move(1, 1)
  await expect(card(page)).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('basic dismisses the open card with Escape', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await demo.getByRole('link', { name: 'Ridge Connector' }).hover()
  await expect(card(page)).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(card(page)).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('basic keeps the link reachable by keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const trigger = demo.getByRole('link', { name: 'Ridge Connector' })

  // The card is never the only route to its information: the link itself takes focus.
  await trigger.focus()
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('href', /ridge-connector$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
