import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

async function open(page: Page) {
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

test('options shows the current sort and the initial view', async ({ page }) => {
  const { demo, pageErrors } = await open(page)

  const trigger = demo.getByRole('button', { name: 'Sort: Distance' })
  await expect(trigger).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(demo.getByText('View: sorted by distance · dog-friendly only')).toBeVisible()
  await expect(page.getByRole('menu')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('options chooses a sort and toggles filters by keyboard', async ({ page }) => {
  const { demo, pageErrors } = await open(page)

  const trigger = demo.getByRole('button', { name: 'Sort: Distance' })
  await trigger.focus()
  await page.keyboard.press('Enter')

  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')

  const radio = (name: string) => menu.getByRole('menuitemradio', { name })
  const checkbox = (name: string) => menu.getByRole('menuitemcheckbox', { name })
  await expect(menu.getByRole('menuitemradio')).toHaveCount(3)
  await expect(menu.getByRole('menuitemcheckbox')).toHaveCount(2)
  await expect(menu.getByText('Sort by')).toBeVisible()
  await expect(menu.getByText('Show', { exact: true })).toBeVisible()

  await expect(radio('Distance')).toHaveAttribute('aria-checked', 'true')
  await expect(radio('Climb')).toHaveAttribute('aria-checked', 'false')
  await expect(radio('Name')).toHaveAttribute('aria-checked', 'false')
  await expect(checkbox('Closed trails')).toHaveAttribute('aria-checked', 'false')
  await expect(checkbox('Dog-friendly only')).toHaveAttribute('aria-checked', 'true')

  await expect(radio('Distance')).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(radio('Climb')).toBeFocused()
  await page.keyboard.press('Enter')

  // Radio and checkbox items keep the menu open on activation.
  await expect(menu).toBeVisible()
  await expect(radio('Climb')).toHaveAttribute('aria-checked', 'true')
  await expect(radio('Distance')).toHaveAttribute('aria-checked', 'false')
  await expect(demo.getByRole('button', { name: 'Sort: Climb' })).toBeVisible()

  // Past Name and over the separator, into the Show group.
  await page.keyboard.press('ArrowDown')
  await expect(radio('Name')).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(checkbox('Closed trails')).toBeFocused()
  await page.keyboard.press(' ')
  await expect(checkbox('Closed trails')).toHaveAttribute('aria-checked', 'true')
  await expect(menu).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  const sortClimb = demo.getByRole('button', { name: 'Sort: Climb' })
  await expect(sortClimb).toBeFocused()
  await expect(sortClimb).toHaveAttribute('aria-expanded', 'false')
  await expect(
    demo.getByText('View: sorted by climb · closed trails shown · dog-friendly only'),
  ).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('options chooses and toggles by pointer and dismisses outside', async ({ page }) => {
  const { demo, pageErrors } = await open(page)

  await demo.getByRole('button', { name: 'Sort: Distance' }).click()
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()

  await menu.getByRole('menuitemradio', { name: 'Name' }).click()
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitemradio', { name: 'Name' })).toHaveAttribute(
    'aria-checked',
    'true',
  )

  const dogFriendly = menu.getByRole('menuitemcheckbox', { name: 'Dog-friendly only' })
  await dogFriendly.click()
  await expect(dogFriendly).toHaveAttribute('aria-checked', 'false')
  await expect(menu).toBeVisible()

  // A press outside the popup dismisses it.
  await page.mouse.click(1, 1)
  await expect(menu).toBeHidden()

  const trigger = demo.getByRole('button', { name: 'Sort: Name' })
  await expect(trigger).toBeVisible()
  await expect(demo.getByText('View: sorted by name', { exact: true })).toBeVisible()

  // Reopening shows the chosen state.
  await trigger.click()
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitemradio', { name: 'Name' })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await expect(dogFriendly).toHaveAttribute('aria-checked', 'false')
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
