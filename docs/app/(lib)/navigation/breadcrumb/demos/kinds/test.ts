import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

/** Opens the demo and waits until it has finished loading; returns the demo and its errors. */
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

  const navs = demo.getByRole('navigation', { name: 'Breadcrumb' })
  await expect(navs).toHaveCount(3)
  return {
    pageErrors,
    inline: navs.nth(0),
    staircase: navs.nth(1),
    parent: navs.nth(2),
  }
}

/** Sets the inline breadcrumb's resizable frame to `width`, as dragging its corner does. */
async function setFrameWidth(page: Page, width: number) {
  await page
    .locator('.demo')
    .first()
    .getByRole('navigation', { name: 'Breadcrumb' })
    .first()
    .locator('xpath=..')
    .evaluate((frame, px) => {
      frame.style.maxInlineSize = 'none'
      frame.style.inlineSize = `${px}px`
    }, width)
}

test('kinds renders the inline, staircase and parent forms', async ({ page }) => {
  const { pageErrors, inline, staircase, parent } = await openDemo(page)

  // Inline: the parent link, five linked ancestors (one level has no page) and the current page.
  await expect(inline.locator('a[href="#kinds"]')).toHaveCount(6)
  await expect(inline.locator('ol [aria-current="page"]')).toHaveText('Easement monitoring')
  await expect(inline.locator('ol a', { hasText: 'Regional' })).toHaveCount(0)
  await expect(inline.locator('ol', { hasText: 'Regional' })).toHaveCount(1)
  // Past four and past six levels the middle collapses into a "…" menu (one per tier).
  await expect(inline.locator('ol button')).toHaveCount(2)

  // Staircase, at this viewport one line: three linked ancestors, then the current page.
  for (const name of ['Home', 'Programs', 'Conservation']) {
    const link = staircase.getByRole('link', { name, exact: true }).filter({ visible: true })
    await expect(link).toHaveCount(1)
    await expect(link).toHaveAttribute('href', '#kinds')
  }
  const current = staircase.locator('[aria-current="page"]').filter({ visible: true })
  await expect(current).toHaveCount(1)
  await expect(current).toHaveText('Easement monitoring')
  await expect(staircase.getByRole('button', { name: 'Page path' })).toBeHidden()

  // Parent: the nearest ancestor with a page, and nothing else.
  const parentLinks = parent.getByRole('link')
  await expect(parentLinks).toHaveCount(1)
  await expect(parentLinks).toHaveText('Stewardship')
  await expect(parentLinks).toHaveAttribute('href', '#kinds')
  await expect(parent.locator('ol')).toHaveCount(0)
  await expect(parent.locator('[aria-current="page"]')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds reflows the inline breadcrumb to the parent link when narrow', async ({ page }) => {
  const { pageErrors, inline } = await openDemo(page)

  await setFrameWidth(page, 300)
  const parentLink = inline.getByRole('link', { name: 'Stewardship' }).filter({ visible: true })
  await expect(parentLink).toHaveCount(1)
  await expect(parentLink).toHaveAttribute('href', '#kinds')
  await expect(inline.locator('ol')).toBeHidden()
  await expect(inline.locator('[aria-current="page"]')).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds opens the "…" menu of hidden levels by keyboard and pointer', async ({ page }) => {
  const { pageErrors, inline } = await openDemo(page)

  // From 768 px of container the crumbs are one line, the middle collapsed past four levels.
  await setFrameWidth(page, 900)
  const more = inline.getByRole('button', { name: 'More levels' }).filter({ visible: true })
  await expect(more).toHaveCount(1)
  await expect(inline.locator('ol [aria-current="page"]')).toBeVisible()
  await expect(inline.locator('ol [aria-current="page"]')).toHaveText('Easement monitoring')

  const menu = page.getByRole('menu')

  // Keyboard: Enter opens, Escape closes and returns focus to the button.
  await more.focus()
  await page.keyboard.press('Enter')
  await expect(menu).toBeVisible()
  await expect(more).toHaveAttribute('aria-expanded', 'true')
  const items = menu.getByRole('menuitem')
  await expect(items).toHaveCount(3)
  await expect(items).toHaveText(['Programs', 'Conservation', 'Regional'])
  await expect(menu.getByRole('menuitem', { name: 'Programs' })).toHaveAttribute('href', '#kinds')
  await expect(menu.getByRole('menuitem', { name: 'Conservation' })).toHaveAttribute('href', '#kinds')
  // A level without a page is listed, but cannot be chosen.
  await expect(menu.getByRole('menuitem', { name: 'Regional' })).toHaveAttribute('aria-disabled', 'true')
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await expect(more).toBeFocused()

  // Pointer: a click opens it, a click outside dismisses it.
  await more.click()
  await expect(menu).toBeVisible()
  await page.mouse.click(5, 5)
  await expect(menu).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test.describe('below 768 px', () => {
  test.use({ viewport: { width: 390, height: 900 } })

  test('kinds toggles the staircase by pointer and keyboard', async ({ page }) => {
    const { pageErrors, staircase } = await openDemo(page)

    const toggle = staircase.getByRole('button', { name: 'Page path' })
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    const rows = staircase.locator('ol').filter({ visible: true })
    await expect(rows).toHaveCount(0)

    // Pointer: open one row per level, ending with the current page.
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(rows).toHaveCount(1)
    for (const name of ['Home', 'Programs', 'Conservation']) {
      await expect(rows.getByRole('link', { name, exact: true })).toBeVisible()
    }
    await expect(rows.locator('[aria-current="page"]')).toHaveText('Easement monitoring')

    // Keyboard: Enter closes it again, focus staying on the toggle.
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(rows).toHaveCount(0)
    await expect(toggle).toBeFocused()

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})
