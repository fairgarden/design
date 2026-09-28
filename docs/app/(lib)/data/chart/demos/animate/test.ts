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
const caption = 'Planting peaked in May, once the last frost had passed.'

test('animate settles into the full chart', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const figure = demo.getByRole('figure')
  await expect(figure).toHaveCount(1)
  const figcaption = figure.locator('figcaption')
  await expect(figcaption).toContainText(caption)
  await expect(figcaption).toContainText('Source: FairGarden nursery log, 2026.')
  await expect(figure.getByText('Seedlings planted', { exact: true })).toBeVisible()

  const chart = figure.getByRole('application', { name: caption })
  await expect(chart).toHaveCount(1)
  // After the entry animation, every bar carries its value label.
  for (const value of ['120', '340', '510', '280']) {
    await expect(chart.getByText(value, { exact: true })).toBeVisible()
  }
  await expect(demo.getByRole('button', { name: 'Replay' })).toBeEnabled()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('animate replays by remounting the chart, from pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const replay = demo.getByRole('button', { name: 'Replay' })
  const show = demo.getByRole('button', { name: 'Show Data Table' })
  const hide = demo.getByRole('button', { name: 'Hide Data Table' })

  // Open the data table: a remount resets it, which shows the chart really remounted.
  await show.click()
  await expect(hide).toHaveAttribute('aria-expanded', 'true')
  await expect(demo.getByRole('table')).toBeVisible()

  await replay.click()
  await expect(show).toHaveAttribute('aria-expanded', 'false')
  await expect(demo.getByRole('table')).toBeHidden()
  await expect(demo.getByRole('application', { name: caption }).getByText('510', { exact: true })).toBeVisible()

  await show.click()
  await expect(hide).toHaveAttribute('aria-expanded', 'true')
  await replay.focus()
  await page.keyboard.press('Enter')
  await expect(show).toHaveAttribute('aria-expanded', 'false')
  // Replay keeps focus: only the chart remounts.
  await expect(replay).toBeFocused()
  await expect(demo.getByRole('application', { name: caption }).getByText('510', { exact: true })).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('animate shows the chart at once and still shows the tooltip', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    const demo = await openDemo(page)
    const chart = demo.getByRole('application', { name: caption })
    for (const value of ['120', '340', '510', '280']) {
      await expect(chart.getByText(value, { exact: true })).toBeVisible()
    }

    const tooltipLabel = demo.locator('[class*="__tooltipLabel"]')
    await chart.focus()
    await page.keyboard.press('ArrowRight')
    await expect(tooltipLabel).toHaveText(/^(March|April|May|June)$/)
    await expect(tooltipLabel.locator('xpath=..')).toContainText('Seedlings planted')

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})
