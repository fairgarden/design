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

test('grounds sets an inline and a standalone link on each ground', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  // Each face is the ground that holds its "On <preset>, …" sentence.
  const face = (preset: string) => demo.getByText(`On ${preset},`).locator('..')
  await expect(demo.getByRole('link', { name: 'See all preserves' })).toHaveCount(3)
  await expect(demo.getByRole('link', { name: 'find a preserve' })).toHaveCount(3)

  // Paper follows the page mode; forest is fixed dark and leaf fixed light.
  const expected = [
    { preset: 'paper', scheme: 'page', theme: null },
    { preset: 'forest', scheme: 'dark', theme: 'dark' },
    { preset: 'leaf', scheme: 'light', theme: 'light' },
  ] as const

  for (const { preset, scheme, theme } of expected) {
    const ground = face(preset)
    await expect(ground).toHaveAttribute('data-ground', preset)
    await expect(ground).toHaveAttribute('data-scheme', scheme)
    if (theme === null) await expect(ground).not.toHaveAttribute('data-theme', /.*/)
    else await expect(ground).toHaveAttribute('data-theme', theme)
    await expect(ground.getByText(`On ${preset},`)).toBeVisible()

    const links = ground.getByRole('link')
    await expect(links).toHaveCount(2)
    const inline = ground.getByRole('link', { name: 'find a preserve' })
    const standalone = ground.getByRole('link', { name: 'See all preserves' })
    for (const link of [inline, standalone]) {
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute('href', '#grounds')
      // Each link re-resolves its roles against the ground it sits on.
      await expect(link).toHaveAttribute('data-ground', preset)
      await expect(link).toHaveAttribute('data-scheme', scheme)
    }
    // The standalone link's chevron is decorative.
    await expect(standalone.locator('svg[aria-hidden="true"]')).toHaveCount(1)
  }

  // Keyboard order runs face by face, inline link before standalone.
  await face('paper').getByRole('link', { name: 'find a preserve' }).focus()
  await page.keyboard.press('Tab')
  await expect(face('paper').getByRole('link', { name: 'See all preserves' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(face('forest').getByRole('link', { name: 'find a preserve' })).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
