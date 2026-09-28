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

test('morph shows four selects with their placeholders and defaults', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.getByRole('combobox')).toHaveCount(4)
  await expect(demo.getByRole('combobox', { name: 'Trail' })).toHaveText('Choose a trail…')
  await expect(demo.getByRole('combobox', { name: 'Sort By' })).toHaveText('Marsh Boardwalk')
  await expect(demo.getByRole('combobox', { name: 'Region' })).toHaveText('Choose a region…')
  await expect(demo.getByRole('combobox', { name: 'Meeting Point' })).toHaveText('Visitor Barn')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('morph opens from the keyboard, skips the disabled trail and returns focus', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const trigger = demo.getByRole('combobox', { name: 'Trail' })
  const listbox = page.getByRole('listbox')
  const option = (name: string) => listbox.getByRole('option', { name })

  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(listbox).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(listbox.getByRole('option')).toHaveCount(5)
  await expect(option('Summit Path')).toHaveAttribute('aria-disabled', 'true')

  await page.keyboard.press('End')
  await expect(option('Meadow Walk')).toBeFocused()
  // The disabled Summit Path is skipped.
  await page.keyboard.press('ArrowUp')
  await expect(option('Falls Trail')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(listbox).toBeHidden()
  await expect(trigger).toHaveText('Falls Trail')
  await expect(trigger).toBeFocused()
  // Once closed, the morph frame has finished and the popup is gone.
  await expect(page.locator('[data-outline-morph]')).toHaveCount(0)

  // The grouped select lists its groups; Escape closes without choosing.
  const region = demo.getByRole('combobox', { name: 'Region' })
  await region.focus()
  await page.keyboard.press('ArrowDown')
  await expect(listbox).toBeVisible()
  await expect(listbox.getByRole('group')).toHaveCount(2)
  await expect(listbox.getByRole('group', { name: 'North' }).getByRole('option')).toHaveText([
    'Pine Barrens',
    'Lake Country',
  ])
  await expect(listbox.getByRole('group', { name: 'South' }).getByRole('option')).toHaveText([
    'River Delta',
    'Coastal Dunes',
  ])
  await page.keyboard.press('Escape')
  await expect(listbox).toBeHidden()
  await expect(region).toHaveText('Choose a region…')
  await expect(region).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test.describe('with the stage filling the window', () => {
  // A window short enough that the foot select has no room below for its eight items.
  test.use({ viewport: { width: 1280, height: 800 } })

  test('morph opens the foot select upward and chooses by pointer', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    const demo = await openDemo(page)
    const trigger = demo.getByRole('combobox', { name: 'Meeting Point' })
    const listbox = page.getByRole('listbox')

    await trigger.click()
    await expect(listbox).toBeVisible()
    await expect(listbox.getByRole('option')).toHaveCount(8)
    await expect(listbox.getByRole('option', { name: 'Visitor Barn' })).toHaveAttribute('aria-selected', 'true')

    const triggerBox = (await trigger.boundingBox())!
    const popupBox = (await listbox.boundingBox())!
    expect(popupBox.y + popupBox.height, 'the popup should open above the trigger').toBeLessThanOrEqual(
      triggerBox.y,
    )

    await listbox.getByRole('option', { name: 'Heron Pond' }).click()
    await expect(listbox).toBeHidden()
    await expect(trigger).toHaveText('Heron Pond')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})
