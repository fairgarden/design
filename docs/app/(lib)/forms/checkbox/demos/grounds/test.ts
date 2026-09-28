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

test('grounds repeats the same checkboxes on paper and forest', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const paper = demo.locator('[data-ground="paper"]')
  const forest = demo.locator('[data-ground="forest"]')
  await expect(paper).toHaveCount(1)
  await expect(forest).toHaveCount(1)

  // Paper follows the page mode; forest fixes a dark scope.
  await expect(paper).toHaveAttribute('data-scheme', 'page')
  await expect(paper).not.toHaveAttribute('data-theme')
  await expect(forest).toHaveAttribute('data-scheme', 'dark')
  await expect(forest).toHaveAttribute('data-theme', 'dark')

  for (const [name, ground] of [
    ['paper', paper],
    ['forest', forest],
  ] as const) {
    await expect(ground.getByText(name, { exact: true })).toBeVisible()
    await expect(ground.getByRole('checkbox')).toHaveCount(5)

    const box = (label: string) => ground.getByRole('checkbox', { name: label, exact: true })
    await expect(box('Checked')).toBeChecked()
    await expect(box('Unchecked')).not.toBeChecked()
    await expect(box('Some Selected')).toHaveAttribute('aria-checked', 'mixed')
    await expect(box('Unavailable')).toBeChecked()
    await expect(box('Unavailable')).toHaveAttribute('aria-disabled', 'true')

    const card = ground.getByRole('checkbox', { name: /Oak Frame/ })
    await expect(card).toBeChecked()
    await expect(ground.getByText('+ $75.00', { exact: true })).toBeVisible()
  }

  // Each ground keeps its own state.
  const paperUnchecked = paper.getByRole('checkbox', { name: 'Unchecked', exact: true })
  const forestUnchecked = forest.getByRole('checkbox', { name: 'Unchecked', exact: true })
  await paperUnchecked.focus()
  await page.keyboard.press('Space')
  await expect(paperUnchecked).toBeChecked()
  await expect(forestUnchecked).not.toBeChecked()
  await forest.getByText('Unchecked', { exact: true }).click()
  await expect(forestUnchecked).toBeChecked()

  // The disabled box ignores the pointer.
  await forest.getByText('Unavailable', { exact: true }).click()
  await expect(forest.getByRole('checkbox', { name: 'Unavailable', exact: true })).toBeChecked()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
