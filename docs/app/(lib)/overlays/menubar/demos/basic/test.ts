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

/** The open menu popup (portaled outside the demo) that holds the named item. */
function menuWith(page: Page, name: string) {
  return page
    .getByRole('menu')
    .filter({ has: page.getByRole('menuitem', { name, exact: true }) })
}

test.describe('wide', () => {
  // From 1024 px the bar shows one trigger per menu.
  test.use({ viewport: { width: 1280, height: 900 } })

  test('basic shows its three menus and the starting status', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    const demo = await openDemo(page)
    const bar = demo.getByRole('menubar')
    await expect(bar).toBeVisible()
    const triggers = bar.getByRole('menuitem')
    await expect(triggers).toHaveText(['File', 'Edit', 'View Options'])
    for (const name of ['File', 'Edit', 'View Options']) {
      await expect(bar.getByRole('menuitem', { name })).toHaveAttribute('aria-expanded', 'false')
    }
    await expect(demo.getByText('No command yet. Grid on, contours off.')).toBeVisible()
    await expect(page.getByRole('menu')).toHaveCount(0)

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })

  test('basic opens, navigates and chooses from the keyboard', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    const demo = await openDemo(page)
    const bar = demo.getByRole('menubar')
    const file = bar.getByRole('menuitem', { name: 'File' })
    const edit = bar.getByRole('menuitem', { name: 'Edit' })

    // Arrow keys move between the closed triggers.
    await file.focus()
    await page.keyboard.press('ArrowRight')
    await expect(edit).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(file).toBeFocused()

    // Enter opens the File menu on its first item.
    await page.keyboard.press('Enter')
    const fileMenu = menuWith(page, 'New survey')
    await expect(fileMenu).toBeVisible()
    await expect(file).toHaveAttribute('aria-expanded', 'true')
    const fileItem = (name: string) => fileMenu.getByRole('menuitem', { name, exact: true })
    await expect(fileItem('New survey')).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(fileItem('Open survey')).toBeFocused()
    await page.keyboard.press('ArrowDown')
    const exportAs = fileItem('Export as')
    await expect(exportAs).toBeFocused()
    await expect(exportAs).toHaveAttribute('aria-haspopup', 'menu')

    // ArrowRight on the submenu trigger opens the submenu on its first item.
    await page.keyboard.press('ArrowRight')
    const exportMenu = menuWith(page, 'CSV table')
    await expect(exportMenu).toBeVisible()
    await expect(exportMenu.getByRole('menuitem', { name: 'CSV table' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(exportMenu.getByRole('menuitem', { name: 'GPX track' })).toBeFocused()

    // Choosing runs the command and closes every menu.
    await page.keyboard.press('Enter')
    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(demo.getByText('Exported a GPX track. Grid on, contours off.')).toBeVisible()
    await expect(file).toHaveAttribute('aria-expanded', 'false')

    // Escape closes without choosing and returns focus to the trigger.
    await file.focus()
    await page.keyboard.press('Enter')
    await expect(fileMenu).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(file).toBeFocused()
    await expect(demo.getByText('Exported a GPX track. Grid on, contours off.')).toBeVisible()

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })

  test('basic switches menus by pointer and skips the disabled item', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    const demo = await openDemo(page)
    const bar = demo.getByRole('menubar')
    const file = bar.getByRole('menuitem', { name: 'File' })
    const edit = bar.getByRole('menuitem', { name: 'Edit' })

    await file.click()
    await expect(menuWith(page, 'New survey')).toBeVisible()

    // With one menu open, hovering another trigger switches to its menu.
    await edit.hover()
    const editMenu = menuWith(page, 'Undo')
    await expect(editMenu).toBeVisible()
    await expect(menuWith(page, 'New survey')).toHaveCount(0)
    await expect(edit).toHaveAttribute('aria-expanded', 'true')
    await expect(file).toHaveAttribute('aria-expanded', 'false')

    const redo = editMenu.getByRole('menuitem', { name: 'Redo (nothing to redo)' })
    await expect(redo).toHaveAttribute('aria-disabled', 'true')
    await expect(editMenu.getByRole('separator')).toHaveCount(1)

    // Keyboard navigation passes over the disabled item.
    await editMenu.getByRole('menuitem', { name: 'Undo' }).focus()
    await page.keyboard.press('ArrowDown')
    await expect(editMenu.getByRole('menuitem', { name: 'Clear plot' })).toBeFocused()

    // Clicking a command runs it and closes the menu.
    await editMenu.getByRole('menuitem', { name: 'Clear plot' }).click()
    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(demo.getByText('Cleared the plot. Grid on, contours off.')).toBeVisible()

    // An outside press closes an open menu without choosing.
    await file.click()
    await expect(menuWith(page, 'New survey')).toBeVisible()
    await demo.getByText('Cleared the plot. Grid on, contours off.').click()
    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(demo.getByText('Cleared the plot. Grid on, contours off.')).toBeVisible()

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })

  test('basic toggles the view options', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    const demo = await openDemo(page)
    const view = demo.getByRole('menubar').getByRole('menuitem', { name: 'View Options' })
    await view.click()

    const viewMenu = page.getByRole('menu').filter({
      has: page.getByRole('menuitemcheckbox', { name: 'Survey grid' }),
    })
    await expect(viewMenu).toBeVisible()
    const grid = viewMenu.getByRole('menuitemcheckbox', { name: 'Survey grid' })
    const contours = viewMenu.getByRole('menuitemcheckbox', { name: 'Contour lines' })
    await expect(grid).toHaveAttribute('aria-checked', 'true')
    await expect(contours).toHaveAttribute('aria-checked', 'false')

    // By pointer.
    await contours.click()
    await expect(contours).toHaveAttribute('aria-checked', 'true')
    await expect(demo.getByText('No command yet. Grid on, contours on.')).toBeVisible()

    // By keyboard.
    await grid.focus()
    await page.keyboard.press('Enter')
    await expect(grid).toHaveAttribute('aria-checked', 'false')
    await expect(demo.getByText('No command yet. Grid off, contours on.')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(view).toBeFocused()

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})

test.describe('narrow', () => {
  // Below 1024 px the bar collapses into one "Menu" trigger.
  test.use({ viewport: { width: 390, height: 900 } })

  test('basic collapses into one menu of labelled groups', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    const demo = await openDemo(page)
    const bar = demo.getByRole('menubar')
    await expect(bar.getByRole('menuitem')).toHaveText(['Menu'])
    await expect(bar.getByRole('menuitem', { name: 'File' })).toHaveCount(0)

    const trigger = bar.getByRole('menuitem', { name: 'Menu' })
    await trigger.click()
    const menu = menuWith(page, 'New survey')
    await expect(menu).toBeVisible()
    for (const name of ['File', 'Edit', 'View Options']) {
      await expect(menu.getByRole('group', { name })).toBeVisible()
    }
    await expect(
      menu.getByRole('group', { name: 'Edit' }).getByRole('menuitem', { name: 'Undo' }),
    ).toBeVisible()

    await menu.getByRole('menuitem', { name: 'Open survey' }).click()
    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(demo.getByText('Opened a survey. Grid on, contours off.')).toBeVisible()

    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(menuWith(page, 'New survey')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(trigger).toBeFocused()

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})
