import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('grounds sets a compact pager on each ground', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // Each face is the ground that holds its preset name.
  const face = (preset: string) => demo.getByText(preset, { exact: true }).locator('..')
  await expect(demo.getByRole('navigation', { name: 'Pagination' })).toHaveCount(3)

  // A light page ground and a pastel follow the page mode; the deep field is fixed dark.
  const expected = [
    { preset: 'paper', tone: 'light-base', scheme: 'page', theme: null },
    { preset: 'tide', tone: 'tinted', scheme: 'page', theme: null },
    { preset: 'forest', tone: 'dark-tinted', scheme: 'dark', theme: 'dark' },
  ] as const

  for (const { preset, tone, scheme, theme } of expected) {
    const ground = face(preset)
    await expect(ground).toHaveAttribute('data-ground', preset)
    await expect(ground).toHaveAttribute('data-tone', tone)
    await expect(ground).toHaveAttribute('data-scheme', scheme)
    if (theme === null) await expect(ground).not.toHaveAttribute('data-theme', /.*/)
    else await expect(ground).toHaveAttribute('data-theme', theme)

    // The pager re-resolves its roles against the ground it sits on.
    const nav = ground.getByRole('navigation', { name: 'Pagination' })
    await expect(nav).toBeVisible()
    await expect(nav).toHaveAttribute('data-ground', preset)
    await expect(nav).toHaveAttribute('data-scheme', scheme)

    // Compact at every width: the count, no page numbers.
    await expect(nav.locator('ol')).toHaveCount(0)
    await expect(nav.locator('p[aria-live="polite"]')).toHaveText('Page 3 of 12')
    await expect(nav.getByRole('link')).toHaveCount(2)
    const previous = nav.getByRole('link', { name: 'Previous', exact: true })
    const next = nav.getByRole('link', { name: 'Next', exact: true })
    await expect(previous).toBeVisible()
    await expect(previous).toHaveAttribute('href', '#grounds-2')
    await expect(previous).toHaveAttribute('rel', 'prev')
    await expect(next).toBeVisible()
    await expect(next).toHaveAttribute('href', '#grounds-4')
    await expect(next).toHaveAttribute('rel', 'next')
  }

  // Keyboard order runs face by face, Previous before Next.
  const link = (preset: string, name: string) =>
    face(preset).getByRole('link', { name, exact: true })
  await link('paper', 'Previous').focus()
  await page.keyboard.press('Tab')
  await expect(link('paper', 'Next')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(link('tide', 'Previous')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(link('tide', 'Next')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(link('forest', 'Previous')).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
