import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

// Every v1 ground and the scope it writes: page grounds follow the page (no
// data-theme), night and the dark fields are always dark, the light fields
// always light.
const grounds = [
  { preset: 'paper', scheme: 'page', theme: null },
  { preset: 'white', scheme: 'page', theme: null },
  { preset: 'tide', scheme: 'page', theme: null },
  { preset: 'meadow', scheme: 'page', theme: null },
  { preset: 'pollen', scheme: 'page', theme: null },
  { preset: 'apricot', scheme: 'page', theme: null },
  { preset: 'rose', scheme: 'page', theme: null },
  { preset: 'heather', scheme: 'page', theme: null },
  { preset: 'night', scheme: 'dark', theme: 'dark' },
  { preset: 'forest', scheme: 'dark', theme: 'dark' },
  { preset: 'leaf', scheme: 'light', theme: 'light' },
  { preset: 'amber', scheme: 'light', theme: 'light' },
  { preset: 'clay', scheme: 'light', theme: 'light' },
  { preset: 'pink', scheme: 'light', theme: 'light' },
  { preset: 'royal', scheme: 'dark', theme: 'dark' },
  { preset: 'brick', scheme: 'dark', theme: 'dark' },
] as const

// The three variants, each with its destructive compound class.
const actions = [
  { name: 'Delete Trail', destructive: /solidDestructive/ },
  { name: 'Discard', destructive: /outlineDestructive/ },
  { name: 'Remove Photo', destructive: /textDestructive/ },
] as const

test('destructive renders the three danger variants on all sixteen grounds', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  for (const { name } of actions) {
    await expect(demo.getByRole('button', { name, exact: true })).toHaveCount(grounds.length)
  }

  for (const { preset, scheme, theme } of grounds) {
    // The innermost Ground section of this preset that carries its name label.
    const face = demo
      .locator(`section[data-ground="${preset}"]`)
      .filter({ has: page.getByText(preset, { exact: true }) })
      .last()
    await expect(face).toBeAttached()
    await expect(face.getByText(preset, { exact: true })).toBeAttached()
    await expect(face).toHaveAttribute('data-scheme', scheme)
    if (theme) await expect(face).toHaveAttribute('data-theme', theme)
    else await expect(face).not.toHaveAttribute('data-theme', /.+/)

    const faceButtons = face.getByRole('button')
    await expect(faceButtons).toHaveCount(actions.length)
    await expect(faceButtons).toHaveText(actions.map((a) => a.name))

    for (const { name, destructive } of actions) {
      const button = face.getByRole('button', { name, exact: true })
      await expect(button).toBeEnabled()
      await expect(button).toHaveClass(destructive)
      await expect(button).toHaveAttribute('data-ground', preset)
      await expect(button).toHaveAttribute('data-scheme', scheme)
    }

    // Only the text button carries a glyph, kept out of its accessible name.
    await expect(face.getByRole('button', { name: 'Remove Photo', exact: true }).locator('[aria-hidden="true"]')).toHaveCount(1)
    await expect(face.getByRole('button', { name: 'Delete Trail', exact: true }).locator('[aria-hidden="true"]')).toHaveCount(0)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('destructive keeps focus and presses unchanged', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // Tab walks one ground's three buttons in order, then on to the next ground.
  const all = demo.locator('[class*="__preview"]').first().getByRole('button')
  await all.nth(0).focus()
  await expect(all.nth(0)).toBeFocused()
  await expect(all.nth(0)).toHaveText('Delete Trail')
  for (let i = 1; i <= actions.length; i++) {
    await page.keyboard.press('Tab')
    await expect(all.nth(i)).toBeFocused()
    await expect(all.nth(i)).toHaveText(actions[i % actions.length].name)
  }
  await page.keyboard.press('Shift+Tab')
  await expect(all.nth(actions.length - 1)).toBeFocused()

  // Keyboard and pointer presses do nothing destructive to the demo itself.
  await page.keyboard.press('Enter')
  await page.keyboard.press('Space')
  await expect(all.nth(actions.length - 1)).toBeFocused()
  const lastDelete = demo.getByRole('button', { name: 'Delete Trail', exact: true }).last()
  await lastDelete.click()
  await expect(lastDelete).toBeFocused()
  await expect(all).toHaveCount(grounds.length * actions.length)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
