import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('kinds shows a list toolbar and a figure toolbar with their state', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  await expect(demo.getByRole('toolbar')).toHaveCount(2)
  const list = demo.getByRole('toolbar', { name: 'Survey plots' })
  const figure = demo.getByRole('toolbar', { name: 'Figure controls' })

  await expect(demo.getByText('list', { exact: true })).toBeVisible()
  await expect(demo.getByText('figure', { exact: true })).toBeVisible()

  await expect(list.getByText('Items (54)')).toBeVisible()
  await expect(list.getByRole('button', { name: 'Add Plot' })).toBeVisible()
  await expect(list.getByRole('button', { name: 'Recently Accessed' })).toBeVisible()
  // The caption prints the toolbar's state outside the row.
  await expect(demo.getByText('54 items · Sorted by recently accessed')).toBeVisible()

  for (const name of ['Zoom Out', 'Zoom In', 'Recenter', 'Download Figure', 'Previous Figure', 'Next Figure']) {
    await expect(figure.getByRole('button', { name })).toBeVisible()
  }
  await expect(figure.getByText('3 of 12')).toBeVisible()
  await expect(figure.getByRole('separator')).toHaveCount(1)

  await expect(demo.getByText('Zoom 100% · No action yet.')).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds sorts the list from its menu by keyboard and pointer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const list = demo.getByRole('toolbar', { name: 'Survey plots' })
  const trigger = list.getByRole('button', { name: 'Recently Accessed' })
  await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')

  // Keyboard: open, move to "Name", choose; focus returns to the trigger.
  await trigger.focus()
  await page.keyboard.press('Enter')
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  const item = (name: string) => menu.getByRole('menuitemradio', { name })
  await expect(menu.getByRole('menuitemradio')).toHaveCount(3)
  await expect(item('Recently Accessed')).toHaveAttribute('aria-checked', 'true')
  await expect(item('Recently Accessed')).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(item('Name')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(menu).toBeHidden()

  const sorted = list.getByRole('button', { name: 'Name', exact: true })
  await expect(sorted).toBeFocused()
  await expect(demo.getByText('54 items · Sorted by name')).toBeVisible()

  // Pointer: open, see the choice checked, choose "Size".
  await sorted.click()
  await expect(menu).toBeVisible()
  await expect(item('Name')).toHaveAttribute('aria-checked', 'true')
  await item('Size').click()
  await expect(menu).toBeHidden()
  await expect(list.getByRole('button', { name: 'Size', exact: true })).toBeVisible()
  await expect(demo.getByText('54 items · Sorted by size')).toBeVisible()

  // Escape dismisses without choosing and returns focus.
  const size = list.getByRole('button', { name: 'Size', exact: true })
  await size.focus()
  await page.keyboard.press('Enter')
  await expect(menu).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(size).toBeFocused()
  await expect(demo.getByText('54 items · Sorted by size')).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds drives the figure controls by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const figure = demo.getByRole('toolbar', { name: 'Figure controls' })
  const button = (name: string) => figure.getByRole('button', { name, exact: true })

  // Pointer: zoom, step the pager (which wraps), download.
  await button('Zoom In').click()
  await expect(demo.getByText('Zoom 125% · No action yet.')).toBeVisible()
  await button('Next Figure').click()
  await expect(figure.getByText('4 of 12')).toBeVisible()
  for (let press = 0; press < 4; press++) await button('Previous Figure').click()
  await expect(figure.getByText('12 of 12')).toBeVisible()
  await button('Next Figure').click()
  await expect(figure.getByText('1 of 12')).toBeVisible()
  await button('Download Figure').click()
  await expect(demo.getByText('Zoom 125% · Downloaded the figure.')).toBeVisible()

  // Keyboard: arrows rove between items; Enter activates the focused one.
  await button('Zoom Out').focus()
  await page.keyboard.press('Enter')
  await expect(demo.getByText('Zoom 100% · Downloaded the figure.')).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(demo.getByText('Zoom 75% · Downloaded the figure.')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(button('Recenter')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(demo.getByText('Zoom 100% · Downloaded the figure.')).toBeVisible()
  await page.keyboard.press('ArrowLeft')
  await expect(button('Zoom In')).toBeFocused()

  // The list's actions report to the same status line.
  await demo.getByRole('toolbar', { name: 'Survey plots' }).getByRole('button', { name: 'Add Plot' }).click()
  await expect(demo.getByText('Zoom 100% · Added a plot.')).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
