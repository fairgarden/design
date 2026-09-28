import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

async function open(page: import('@playwright/test').Page) {
  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return demo
}

test('tiers shows three plans with the recommended one first and chosen', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page)

  const group = demo.getByRole('radiogroup', { name: 'Membership level' })
  await expect(group).toBeVisible()

  const names = demo.getByRole('heading', { level: 3 })
  await expect(names).toHaveText(['Steward', 'Member', 'Patron'])

  const tiers = group.getByRole('listitem').filter({ has: page.getByRole('heading', { level: 3 }) })
  await expect(tiers).toHaveCount(3)

  // Only the recommended tier carries the badge.
  await expect(demo.getByText('Recommended', { exact: true })).toHaveCount(1)
  await expect(tiers.nth(0).getByText('Recommended', { exact: true })).toBeVisible()

  // Each price is a `data` element with its machine-readable value and a period.
  for (const [index, amount] of ['120', '45', '500'].entries()) {
    const price = tiers.nth(index).locator(`data[value="${amount}"]`)
    await expect(price).toHaveText(new RegExp(`^\\$${amount}\\s+/ year$`))
  }

  // Features are lists.
  await expect(tiers.nth(0).getByRole('listitem')).toHaveText([
    'Everything in Member',
    'Two guided walks',
    'Crew-day priority',
  ])
  await expect(tiers.nth(1).getByRole('listitem')).toHaveText(['Free parking', 'Quarterly newsletter'])

  // The default choice, and the sold-out plan disabled and saying so.
  const steward = group.getByRole('radio', { name: 'Choose Steward' })
  const member = group.getByRole('radio', { name: 'Choose Member' })
  const patron = group.getByRole('radio', { name: 'Choose Patron' })
  await expect(group.getByRole('radio')).toHaveCount(3)
  await expect(steward).toBeChecked()
  await expect(member).not.toBeChecked()
  await expect(patron).toBeDisabled()
  await expect(tiers.nth(2).getByText('Unavailable', { exact: true })).toBeVisible()
  await expect(tiers.nth(2).getByText('Sold out for this season.')).toBeVisible()

  await expect(demo.getByText('Prices as of 1 Sep 2026 (hemlockravine.org/join)')).toBeVisible()
  await expect(demo.getByRole('button', { name: 'Join Now' })).toBeEnabled()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('tiers chooses a plan by keyboard and pointer, never the unavailable one', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page)

  const group = demo.getByRole('radiogroup', { name: 'Membership level' })
  const steward = group.getByRole('radio', { name: 'Choose Steward' })
  const member = group.getByRole('radio', { name: 'Choose Member' })
  const patron = group.getByRole('radio', { name: 'Choose Patron' })

  // Keyboard: arrows move the choice within the group.
  await steward.focus()
  await expect(steward).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(member).toBeFocused()
  await expect(member).toBeChecked()
  await expect(steward).not.toBeChecked()
  await page.keyboard.press('ArrowUp')
  await expect(steward).toBeFocused()
  await expect(steward).toBeChecked()

  // Pointer: the label row is the hit area.
  await group.getByText('Choose Member', { exact: true }).click()
  await expect(member).toBeChecked()
  await expect(steward).not.toBeChecked()

  // The disabled plan cannot be chosen.
  await group.getByText('Choose Patron', { exact: true }).click({ force: true })
  await expect(patron).not.toBeChecked()
  await expect(member).toBeChecked()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('tiers matrix is a named, focusable table of seedling prices', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page)

  // The scroll wrapper is a focusable region so keyboards can scroll a wide matrix.
  const region = demo.getByRole('region', { name: 'Seedling prices' })
  await expect(region).toHaveAttribute('tabindex', '0')
  await region.focus()
  await expect(region).toBeFocused()

  const table = region.getByRole('table')
  await expect(table.getByRole('columnheader')).toHaveText(['Species', 'Retail', 'Wholesale'])
  await expect(table.getByRole('rowheader')).toHaveText(['Pawpaw', 'Serviceberry', 'Minimum order'])
  await expect(table.getByRole('row')).toHaveCount(4)

  const row = (name: string) => table.getByRole('row').filter({ has: page.getByRole('rowheader', { name }) })
  await expect(row('Pawpaw').getByRole('cell')).toHaveCount(2)
  await expect(row('Pawpaw').getByRole('cell').nth(0)).toContainText('$18')
  await expect(row('Pawpaw').getByRole('cell').nth(1)).toContainText('$11')
  await expect(row('Serviceberry').getByRole('cell').nth(0)).toContainText('$14')
  await expect(row('Serviceberry').getByRole('cell').nth(1)).toContainText('$9')
  await expect(row('Minimum order').getByRole('cell').nth(1)).toContainText('25')
  // Minimum order sits in the total row (tfoot).
  await expect(table.locator('tfoot').getByRole('rowheader')).toHaveText('Minimum order')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
