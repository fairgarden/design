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

test('grounds repeats the same three switches on paper and forest scopes', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const paper = demo.locator('[data-ground="paper"]').first()
  const forest = demo.locator('[data-ground="forest"]').first()
  await expect(paper).toBeVisible()
  await expect(forest).toBeVisible()
  // Forest fixes its mode dark; paper follows the page, so writes no theme at page level.
  await expect(forest).toHaveAttribute('data-theme', 'dark')
  await expect(paper).not.toHaveAttribute('data-theme', /.+/)

  await expect(demo.getByRole('switch')).toHaveCount(6)
  for (const [preset, ground] of [
    ['paper', paper],
    ['forest', forest],
  ] as const) {
    await expect(ground.getByText(preset, { exact: true })).toBeVisible()
    await expect(ground.getByRole('switch')).toHaveCount(3)

    const labels = ground.getByRole('switch', { name: 'Map Labels' })
    const contours = ground.getByRole('switch', { name: 'Contour Lines' })
    const satellite = ground.getByRole('switch', { name: 'Satellite View' })
    await expect(labels).toHaveAttribute('aria-checked', 'true')
    await expect(contours).toHaveAttribute('aria-checked', 'false')
    await expect(satellite).toHaveAttribute('aria-checked', 'false')
    await expect(satellite).toHaveAttribute('aria-disabled', 'true')
    await expect(labels).not.toHaveAttribute('aria-disabled', 'true')

    const row = (control: typeof labels) => control.locator('xpath=..')
    await expect(row(labels).getByText('On', { exact: true })).toBeVisible()
    await expect(row(contours).getByText('Off', { exact: true })).toBeVisible()
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('grounds flips on forest without touching paper, and never flips the disabled switch', async ({
  page,
}) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const paper = demo.locator('[data-ground="paper"]').first()
  const forest = demo.locator('[data-ground="forest"]').first()

  const forestContours = forest.getByRole('switch', { name: 'Contour Lines' })
  await forestContours.click()
  await expect(forestContours).toHaveAttribute('aria-checked', 'true')
  await expect(paper.getByRole('switch', { name: 'Contour Lines' })).toHaveAttribute(
    'aria-checked',
    'false',
  )

  // Space flips a focused switch; the label row flips it by pointer.
  const paperLabels = paper.getByRole('switch', { name: 'Map Labels' })
  await paperLabels.focus()
  await page.keyboard.press('Space')
  await expect(paperLabels).toHaveAttribute('aria-checked', 'false')
  await expect(forest.getByRole('switch', { name: 'Map Labels' })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await paper.getByText('Map Labels', { exact: true }).click()
  await expect(paperLabels).toHaveAttribute('aria-checked', 'true')

  // The disabled switch keeps its state.
  const satellite = forest.getByRole('switch', { name: 'Satellite View' })
  await forest.getByText('Satellite View', { exact: true }).click({ force: true })
  await expect(satellite).toHaveAttribute('aria-checked', 'false')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
