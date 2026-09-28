import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('grounds shows the warning alert on paper, forest and leaf scopes', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before asserting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // One alert per ground, each a polite status region with a named warning glyph.
  await expect(demo.getByRole('status')).toHaveCount(3)
  await expect(demo.getByRole('alert')).toHaveCount(0)

  // The ground scopes are the Ground sections; the alerts inside also carry data-ground.
  const scopes = demo.locator('section[data-ground]')
  await expect(scopes).toHaveCount(3)

  const expected = [
    // A page ground follows the page mode and writes no data-theme.
    { preset: 'paper', scheme: 'page', theme: null },
    // Fields fix their mode.
    { preset: 'forest', scheme: 'dark', theme: 'dark' },
    { preset: 'leaf', scheme: 'light', theme: 'light' },
  ] as const

  for (const [index, { preset, scheme, theme }] of expected.entries()) {
    const scope = scopes.nth(index)
    await expect(scope).toHaveAttribute('data-ground', preset)
    await expect(scope).toHaveAttribute('data-scheme', scheme)
    if (theme === null) await expect(scope).not.toHaveAttribute('data-theme')
    else await expect(scope).toHaveAttribute('data-theme', theme)

    const alert = scope.getByRole('status')
    await expect(alert).toHaveCount(1)
    // The alert takes its scope from the enclosing ground.
    await expect(alert).toHaveAttribute('data-ground', preset)
    await expect(alert).toHaveAttribute('data-scheme', scheme)
    await expect(alert.locator('strong')).toHaveText('High water.')
    await expect(alert).toContainText(`Fords may flood on ${preset}.`)
    await expect(alert.getByRole('img', { name: 'Warning' })).toBeVisible()
    await expect(alert).toHaveClass(/secondaryAmber/)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
