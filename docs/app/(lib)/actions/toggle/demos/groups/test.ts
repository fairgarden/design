import path from 'node:path'
import { test, expect, type Locator, type Page } from '@playwright/test'

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

const pressed = (locator: Locator, value: boolean) =>
  expect(locator).toHaveAttribute('aria-pressed', String(value))

test('groups labels its four groups and their initial values', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const view = demo.getByRole('group', { name: 'View' })
  await expect(view.getByRole('button')).toHaveCount(3)
  await pressed(view.getByRole('button', { name: 'Map' }), true)
  await pressed(view.getByRole('button', { name: 'List' }), false)
  await pressed(view.getByRole('button', { name: 'Grid' }), false)

  const filters = demo.getByRole('group', { name: 'Filter Trails' })
  await expect(filters.getByRole('button')).toHaveCount(5)
  await pressed(filters.getByRole('button', { name: 'Shaded' }), true)
  await expect(filters.getByRole('button', { name: 'Step Free' })).toBeDisabled()

  const size = demo.getByRole('group', { name: 'Size: M' })
  await expect(size.getByRole('button')).toHaveCount(5)
  await pressed(size.getByRole('button', { name: 'M', exact: true }), true)

  const units = demo.getByRole('group', { name: 'Units' })
  await expect(units.getByRole('button')).toHaveCount(2)
  await pressed(units.getByRole('button', { name: 'Metric' }), true)
  await pressed(units.getByRole('button', { name: 'Imperial' }), false)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('groups moves focus with arrows and selects one segment from the keyboard', async ({
  page,
}) => {
  const { demo, pageErrors } = await openDemo(page)

  const view = demo.getByRole('group', { name: 'View' })
  const map = view.getByRole('button', { name: 'Map' })
  const list = view.getByRole('button', { name: 'List' })
  await map.focus()
  await page.keyboard.press('ArrowRight')
  await expect(list).toBeFocused()
  await page.keyboard.press('Enter')
  await pressed(list, true)
  await pressed(map, false)

  await view.getByRole('button', { name: 'Grid' }).click()
  await pressed(view.getByRole('button', { name: 'Grid' }), true)
  await pressed(list, false)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('groups toggles several filter chips and skips the disabled one', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const filters = demo.getByRole('group', { name: 'Filter Trails' })
  const shaded = filters.getByRole('button', { name: 'Shaded' })
  const loop = filters.getByRole('button', { name: 'Loop Trail' })
  const stepFree = filters.getByRole('button', { name: 'Step Free' })

  await loop.click()
  await pressed(loop, true)
  await pressed(shaded, true)

  await shaded.focus()
  await page.keyboard.press('Space')
  await pressed(shaded, false)
  await pressed(loop, true)

  await stepFree.click({ force: true })
  await pressed(stepFree, false)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('groups echoes the chosen size in its label', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  await expect(demo.getByText('Size: M', { exact: true })).toBeVisible()
  await demo.getByRole('button', { name: 'S', exact: true }).click()
  const size = demo.getByRole('group', { name: 'Size: S' })
  await expect(size).toBeVisible()
  await pressed(size.getByRole('button', { name: 'S', exact: true }), true)
  await pressed(size.getByRole('button', { name: 'M', exact: true }), false)

  // Pressing the chosen chip again clears the single-choice group.
  await size.getByRole('button', { name: 'S', exact: true }).click()
  await expect(demo.getByText('Size: None', { exact: true })).toBeVisible()
  await expect(demo.getByRole('group', { name: 'Size: None' })).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
