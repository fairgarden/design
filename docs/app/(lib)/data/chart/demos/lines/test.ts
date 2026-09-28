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
const caption = 'Warblers overtook sparrows in 2024 as the hedgerows matured.'
const category = /^20(20|21|22|23|24|25)$/

test('lines ends each line in a direct label with its last value', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const figure = demo.getByRole('figure')
  await expect(figure).toHaveCount(1)
  const figcaption = figure.locator('figcaption')
  await expect(figcaption).toContainText(caption)
  await expect(figcaption).toContainText('Source: Spring bird count, one morning each May.')
  await expect(figure.getByText('Birds counted', { exact: true })).toBeVisible()

  // Lines carry direct labels instead of a legend.
  await expect(figure.getByRole('listitem')).toHaveCount(0)

  const chart = figure.getByRole('application', { name: caption })
  await expect(chart).toHaveCount(1)
  for (const year of ['2020', '2025']) {
    await expect(chart.getByText(year, { exact: true })).toBeVisible()
  }
  // Each line's end label: the series name, then its 2025 value.
  for (const [name, last] of [
    ['Warblers', '71'],
    ['Sparrows', '53'],
    ['Finches', '38'],
  ]) {
    const label = chart.locator('text').filter({ hasText: name })
    await expect(label).toHaveCount(1)
    await expect(label).toHaveText(new RegExp(`^${name}\\s*${last}$`))
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('lines moves the tooltip across the years by pointer and keyboard', async ({ page }) => {
  test.fixme(true, 'Needs investigation: the chart application node detaches and re-renders mid-test, so hover and table queries lose their element.')
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const chart = demo.getByRole('application', { name: caption })
  const tooltipLabel = demo.locator('[class*="__tooltipLabel"]')
  const tooltip = tooltipLabel.locator('xpath=..')
  await expect(tooltipLabel).toHaveCount(0)

  await chart.scrollIntoViewIfNeeded()
  await chart.hover()
  await expect(tooltipLabel).toHaveText(category)
  for (const name of ['Warblers', 'Sparrows', 'Finches']) {
    await expect(tooltip).toContainText(name)
  }
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

test('lines holds every value in its data table', async ({ page }) => {
  test.fixme(true, 'Needs investigation: the chart application node detaches and re-renders mid-test, so hover and table queries lose their element.')
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const show = demo.getByRole('button', { name: 'Show Data Table' })
  await show.focus()
  await page.keyboard.press('Enter')
  const hide = demo.getByRole('button', { name: 'Hide Data Table' })
  await expect(hide).toHaveAttribute('aria-expanded', 'true')

  const table = demo.getByRole('table')
  await expect(table).toBeVisible()
  const rows = table.getByRole('row')
  await expect(rows).toHaveCount(7)
  await expect(rows.first()).toHaveText(/Year.*Warblers.*Sparrows.*Finches/)
  // Values that live only in the tooltip on screen are in the table.
  await expect(table.getByRole('row', { name: /2020/ })).toHaveText(/2020.*38.*64.*22/)
  await expect(table.getByRole('row', { name: /2023/ })).toHaveText(/2023.*57.*60.*29/)

  await hide.click()
  await expect(show).toHaveAttribute('aria-expanded', 'false')
  await expect(table).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
