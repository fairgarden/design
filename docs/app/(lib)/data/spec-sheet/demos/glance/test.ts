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

test('glance shows the identity, lead, provenance and spec grid', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  // The sheet is a section named by its H2.
  const sheet = demo.getByRole('region', { name: 'At a Glance' })
  await expect(sheet).toBeVisible()
  await expect(sheet.getByRole('heading', { level: 2, name: 'At a Glance' })).toBeVisible()

  // The identity block: portrait fallback, common name, secondary name.
  await expect(sheet.getByText('WT', { exact: true })).toBeVisible()
  await expect(sheet.getByText('Wood Thrush', { exact: true })).toBeVisible()
  await expect(sheet.getByText('Hylocichla mustelina', { exact: true })).toBeVisible()

  // The lead and the provenance line, whose book title is a Link around a cite.
  await expect(sheet.getByText(/two-voiced song at dawn and dusk/)).toBeVisible()
  const source = sheet.getByRole('link', { name: 'The Hedgerow Bird Almanac' })
  await expect(source).toBeVisible()
  await expect(source).toHaveAttribute('href', 'https://example.org/lives')
  await expect(source.locator('cite')).toHaveText('The Hedgerow Bird Almanac')

  // The six visible cells, label over value, in source order.
  await expect(sheet.getByRole('term')).toHaveText([
    'Category',
    'Conservation status',
    'Habitat',
    'Length',
    'Population',
    'Region',
  ])
  await expect(sheet.getByRole('definition')).toHaveText([
    'Thrushes',
    'Near threatened',
    'Deciduous forest',
    '18–21 cm (7–8 in)',
    '≈ 11 million',
    'Eastern North America',
  ])

  // Collapsed "More Details" rows are not exposed.
  await expect(sheet.getByRole('term', { name: 'Nest' })).toHaveCount(0)
  await expect(sheet.getByText('Cup of dead leaves and mud')).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('glance opens and closes More Details by keyboard and pointer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const sheet = demo.getByRole('region', { name: 'At a Glance' })

  const trigger = sheet.getByRole('button', { name: /(More|Fewer) Details/ })
  await expect(trigger).toHaveCount(1)
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toHaveAccessibleName('More Details')
  const nest = sheet.getByText('Cup of dead leaves and mud')
  const eggs = sheet.getByText('3–4, pale blue')
  await expect(nest).toBeHidden()

  // Keyboard: Enter opens, the label swaps, the extra rows appear.
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(trigger).toHaveAccessibleName('Fewer Details')
  await expect(nest).toBeVisible()
  await expect(eggs).toBeVisible()
  await expect(sheet.getByRole('term')).toHaveCount(8)
  await expect(trigger).toBeFocused()

  // Space closes again.
  await page.keyboard.press('Space')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toHaveAccessibleName('More Details')
  await expect(nest).toBeHidden()
  await expect(sheet.getByRole('term')).toHaveCount(6)

  // Pointer: click opens and closes.
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(nest).toBeVisible()
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(nest).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
