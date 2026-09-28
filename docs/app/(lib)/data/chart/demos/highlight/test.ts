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
const highlightCaption = '2026 against the two years before it: one series solid, the rest outlined.'
const oneInkCaption =
  'The same data in one ink, as on a deep or saturated ground: patterns carry the series.'

test('highlight gives one series slot 1 and outlines the rest', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.getByRole('figure')).toHaveCount(2)
  const figure = demo.getByRole('figure').filter({ hasText: highlightCaption })
  await expect(figure).toHaveCount(1)
  await expect(figure.getByRole('application', { name: highlightCaption })).toHaveCount(1)
  await expect(figure.getByText('Harvest (kg)', { exact: true })).toBeVisible()

  const legendItems = figure.getByRole('listitem')
  await expect(legendItems).toHaveText(['2024', '2025', '2026'])
  // Each swatch shows the fill actually drawn: 2026 solid in the odd ink, the rest the ground.
  const swatch = (name: string) => legendItems.filter({ hasText: name }).locator('svg rect')
  await expect(swatch('2026')).toHaveAttribute('fill', /--role-series-odd/)
  await expect(swatch('2024')).toHaveAttribute('fill', /--role-ground/)
  await expect(swatch('2025')).toHaveAttribute('fill', /--role-ground/)

  // Only the highlight chart is forced to one ink.
  await expect(demo.locator('[class*="__oneInk"]')).toHaveCount(1)
  await expect(demo.locator('[class*="__oneInk"]')).not.toContainText(highlightCaption)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('highlight in one ink keeps the series apart by pattern', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const figure = demo.getByRole('figure').filter({ hasText: oneInkCaption })
  await expect(figure).toHaveCount(1)
  await expect(demo.locator('[class*="__oneInk"]')).toContainText(oneInkCaption)

  const legendItems = figure.getByRole('listitem')
  await expect(legendItems).toHaveText(['2024', '2025', '2026'])
  const swatch = (name: string) => legendItems.filter({ hasText: name }).locator('svg rect')
  // Slot 1 turns --primary12; slots 2 and 3 are patterns from the chart's own defs.
  await expect(swatch('2024')).toHaveAttribute('fill', /--primary12/)
  await expect(swatch('2025')).toHaveAttribute('fill', /^url\(#.+slot2\)$/)
  await expect(swatch('2026')).toHaveAttribute('fill', /^url\(#.+slot3\)$/)
  const patternId = (await swatch('2025').getAttribute('fill'))!.replace(/^url\(#(.+)\)$/, '$1')
  await expect(figure.locator(`pattern[id="${patternId}"]`)).toHaveCount(1)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('highlight charts each move their own tooltip and open their own table', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const category = /^(Tomatoes|Beans|Squash)$/
  const highlightChart = demo.getByRole('application', { name: highlightCaption })
  const oneInkChart = demo.getByRole('application', { name: oneInkCaption })
  // Each chart draws its tooltip inside its own figure.
  const tooltipIn = (caption: string) =>
    demo.getByRole('figure').filter({ hasText: caption }).locator('[class*="__tooltipLabel"]')

  await highlightChart.focus()
  await expect(highlightChart).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(tooltipIn(highlightCaption)).toHaveText(category)
  await expect(tooltipIn(highlightCaption).locator('xpath=..')).toContainText('2026')
  await expect(tooltipIn(oneInkCaption)).toHaveCount(0)

  // Tab moves on to the next focusable: the first chart's data-table trigger.
  await page.keyboard.press('Tab')
  const triggers = demo.getByRole('button', { name: 'Show Data Table' })
  await expect(triggers).toHaveCount(2)
  await expect(triggers.first()).toBeFocused()

  const box = (await oneInkChart.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await expect(tooltipIn(oneInkCaption)).toHaveText(category)

  await triggers.last().click()
  await expect(demo.getByRole('button', { name: 'Hide Data Table' })).toHaveCount(1)
  await expect(demo.getByRole('button', { name: 'Show Data Table' })).toHaveCount(1)
  const table = demo.getByRole('table')
  await expect(table).toHaveCount(1)
  await expect(table.locator('caption')).toContainText(oneInkCaption)
  await expect(table.getByRole('row', { name: /Tomatoes/ })).toHaveText(/Tomatoes.*310.*342.*398/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
