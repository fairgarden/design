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

/**
 * An open tooltip popup: it renders in a portal outside the demo, writes the
 * overlay scope (`white`) and carries Base UI's `data-open` while showing.
 */
function popup(page: Page, text: string) {
  return page.locator('[data-ground="white"][data-open]').filter({ hasText: text })
}

test('variants opens each trigger form on keyboard focus and dismisses with Escape', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  // Three icon-only labels, a hint and a term: five triggers, all buttons.
  const zoomIn = demo.getByRole('button', { name: 'Zoom In', exact: true })
  const zoomOut = demo.getByRole('button', { name: 'Zoom Out', exact: true })
  const reset = demo.getByRole('button', { name: 'Reset View', exact: true })
  const hint = demo.getByRole('button', { name: 'About membership tiers', exact: true })
  const term = demo.getByRole('button', { name: 'conservation easement', exact: true })
  await expect(demo.getByRole('button')).toHaveCount(5)
  await expect(term).toHaveText('conservation easement')

  // Nothing shows until a trigger is focused or hovered.
  await expect(page.locator('[data-ground="white"][data-open]')).toHaveCount(0)

  // Keyboard focus opens the label, whose text equals the control's name.
  await zoomIn.focus()
  await expect(popup(page, 'Zoom In')).toBeVisible()
  await expect(popup(page, 'Zoom In')).toHaveAttribute('data-side', 'top')
  await expect(zoomIn).toHaveAttribute('data-popup-open', '')

  // Tabbing to the neighbor swaps the popup.
  await page.keyboard.press('Tab')
  await expect(zoomOut).toBeFocused()
  await expect(popup(page, 'Zoom Out')).toBeVisible()
  await expect(popup(page, 'Zoom In')).toBeHidden()

  // Escape dismisses without moving focus.
  await page.keyboard.press('Escape')
  await expect(popup(page, 'Zoom Out')).toBeHidden()
  await expect(zoomOut).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(reset).toBeFocused()
  await expect(popup(page, 'Reset View')).toBeVisible()

  // The hint glyph's hidden children are its name; the popup gives the hint.
  await page.keyboard.press('Tab')
  await expect(hint).toBeFocused()
  await expect(popup(page, 'Tiers renew each spring.')).toBeVisible()
  await expect(popup(page, 'Reset View')).toBeHidden()

  // The term's definition sits below it.
  await page.keyboard.press('Tab')
  await expect(term).toBeFocused()
  const definition = popup(page, 'A legal limit on development that stays with the deed.')
  await expect(definition).toBeVisible()
  await expect(definition).toHaveAttribute('data-side', 'bottom')
  await page.keyboard.press('Escape')
  await expect(definition).toBeHidden()
  await expect(term).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('variants opens on hover, moves between Provider neighbors and closes on leave', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const zoomIn = demo.getByRole('button', { name: 'Zoom In', exact: true })
  const zoomOut = demo.getByRole('button', { name: 'Zoom Out', exact: true })
  const term = demo.getByRole('button', { name: 'conservation easement', exact: true })

  await zoomIn.hover()
  const zoomInPopup = popup(page, 'Zoom In')
  await expect(zoomInPopup).toBeVisible()
  // The popup is the overlay scope, following the page mode without a data-theme.
  await expect(zoomInPopup).toHaveAttribute('data-scheme', 'page')
  await expect(zoomInPopup).not.toHaveAttribute('data-theme')

  // The neighbor in the same Provider takes over.
  await zoomOut.hover()
  await expect(popup(page, 'Zoom Out')).toBeVisible()
  await expect(zoomInPopup).toBeHidden()

  // Leaving the trigger closes it.
  await page.mouse.move(0, 0)
  await expect(popup(page, 'Zoom Out')).toBeHidden()

  await term.hover()
  const definition = popup(page, 'A legal limit on development that stays with the deed.')
  await expect(definition).toBeVisible()
  await expect(definition).toHaveAttribute('data-side', 'bottom')
  await page.mouse.move(0, 0)
  await expect(definition).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
