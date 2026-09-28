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
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return { demo, pageErrors }
}

test('collapsible tallies seedlings by plot from pointer and keyboard', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)
  const tag = (text: string) => demo.getByText(text, { exact: true })

  // Three plots, each tallied at zero, planting in the first.
  for (const name of ['North', 'South', 'Orchard']) await expect(tag(`${name}: 0`)).toBeVisible()
  const plant = demo.getByRole('button', { name: /^Plant in / })
  const next = demo.getByRole('button', { name: 'Next Plot' })
  await expect(plant).toHaveText('Plant in North')

  await plant.click()
  await plant.click()
  await expect(tag('North: 2')).toBeVisible()
  await expect(tag('South: 0')).toBeVisible()

  // Next Plot moves planting on; the other tallies hold.
  await next.focus()
  await page.keyboard.press('Enter')
  await expect(plant).toHaveText('Plant in South')
  await plant.focus()
  await page.keyboard.press('Space')
  await expect(tag('South: 1')).toBeVisible()
  await expect(tag('North: 2')).toBeVisible()

  // Past the last plot it wraps back to the first.
  await next.click()
  await expect(plant).toHaveText('Plant in Orchard')
  await next.click()
  await expect(plant).toHaveText('Plant in North')
  await plant.click()
  await expect(tag('North: 3')).toBeVisible()
  await expect(tag('Orchard: 0')).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('collapsible shows its two files as tabs', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)
  const files = demo.getByRole('tablist', { name: 'Files' })
  await expect(files.getByRole('tab')).toHaveCount(2)
  const source = files.getByRole('tab', { name: /PlotTally\.tsx/ })
  const styles = files.getByRole('tab', { name: /plot-tally\.module\.css/ })
  await expect(source).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByRole('tabpanel')).toContainText('export function PlotTally()')

  // Several files: the actions live in the "More actions" menu.
  await expect(demo.getByRole('button', { name: 'More actions' })).toBeEnabled()

  await styles.click()
  await expect(styles).toHaveAttribute('aria-selected', 'true')
  await expect(source).toHaveAttribute('aria-selected', 'false')
  await expect(demo.getByRole('tabpanel')).toContainText('.row')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
