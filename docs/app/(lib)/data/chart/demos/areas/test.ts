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
const caption = 'Yard waste drives the autumn rise; kitchen scraps grow steadily.'
const category = /^(May|Jun|Jul|Aug|Sep|Oct)$/

test('areas stacks named bands with no legend', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const figure = demo.getByRole('figure')
  await expect(figure).toHaveCount(1)
  await expect(figure.locator('figcaption')).toContainText(caption)
  await expect(figure.getByText('Compost collected (kg)', { exact: true })).toBeVisible()

  // Areas name their bands inside themselves: no legend.
  await expect(figure.getByRole('listitem')).toHaveCount(0)

  const chart = figure.getByRole('application', { name: caption })
  await expect(chart).toHaveCount(1)
  for (const month of ['May', 'Oct']) {
    await expect(chart.getByText(month, { exact: true })).toBeVisible()
  }
  // The two wide bands are named inside themselves at the last point.
  for (const name of ['Kitchen scraps', 'Yard waste']) {
    await expect(chart.locator('text').filter({ hasText: name })).toHaveCount(1)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('areas shows formatted values in the tooltip by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const chart = demo.getByRole('application', { name: caption })
  const tooltipLabel = demo.locator('[class*="__tooltipLabel"]')
  const tooltip = tooltipLabel.locator('xpath=..')
  await expect(tooltipLabel).toHaveCount(0)

  // The chart redraws its svg as it measures: hover() retries until it is stable and on screen.
  await chart.hover()
  await expect(tooltipLabel).toHaveText(category)
  for (const name of ['Kitchen scraps', 'Yard waste', 'Other']) {
    await expect(tooltip).toContainText(name)
  }
  // Values carry the unit through formatValue.
  await expect(tooltip).toContainText(/\d+ kg/)
  await page.mouse.move(0, 0)
  await expect(tooltipLabel).toHaveCount(0)

  await chart.focus()
  await expect(chart).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(tooltipLabel).toHaveText(category)
  const before = (await tooltipLabel.textContent())!.trim()
  await page.keyboard.press('ArrowRight')
  await expect(tooltipLabel).not.toHaveText(before)
  await page.keyboard.press('ArrowLeft')
  await expect(tooltipLabel).toHaveText(before)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('areas holds every value, with its unit, in its data table', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await demo.getByRole('button', { name: 'Show Data Table' }).click()
  const hide = demo.getByRole('button', { name: 'Hide Data Table' })
  await expect(hide).toHaveAttribute('aria-expanded', 'true')

  const table = demo.getByRole('table')
  await expect(table).toBeVisible()
  await expect(table.locator('caption')).toContainText(caption)
  const rows = table.getByRole('row')
  await expect(rows).toHaveCount(7)
  await expect(rows.first()).toHaveText(/Month.*Kitchen scraps.*Yard waste.*Other/)
  await expect(table.getByRole('row', { name: /Oct/ })).toHaveText(/Oct.*175 kg.*380 kg.*70 kg/)

  await hide.focus()
  await page.keyboard.press('Enter')
  await expect(demo.getByRole('button', { name: 'Show Data Table' })).toBeFocused()
  await expect(table).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
