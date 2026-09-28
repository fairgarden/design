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

const caption = 'Parkside logged the most volunteer hours in both seasons.'

test('bars shows a labelled figure with a legend and direct labels', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const figure = demo.getByRole('figure')
  await expect(figure).toHaveCount(1)

  // The caption carries the figure label, the caption text and the source line.
  const figcaption = figure.locator('figcaption')
  await expect(figcaption).toContainText('Fig. 1')
  await expect(figcaption).toContainText(caption)
  await expect(figcaption).toContainText('Source: FairGarden sign-in sheets, 2026.')
  await expect(figure.getByText('Volunteer hours', { exact: true })).toBeVisible()

  // Two grouped series need the custom legend: one entry per series, in order.
  const legendItems = figure.getByRole('listitem')
  await expect(legendItems).toHaveCount(2)
  await expect(legendItems).toHaveText(['Spring', 'Fall'])

  // The screen chart is Recharts' focusable accessibility layer, named by the caption.
  const chart = figure.getByRole('application', { name: caption })
  await expect(chart).toHaveCount(1)
  await expect(chart).toHaveAttribute('tabindex', '0')
  for (const garden of ['Parkside', 'Riverbend', 'Hillcrest', 'Orchard Row', 'Mill Pond']) {
    await expect(chart.getByText(garden, { exact: true })).toBeVisible()
  }
  // Each value sits at its bar's end.
  for (const value of ['412', '356', '94', '118']) {
    await expect(chart.getByText(value, { exact: true })).toBeVisible()
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('bars moves the tooltip across the categories by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const chart = demo.getByRole('application', { name: caption })
  const category = /^(Parkside|Riverbend|Hillcrest|Orchard Row|Mill Pond)$/
  const tooltipLabel = demo.locator('[class*="__tooltipLabel"]')
  // The tooltip panel: the label's parent, repeating the row's values under the series names.
  const tooltip = tooltipLabel.locator('xpath=..')
  await expect(tooltipLabel).toHaveCount(0)

  // Pointer: the tooltip shows the category under it and leaves with the pointer.
  const box = (await chart.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await expect(tooltipLabel).toHaveText(category)
  await expect(tooltip).toContainText('Spring')
  await expect(tooltip).toContainText('Fall')
  await page.mouse.move(0, 0)
  await expect(tooltipLabel).toHaveCount(0)

  // Keyboard: focus the chart, then the arrow keys step through the categories.
  await chart.focus()
  await expect(chart).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(tooltipLabel).toHaveText(category)
  const before = (await tooltipLabel.textContent())!.trim()
  await page.keyboard.press('ArrowRight')
  await expect(tooltipLabel).toHaveText(category)
  await expect(tooltipLabel).not.toHaveText(before)
  await page.keyboard.press('ArrowLeft')
  await expect(tooltipLabel).toHaveText(before)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('bars opens and closes its data table by keyboard and pointer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const show = demo.getByRole('button', { name: 'Show Data Table' })
  await expect(show).toHaveAttribute('aria-expanded', 'false')
  await expect(demo.getByRole('table')).toBeHidden()

  await show.focus()
  await page.keyboard.press('Enter')
  const hide = demo.getByRole('button', { name: 'Hide Data Table' })
  await expect(hide).toHaveAttribute('aria-expanded', 'true')
  await expect(hide).toBeFocused()

  const table = demo.getByRole('table')
  await expect(table).toBeVisible()
  await expect(table.locator('caption')).toContainText(caption)
  const rows = table.getByRole('row')
  await expect(rows).toHaveCount(6)
  await expect(rows.first()).toHaveText(/Garden.*Spring.*Fall/)
  await expect(table.getByRole('row', { name: /Parkside/ })).toHaveText(/Parkside.*412.*356/)
  await expect(table.getByRole('row', { name: /Mill Pond/ })).toHaveText(/Mill Pond.*94.*118/)

  await hide.click()
  await expect(show).toHaveAttribute('aria-expanded', 'false')
  await expect(table).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
