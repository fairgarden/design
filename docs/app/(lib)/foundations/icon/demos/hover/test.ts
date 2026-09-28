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
  // The rendered demo, without its code panel and toolbar (a CSS Module class, whose local
  // name is stable across builds), so counts and text only see what the demo draws.
  return demo.locator('[class*="__preview"]').first()
}

test('hover and press swap to the emphasis weight', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  const close = demo.getByRole('button', { name: 'Close' })
  const menu = demo.getByRole('button', { name: 'Menu' })
  const seeAll = demo.getByRole('link', { name: 'See all' })
  const add = demo.getByRole('button', { name: 'Add (unavailable)' })
  await expect(demo.getByRole('button')).toHaveCount(3)
  await expect(close).toBeEnabled()
  await expect(menu).toBeEnabled()
  await expect(add).toBeDisabled()
  await expect(seeAll).toHaveAttribute('href', '#hover')

  // Labelled icons name their buttons; the link's chevron sits beside its text and is hidden.
  await expect(close.getByRole('img', { name: 'Close' })).toBeVisible()
  await expect(menu.getByRole('img', { name: 'Menu' })).toBeVisible()
  await expect(seeAll.locator('svg')).toHaveAttribute('aria-hidden', 'true')

  // An interactive icon ships two paths: rest first, emphasis second.
  const rest = (host: typeof close) => host.locator('svg path').first()
  const emphasis = (host: typeof close) => host.locator('svg path').nth(1)
  for (const host of [close, menu, seeAll, add]) {
    await expect(host.locator('svg path')).toHaveCount(2)
    await expect(rest(host)).toBeVisible()
    await expect(emphasis(host)).toBeHidden()
  }

  // Hover: the emphasis path replaces the rest one, only on the hovered host.
  await close.hover()
  await expect(emphasis(close)).toBeVisible()
  await expect(rest(close)).toBeHidden()
  await expect(rest(menu)).toBeVisible()
  await expect(emphasis(menu)).toBeHidden()

  await seeAll.hover()
  await expect(emphasis(seeAll)).toBeVisible()
  await expect(rest(seeAll)).toBeHidden()
  await expect(rest(close)).toBeVisible()
  await expect(emphasis(close)).toBeHidden()

  // Press: held down on the host, the icon stays at emphasis.
  await menu.hover()
  await page.mouse.down()
  await expect(emphasis(menu)).toBeVisible()
  await expect(rest(menu)).toBeHidden()
  await page.mouse.up()

  // A disabled host keeps the rest weight under the pointer.
  const box = await add.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await expect(rest(add)).toBeVisible()
  await expect(emphasis(add)).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('hover focus rings the host and keeps the rest weight', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  // Park the pointer away from the demo so no host is hovered.
  await page.mouse.move(0, 0)

  const close = demo.getByRole('button', { name: 'Close' })
  const menu = demo.getByRole('button', { name: 'Menu' })
  const seeAll = demo.getByRole('link', { name: 'See all' })
  const add = demo.getByRole('button', { name: 'Add (unavailable)' })

  // Tab order runs through the enabled hosts and skips the disabled one.
  await close.focus()
  await expect(close).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(menu).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(seeAll).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(add).not.toBeFocused()

  // Focus is not hover: every focused host kept its rest path.
  await page.keyboard.press('Shift+Tab')
  await expect(seeAll).toBeFocused()
  for (const host of [close, menu, seeAll]) {
    await expect(host.locator('svg path').first()).toBeVisible()
    await expect(host.locator('svg path').nth(1)).toBeHidden()
  }

  // Activating the link from the keyboard follows it to its in-page target.
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#hover$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
