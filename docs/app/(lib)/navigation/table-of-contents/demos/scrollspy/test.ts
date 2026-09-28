import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('scrollspy marks the section in view as the panel scrolls', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // The scrolling panel: a focusable box named by its aria-label.
  const panel = demo.getByLabel('Seed sowing guide', { exact: true })
  const nav = demo.getByRole('navigation', { name: 'On this page' })
  const link = (name: string) => nav.getByRole('link', { name, exact: true })
  const current = nav.locator('[aria-current="location"]')

  await expect(nav.getByRole('link')).toHaveCount(5)
  await expect(link('Choosing seed')).toHaveAttribute('href', '#spy-choosing-seed')

  // At the top of the panel the first heading is current.
  await expect(current).toHaveCount(1)
  await expect(current).toHaveText('Before you sow')

  // Scrolled to the end from the keyboard, the last heading is current.
  await panel.focus()
  await expect(panel).toBeFocused()
  await page.keyboard.press('End')
  await expect(current).toHaveText('Saving seed for next year')
  await expect(link('Before you sow')).not.toHaveAttribute('aria-current', /.*/)

  // Back to the top, the first again.
  await page.keyboard.press('Home')
  await expect(current).toHaveText('Before you sow')

  // Following an entry scrolls the panel to its heading, which becomes current.
  await link('Thinning').click()
  await expect(demo.getByRole('heading', { name: 'Thinning', level: 2 })).toBeInViewport()
  await expect(current).toHaveText('Thinning')
  await expect(current).toHaveCount(1)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
