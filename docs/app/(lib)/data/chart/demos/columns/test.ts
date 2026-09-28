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
const caption = 'Visits peaked in June and eased through the late summer.'
const category = /^(Apr|May|Jun|Jul|Aug|Sep)$/

test('columns draws horizontal bars below 1024 px, labelled and captioned', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  // A phone-width viewport: the chart's container is well under the 1024 px column threshold.
  await page.setViewportSize({ width: 390, height: 1400 })

  const demo = await openDemo(page)
  const figure = demo.getByRole('figure')
  await expect(figure).toHaveCount(1)
  const figcaption = figure.locator('figcaption')
  await expect(figcaption).toContainText(caption)
  await expect(figcaption).toContainText('Source: Gate counters, April to September 2026.')
  await expect(figure.getByText('Visitors', { exact: true })).toBeVisible()

  // One series: no legend.
  await expect(figure.getByRole('listitem')).toHaveCount(0)

  // Only the bars copy is on screen: the column copy waits for its container threshold.
  const chart = figure.getByRole('application', { name: caption }).locator('visible=true')
  await expect(chart).toHaveCount(1)
  const plotColumns = figure.locator('[class*="__plotColumns"]')
  await expect(plotColumns).toHaveCount(1)
  await expect(plotColumns).toBeHidden()
  await expect(figure.locator('[class*="__plotBars"]')).toBeVisible()

  for (const month of ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']) {
    await expect(chart.getByText(month, { exact: true })).toBeVisible()
  }
  for (const value of ['1,840', '3,410', '2,215']) {
    await expect(chart.getByText(value, { exact: true })).toBeVisible()
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('columns moves the tooltip across the months by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const chart = demo.getByRole('application', { name: caption }).locator('visible=true')
  await expect(chart).toHaveCount(1)
  const tooltipLabel = demo.locator('[class*="__tooltipLabel"]')
  const tooltip = tooltipLabel.locator('xpath=..')
  await expect(tooltipLabel).toHaveCount(0)

  const box = (await chart.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await expect(tooltipLabel).toHaveText(category)
  await expect(tooltip).toContainText('Visitors')
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

test('columns opens and closes its data table by keyboard and pointer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const show = demo.getByRole('button', { name: 'Show Data Table' })
  await expect(show).toHaveAttribute('aria-expanded', 'false')
  await show.click()
  const hide = demo.getByRole('button', { name: 'Hide Data Table' })
  await expect(hide).toHaveAttribute('aria-expanded', 'true')

  const table = demo.getByRole('table')
  await expect(table).toBeVisible()
  await expect(table.locator('caption')).toContainText(caption)
  const rows = table.getByRole('row')
  await expect(rows).toHaveCount(7)
  await expect(rows.first()).toHaveText(/Month.*Visitors/)
  await expect(table.getByRole('row', { name: /Jun/ })).toHaveText(/Jun.*3,410/)

  await hide.focus()
  await page.keyboard.press('Space')
  await expect(show).toHaveAttribute('aria-expanded', 'false')
  await expect(show).toBeFocused()
  await expect(table).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
