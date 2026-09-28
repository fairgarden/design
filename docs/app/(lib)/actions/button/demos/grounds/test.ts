import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

// Each ground and the scope it writes: paper follows the page (no data-theme),
// forest is always dark, leaf always light.
const grounds = [
  { preset: 'paper', scheme: 'page', theme: null },
  { preset: 'forest', scheme: 'dark', theme: 'dark' },
  { preset: 'leaf', scheme: 'light', theme: 'light' },
] as const

test('grounds renders the same two buttons in each ground scope', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  await expect(demo.getByRole('button', { name: 'Join Us', exact: true })).toHaveCount(grounds.length)
  await expect(demo.getByRole('button', { name: 'Visit', exact: true })).toHaveCount(grounds.length)

  for (const { preset, scheme, theme } of grounds) {
    // The innermost Ground section of this preset that carries its name label.
    const face = demo
      .locator(`section[data-ground="${preset}"]`)
      .filter({ has: page.getByText(preset, { exact: true }) })
      .last()
    await expect(face).toBeVisible()
    await expect(face.getByText(preset, { exact: true })).toBeVisible()
    await expect(face).toHaveAttribute('data-scheme', scheme)
    if (theme) await expect(face).toHaveAttribute('data-theme', theme)
    else await expect(face).not.toHaveAttribute('data-theme', /.+/)

    const faceButtons = face.getByRole('button')
    await expect(faceButtons).toHaveCount(2)
    await expect(faceButtons).toHaveText(['Join Us', 'Visit'])

    // Each button re-resolves its roles against the scope it sits in.
    const join = face.getByRole('button', { name: 'Join Us', exact: true })
    const visit = face.getByRole('button', { name: 'Visit', exact: true })
    for (const button of [join, visit]) {
      await expect(button).toBeEnabled()
      await expect(button).toHaveAttribute('data-ground', preset)
      await expect(button).toHaveAttribute('data-scheme', scheme)
    }
    await expect(join).toHaveClass(/solid/)
    await expect(visit).toHaveClass(/outline/)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('grounds moves focus across the grounds by keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const joins = demo.getByRole('button', { name: 'Join Us', exact: true })
  const visits = demo.getByRole('button', { name: 'Visit', exact: true })
  await joins.nth(0).focus()
  await expect(joins.nth(0)).toBeFocused()
  for (let i = 0; i < grounds.length; i++) {
    if (i > 0) {
      await page.keyboard.press('Tab')
      await expect(joins.nth(i)).toBeFocused()
    }
    await page.keyboard.press('Tab')
    await expect(visits.nth(i)).toBeFocused()
  }

  // A pointer press focuses the button and leaves the demo intact.
  await joins.nth(2).click()
  await expect(joins.nth(2)).toBeFocused()
  await expect(demo.getByRole('button')).toHaveCount(grounds.length * 2)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
