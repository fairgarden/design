import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

// Reduced motion skips the view transition, so each morph settles at once and the owner's
// busy guard never swallows the next open or close.
test.use({ reducedMotion: 'reduce' })

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

test('morph starts collapsed with the panel hidden', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const trigger = demo.locator('button[aria-controls]').filter({ hasText: 'Trail notes' })
  await expect(trigger).toBeVisible()
  await expect(demo.getByRole('button', { name: 'Trail notes', exact: true })).toBeVisible()
  await expect(trigger).toHaveAccessibleName('Trail notes')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  const panelId = await trigger.getAttribute('aria-controls')
  expect(panelId).toBeTruthy()
  const panel = demo.locator(`[id="${panelId}"]`)
  await expect(panel).toBeHidden()
  await expect(demo.getByRole('region', { name: 'Trail notes', exact: true })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('morph opens and closes with the pointer, moving focus', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const trigger = demo.locator('button[aria-controls]').filter({ hasText: 'Trail notes' })
  await trigger.click()

  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  // The trigger keeps its place in the layout, hidden, while the panel stands in for it.
  await expect(trigger).toBeHidden()
  const panel = demo.getByRole('region', { name: 'Trail notes', exact: true })
  await expect(panel).toBeVisible()
  await expect(panel).toHaveAttribute('id', (await trigger.getAttribute('aria-controls'))!)
  await expect(panel.getByRole('heading', { name: 'Trail notes' })).toBeVisible()
  await expect(panel.getByText('The ridge loop is 6.4 km with 212 m of climb.')).toBeVisible()
  await expect(panel.getByText('take the upper bridge')).toBeVisible()

  const close = panel.getByRole('button', { name: 'Close Trail notes' })
  await expect(close).toBeFocused()

  await close.click()
  await expect(panel).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('morph opens from the keyboard and closes on Escape', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const trigger = demo.locator('button[aria-controls]').filter({ hasText: 'Trail notes' })
  const panel = demo.getByRole('region', { name: 'Trail notes', exact: true })
  const close = panel.getByRole('button', { name: 'Close Trail notes' })

  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(panel).toBeVisible()
  await expect(close).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()

  // Space opens it again, and the Close button closes it from the keyboard.
  await page.keyboard.press('Space')
  await expect(panel).toBeVisible()
  await expect(close).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(panel).toBeHidden()
  await expect(trigger).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
