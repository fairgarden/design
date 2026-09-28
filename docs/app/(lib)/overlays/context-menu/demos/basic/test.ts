import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

const trails = ['Ridge Loop', 'Alder Creek', 'Meadow Spur']
const actions = ['Open trail', 'Download map', 'Remove from list']
const hint = 'Right-click a row, press Shift+F10, or use its “…” menu.'

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

test('basic lists its rows, each with a visible “…” menu', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const rows = demo.getByRole('list').getByRole('listitem')
  await expect(rows).toHaveCount(trails.length)
  for (const [index, trail] of trails.entries()) {
    const row = rows.nth(index)
    await expect(row.getByText(trail, { exact: true })).toBeVisible()
    // The context menu is a shortcut: every row also offers its actions in a visible button.
    const more = row.getByRole('button', { name: `${trail} actions` })
    await expect(more).toBeVisible()
    await expect(more).toHaveAttribute('aria-haspopup', 'menu')
    await expect(more).toHaveAttribute('aria-expanded', 'false')
  }
  await expect(demo.getByText(hint)).toHaveAttribute('aria-live', 'polite')
  await expect(page.getByRole('menu')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('basic opens a row’s context menu by right-click and runs an action', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await demo.getByText('Alder Creek', { exact: true }).click({ button: 'right' })

  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitem')).toHaveText(actions)
  await expect(menu.getByRole('separator')).toHaveCount(1)

  await menu.getByRole('menuitem', { name: 'Download map' }).click()
  await expect(menu).toBeHidden()
  await expect(demo.getByText('Downloaded the Alder Creek map.')).toBeVisible()

  // A click outside dismisses it without running anything.
  await demo.getByText('Ridge Loop', { exact: true }).click({ button: 'right' })
  await expect(menu).toBeVisible()
  await page.mouse.click(1, 1)
  await expect(menu).toBeHidden()
  await expect(demo.getByText('Downloaded the Alder Creek map.')).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('basic opens the context menu with Shift+F10 on the focused row', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const area = demo.getByRole('listitem').nth(2).locator('[tabindex="0"]').first()
  await expect(area).toHaveText('Meadow Spur')
  await area.focus()
  await page.keyboard.press('Shift+F10')

  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitem')).toHaveCount(actions.length)

  // Escape dismisses it and runs nothing.
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(demo.getByText(hint)).toBeVisible()

  await area.focus()
  await page.keyboard.press('Shift+F10')
  await expect(menu).toBeVisible()
  // ArrowUp wraps to the last item, over the separator, whichever item is highlighted first.
  await page.keyboard.press('ArrowUp')
  await expect(menu.getByRole('menuitem', { name: 'Remove from list' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(menu).toBeHidden()
  await expect(demo.getByText('Removed Meadow Spur from the list.')).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('basic offers the same actions in each row’s “…” menu', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const more = demo.getByRole('button', { name: 'Ridge Loop actions' })

  // Pointer: open, then Escape returns focus to the trigger.
  await more.click()
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expect(more).toHaveAttribute('aria-expanded', 'true')
  await expect(menu.getByRole('menuitem')).toHaveText(actions)
  await expect(menu.getByRole('separator')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(more).toBeFocused()
  await expect(more).toHaveAttribute('aria-expanded', 'false')

  // Keyboard: open on the first item, move down and choose.
  await page.keyboard.press('Enter')
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitem', { name: 'Open trail' })).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(menu.getByRole('menuitem', { name: 'Download map' })).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(menu.getByRole('menuitem', { name: 'Open trail' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(menu).toBeHidden()
  await expect(demo.getByText('Opened Ridge Loop.')).toBeVisible()
  await expect(more).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
