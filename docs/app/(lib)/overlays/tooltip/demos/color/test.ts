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

test('color recolors only the popup it is passed to', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  // Two identical icon-only triggers; neither takes the popup's scale.
  const triggers = demo.getByRole('button', { name: 'Download Map', exact: true })
  await expect(triggers).toHaveCount(2)
  for (const trigger of await triggers.all()) {
    await expect(trigger).not.toHaveClass(/primaryPlum/)
  }

  // Keyboard focus opens the first: the overlay scope's default (olive) scale.
  await triggers.nth(0).focus()
  const fallback = popup(page, 'Overlay default')
  await expect(fallback).toBeVisible()
  await expect(fallback).toHaveClass(/primaryOlive/)
  await expect(fallback).not.toHaveClass(/primaryPlum/)
  await expect(fallback).toHaveAttribute('data-scheme', 'page')
  await expect(fallback).not.toHaveAttribute('data-theme')

  // Its neighbor, sharing the Provider, carries plum.
  await page.keyboard.press('Tab')
  await expect(triggers.nth(1)).toBeFocused()
  const plum = popup(page, 'Primary plum')
  await expect(plum).toBeVisible()
  await expect(plum).toHaveClass(/primaryPlum/)
  await expect(plum).toHaveAttribute('data-ground', 'white')
  await expect(fallback).toBeHidden()

  await page.keyboard.press('Escape')
  await expect(plum).toBeHidden()
  await expect(triggers.nth(1)).toBeFocused()

  // Hover opens the same popups.
  await triggers.nth(0).hover()
  await expect(fallback).toBeVisible()
  await page.mouse.move(0, 0)
  await expect(fallback).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
