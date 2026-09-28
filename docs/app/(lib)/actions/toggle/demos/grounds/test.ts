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

test('grounds renders the same groups on paper and forest scopes', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const paper = demo.locator('[data-ground="paper"]')
  const forest = demo.locator('[data-ground="forest"]')
  await expect(paper).toHaveCount(1)
  await expect(forest).toHaveCount(1)
  await expect(paper).toHaveAttribute('data-tone', 'light-base')
  // Forest is an always-dark field, so it fixes its mode.
  await expect(forest).toHaveAttribute('data-tone', 'dark-tinted')
  await expect(forest).toHaveAttribute('data-theme', 'dark')

  for (const [preset, ground] of [
    ['paper', paper],
    ['forest', forest],
  ] as const) {
    await expect(ground.getByText(preset, { exact: true })).toBeVisible()

    const view = ground.getByRole('group', { name: `View on ${preset}` })
    await expect(view.getByRole('button')).toHaveCount(2)
    await expect(view.getByRole('button', { name: 'Day' })).toHaveAttribute('aria-pressed', 'true')
    await expect(view.getByRole('button', { name: 'Week' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    const filters = ground.getByRole('group', { name: `Filters on ${preset}` })
    await expect(filters.getByRole('button')).toHaveCount(2)
    await expect(filters.getByRole('button', { name: 'Birds' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(filters.getByRole('button', { name: 'Ferns' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('grounds switches the segment and filters independently per ground', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const forest = demo.locator('[data-ground="forest"]')
  const paper = demo.locator('[data-ground="paper"]')

  const forestView = forest.getByRole('group', { name: 'View on forest' })
  await forestView.getByRole('button', { name: 'Week' }).click()
  await expect(forestView.getByRole('button', { name: 'Week' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(forestView.getByRole('button', { name: 'Day' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  // The paper group keeps its own value.
  await expect(
    paper.getByRole('group', { name: 'View on paper' }).getByRole('button', { name: 'Day' }),
  ).toHaveAttribute('aria-pressed', 'true')

  // Filters are multiple: pressing Ferns by keyboard keeps Birds pressed.
  const paperFilters = paper.getByRole('group', { name: 'Filters on paper' })
  await paperFilters.getByRole('button', { name: 'Birds' }).focus()
  await page.keyboard.press('ArrowRight')
  const ferns = paperFilters.getByRole('button', { name: 'Ferns' })
  await expect(ferns).toBeFocused()
  await page.keyboard.press('Space')
  await expect(ferns).toHaveAttribute('aria-pressed', 'true')
  await expect(paperFilters.getByRole('button', { name: 'Birds' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
