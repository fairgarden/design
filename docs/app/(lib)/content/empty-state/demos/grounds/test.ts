import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

// Each ground and the scope it writes: paper follows the page (no data-theme),
// forest is always dark.
const grounds = [
  { label: 'paper', preset: 'paper', scheme: 'page', theme: null },
  { label: 'forest field', preset: 'forest', scheme: 'dark', theme: 'dark' },
] as const

async function open(page: Page) {
  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return demo
}

test('grounds renders the same empty state in each ground scope', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await open(page)

  await expect(
    demo.getByRole('heading', { level: 3, name: 'Nothing here yet', exact: true }),
  ).toHaveCount(grounds.length)
  await expect(demo.getByRole('button', { name: 'See Past Events', exact: true })).toHaveCount(
    grounds.length,
  )

  for (const { label, preset, scheme, theme } of grounds) {
    // The innermost Ground section of this preset that carries its name label.
    const face = demo
      .locator(`section[data-ground="${preset}"]`)
      .filter({ has: page.getByText(label, { exact: true }) })
      .last()
    await expect(face).toBeVisible()
    await expect(face.getByText(label, { exact: true })).toBeVisible()
    await expect(face).toHaveAttribute('data-scheme', scheme)
    if (theme) await expect(face).toHaveAttribute('data-theme', theme)
    else await expect(face).not.toHaveAttribute('data-theme', /.+/)

    // The empty state re-resolves against the scope it sits in.
    const empty = face.locator('div[data-ground]').filter({ hasText: 'Nothing here yet' }).last()
    await expect(empty).toHaveClass(/framed/)
    await expect(empty).toHaveAttribute('data-ground', preset)
    await expect(empty).toHaveAttribute('data-scheme', scheme)
    // Its dashed frame outline is decorative.
    await expect(empty.locator(':scope > div > svg[aria-hidden="true"] > rect')).toHaveCount(1)

    await expect(face.getByRole('heading', { level: 3 })).toHaveText('Nothing here yet')
    await expect(face.getByText('New events appear every Monday.', { exact: true })).toBeVisible()
    const action = face.getByRole('button', { name: 'See Past Events', exact: true })
    await expect(action).toBeEnabled()
    await expect(action).toHaveClass(/outline/)
    await expect(action).toHaveAttribute('data-ground', preset)
    await expect(action).toHaveAttribute('data-scheme', scheme)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('grounds moves focus between the actions by keyboard and pointer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await open(page)
  const actions = demo.getByRole('button', { name: 'See Past Events', exact: true })

  await actions.nth(0).focus()
  await expect(actions.nth(0)).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(actions.nth(1)).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(actions.nth(0)).toBeFocused()

  await actions.nth(1).click()
  await expect(actions.nth(1)).toBeFocused()
  await expect(demo.getByRole('button')).toHaveCount(grounds.length)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
