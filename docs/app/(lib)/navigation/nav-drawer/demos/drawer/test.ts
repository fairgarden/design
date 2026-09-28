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

test('drawer opens from the menu Button with its rows, current page and footer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const trigger = demo.getByRole('button', { name: 'Menu' })
  await expect(trigger).toBeVisible()
  await expect(trigger).toHaveText('Menu')
  // Closed: no sheet on the page.
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await trigger.click()
  const sheet = page.getByRole('dialog', { name: 'Menu' })
  await expect(sheet).toBeVisible()
  // While open the menu Button swaps to "Close".
  await expect(demo.locator('[data-popup-open]')).toHaveText('Close')

  // The bar repeats the logo and holds the close control.
  await expect(sheet.getByRole('link', { name: 'FairGarden home' })).toHaveAttribute('href', '/')
  await expect(sheet.getByRole('button', { name: 'Close' })).toBeVisible()

  const nav = sheet.getByRole('navigation', { name: 'Main' })
  await expect(nav).toBeVisible()

  // Three groups: only the one holding the current page opens, and its row is marked current.
  const group = (name: string) => nav.getByRole('button', { name })
  await expect(nav.getByRole('button')).toHaveCount(3)
  await expect(group('Our Work')).toHaveAttribute('aria-expanded', 'false')
  await expect(group('Programs')).toHaveAttribute('aria-expanded', 'true')
  await expect(group('Programs')).toHaveAttribute('aria-current', 'true')
  await expect(group('Get Involved')).toHaveAttribute('aria-expanded', 'false')
  await expect(group('Our Work')).not.toHaveAttribute('aria-current', /.*/)

  // The open group's links, with the current page marked.
  await expect(nav.getByRole('link', { name: 'Programs', exact: true })).toBeVisible()
  const current = nav.getByRole('link', { name: 'Garden programs' })
  await expect(current).toHaveAttribute('aria-current', 'page')
  await expect(current).toHaveAttribute('href', '/programs/gardens')
  await expect(nav.getByRole('link', { name: 'Our impact' })).not.toHaveAttribute('aria-current', /.*/)
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(1)
  // Collapsed groups hide their links.
  await expect(nav.getByRole('link', { name: 'Stewardship' })).toBeHidden()
  await expect(nav.getByRole('link', { name: 'Volunteer' })).toBeHidden()

  // Direct links at the top level.
  await expect(nav.getByRole('link', { name: 'Find a Garden' })).toHaveAttribute('href', '/find-a-garden')
  await expect(nav.getByRole('link', { name: 'News' })).toHaveAttribute('href', '/news')

  // The footer: the action pill, the utility links and the locale Select.
  await expect(sheet.getByRole('link', { name: 'Donate' })).toHaveAttribute('href', '/donate')
  for (const [name, href] of [
    ['About', '/about'],
    ['Contact', '/contact'],
    ['Accessibility settings', '/accessibility'],
  ] as const) {
    await expect(sheet.getByRole('link', { name })).toHaveAttribute('href', href)
  }
  await expect(sheet.getByRole('combobox', { name: 'Language' })).toHaveText(/English/)

  // Pointer close: the close control dismisses the sheet and focus returns to the menu Button.
  await sheet.getByRole('button', { name: 'Close' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(trigger).toHaveText('Menu')
  await expect(trigger).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('drawer moves focus to the first row, traps it and returns it on Escape', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const trigger = demo.getByRole('button', { name: 'Menu' })
  await trigger.focus()
  await page.keyboard.press('Enter')

  const sheet = page.getByRole('dialog', { name: 'Menu' })
  await expect(sheet).toBeVisible()
  const nav = sheet.getByRole('navigation', { name: 'Main' })
  // Focus starts on the first row of the list.
  await expect(nav.getByRole('button', { name: 'Our Work' })).toBeFocused()

  // Round the sheet's controls both ways; focus never leaves it.
  const focusInSheet = () => sheet.evaluate((element) => element.contains(document.activeElement))
  for (const key of ['Tab', 'Shift+Tab']) {
    for (let press = 1; press <= 16; press += 1) {
      await page.keyboard.press(key)
      await expect.poll(focusInSheet, `focus should stay in the drawer after ${press} × ${key}`).toBe(true)
    }
  }

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveText('Menu')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('drawer groups expand and collapse independently by keyboard and pointer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await demo.getByRole('button', { name: 'Menu' }).click()
  const sheet = page.getByRole('dialog', { name: 'Menu' })
  const nav = sheet.getByRole('navigation', { name: 'Main' })
  const ourWork = nav.getByRole('button', { name: 'Our Work' })
  const programs = nav.getByRole('button', { name: 'Programs' })
  const getInvolved = nav.getByRole('button', { name: 'Get Involved' })
  await expect(ourWork).toBeFocused()

  // Keyboard: Enter opens the focused group; the current group stays open beside it.
  await page.keyboard.press('Enter')
  await expect(ourWork).toHaveAttribute('aria-expanded', 'true')
  await expect(nav.getByRole('link', { name: 'Stewardship' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Priorities' })).toBeVisible()
  await expect(programs).toHaveAttribute('aria-expanded', 'true')
  await expect(nav.getByRole('link', { name: 'Garden programs' })).toBeVisible()

  // Space closes it again.
  await page.keyboard.press('Space')
  await expect(ourWork).toHaveAttribute('aria-expanded', 'false')
  await expect(nav.getByRole('link', { name: 'Stewardship' })).toBeHidden()
  await expect(ourWork).toBeFocused()

  // Pointer: open a third group, then collapse the current one; each keeps its own state.
  await getInvolved.click()
  await expect(getInvolved).toHaveAttribute('aria-expanded', 'true')
  await expect(nav.getByRole('link', { name: 'Volunteer' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Share your land' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Give' })).toBeVisible()

  await programs.click()
  await expect(programs).toHaveAttribute('aria-expanded', 'false')
  await expect(nav.getByRole('link', { name: 'Garden programs' })).toBeHidden()
  // Collapsing keeps the row marked as holding the current page.
  await expect(programs).toHaveAttribute('aria-current', 'true')
  await expect(getInvolved).toHaveAttribute('aria-expanded', 'true')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
