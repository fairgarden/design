import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

const faces = [
  { ground: 'paper', name: 'paper', theme: null },
  { ground: 'forest', name: 'forest field', theme: 'dark' },
  { ground: 'leaf', name: 'leaf field', theme: 'light' },
] as const

test('grounds sets one glossary grid on paper, forest and leaf', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  // The Demo's preview surface, without its code (a stable CSS Module local name).
  const preview = demo.locator('[class*="__preview"]').first()

  // Three grounds, each holding one grid.
  await expect(preview.locator('[data-ground]')).toHaveCount(3)
  await expect(preview.getByRole('list')).toHaveCount(3)

  for (const { ground, name, theme } of faces) {
    const scope = preview.locator(`[data-ground="${ground}"]`)
    await expect(scope).toHaveCount(1)
    await expect(scope).toBeVisible()
    await expect(scope.getByText(name, { exact: true })).toBeVisible()

    // Fields fix their mode; paper as a face on the page follows it.
    if (theme) await expect(scope).toHaveAttribute('data-theme', theme)
    else await expect(scope).not.toHaveAttribute('data-theme')

    // The glossary: two cells, each a caption heading and a line of body.
    const list = scope.getByRole('list')
    await expect(list).toHaveCount(1)
    await expect(list.getByRole('listitem')).toHaveCount(2)
    await expect(list.getByRole('heading', { level: 3 })).toHaveText(['Above', 'Around'])
    await expect(list.getByText('Higher than the trail.')).toBeVisible()
    await expect(list.getByText('A loop back to the lot.')).toBeVisible()

    // Drawings are decorative: hidden from assistive tech, one per cell.
    const drawings = list.locator('li > [aria-hidden="true"]')
    await expect(drawings).toHaveCount(2)
    await expect(drawings.locator('svg')).toHaveCount(2)
    await expect(drawings.nth(0).locator('svg path')).toHaveCount(1)
    await expect(drawings.nth(1).locator('svg circle')).toHaveCount(1)

    // Glossary grids carry no links and no numerals.
    await expect(scope.getByRole('link')).toHaveCount(0)
    await expect(scope.locator('ol')).toHaveCount(0)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
