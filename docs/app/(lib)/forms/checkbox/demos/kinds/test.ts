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

test('kinds shows option cards and ledger rows with their values', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const cards = demo.getByRole('group', { name: 'Framing Options' })
  const ledger = demo.getByRole('group', { name: 'Order Sheet' })
  await expect(cards.getByRole('checkbox')).toHaveCount(3)
  await expect(ledger.getByRole('checkbox')).toHaveCount(3)

  const frame = cards.getByRole('checkbox', { name: /Oak Frame/ })
  const mount = cards.getByRole('checkbox', { name: /Archival Mount/ })
  const glass = cards.getByRole('checkbox', { name: /Museum Glass/ })
  await expect(frame).toBeChecked()
  await expect(mount).not.toBeChecked()
  await expect(glass).not.toBeChecked()
  await expect(glass).toHaveAttribute('aria-disabled', 'true')
  await expect(cards.getByText('Solid oak, hand finished.')).toBeVisible()
  for (const value of ['+ $75.00', '+ $20.00', '+ $40.00']) {
    await expect(cards.getByText(value, { exact: true })).toBeVisible()
  }

  const fern = ledger.getByRole('checkbox', { name: /Fern Print/ })
  const heron = ledger.getByRole('checkbox', { name: /Heron Print/ })
  const map = ledger.getByRole('checkbox', { name: /Trail Map/ })
  await expect(fern).toBeChecked()
  await expect(heron).not.toBeChecked()
  await expect(map).not.toBeChecked()
  for (const value of ['$120', '$140', '$95']) {
    await expect(ledger.getByText(value, { exact: true })).toBeVisible()
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds toggles cards and rows by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const cards = demo.getByRole('group', { name: 'Framing Options' })
  const ledger = demo.getByRole('group', { name: 'Order Sheet' })
  const frame = cards.getByRole('checkbox', { name: /Oak Frame/ })
  const mount = cards.getByRole('checkbox', { name: /Archival Mount/ })
  const glass = cards.getByRole('checkbox', { name: /Museum Glass/ })
  const fern = ledger.getByRole('checkbox', { name: /Fern Print/ })
  const heron = ledger.getByRole('checkbox', { name: /Heron Print/ })

  // The whole card is the hit target.
  await cards.getByText('+ $20.00', { exact: true }).click()
  await expect(mount).toBeChecked()
  await expect(frame).toBeChecked()

  // The disabled card ignores the pointer.
  // Forced, since Playwright refuses to click a disabled control.
  await cards.getByText('Museum Glass').click({ force: true })
  await expect(glass).not.toBeChecked()

  // Space toggles; Enter does not.
  await frame.focus()
  await page.keyboard.press('Space')
  await expect(frame).not.toBeChecked()
  await page.keyboard.press('Enter')
  await expect(frame).not.toBeChecked()

  // Tab skips the disabled card on its way to the ledger.
  await page.keyboard.press('Tab')
  await expect(mount).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(fern).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(heron).toBeFocused()
  await page.keyboard.press('Space')
  await expect(heron).toBeChecked()
  await expect(fern).toBeChecked()

  await ledger.getByText('Fern Print').click()
  await expect(fern).not.toBeChecked()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
