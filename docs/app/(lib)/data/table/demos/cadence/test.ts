import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December (partial)',
]

test('cadence shows twelve months in the five-row cadence', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback. With one
  // file there are no tabs; its copy action is disabled until then instead.
  await expect(demo.getByRole('button', { name: 'Copy TableCadence.tsx source' })).toBeEnabled({
    timeout: 15000,
  })

  const table = demo.getByRole('table').first()
  await expect(table).toBeVisible()

  // The caption: label, title and scope note.
  const caption = table.locator('caption')
  await expect(caption).toContainText('Table 2')
  await expect(caption).toContainText('Birds counted per month, 2025')
  await expect(caption).toContainText('Counts from the weekly marsh walk.')

  // Three column headers, the numeric ones included.
  const columnHeaders = table.getByRole('columnheader')
  await expect(columnHeaders).toHaveText(['Month', 'Birds', 'Species'])
  await expect(columnHeaders.first()).toHaveAttribute('scope', 'col')

  // Twelve body rows, each led by a row header: one header row plus twelve.
  await expect(table.getByRole('row')).toHaveCount(13)
  const rowHeaders = table.getByRole('rowheader')
  await expect(rowHeaders).toHaveText(months)
  await expect(rowHeaders.first()).toHaveAttribute('scope', 'row')

  // More than ten body rows switch the body to the five-row cadence.
  const body = table.locator('tbody')
  await expect(body).toHaveClass(/__cadence/)

  // Numbers are formatted with grouping separators.
  const rowFor = (month: string) =>
    table.getByRole('row').filter({ has: page.getByRole('rowheader', { name: month, exact: true }) })
  const may = rowFor('May')
  await expect(may.getByRole('cell').nth(0)).toContainText('902')
  await expect(may.getByRole('cell').nth(1)).toContainText('73')
  await expect(rowFor('April').getByRole('cell').nth(0)).toContainText('716')
  await expect(rowFor('January').getByRole('cell').nth(0)).toContainText('412')

  // One row is selected (the row bar), one inactive, carrying a word as well as tone.
  await expect(body.locator('tr[class*="__selected"]')).toHaveCount(1)
  await expect(may).toHaveClass(/__selected/)
  await expect(body.locator('tr[class*="__inactive"]')).toHaveCount(1)
  const december = rowFor('December (partial)')
  await expect(december).toHaveClass(/__inactive/)
  await expect(december.getByRole('rowheader')).toContainText('(partial)')
  await expect(rowFor('June')).not.toHaveClass(/__selected|__inactive/)

  // The row bar is decorative.
  await expect(may.locator('[class*="__rowBar"]').first()).toHaveAttribute('aria-hidden', 'true')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
