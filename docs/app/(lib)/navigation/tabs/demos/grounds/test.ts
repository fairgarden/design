import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

// Each ground and the scope it writes: paper follows the page (no data-theme), forest is
// always dark. The segmented cell fills on paper only.
const grounds = [
  { preset: 'paper', theme: null, filled: true },
  { preset: 'forest', theme: 'dark', filled: false },
] as const

async function openDemo(page: Page) {
  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.getByRole('tablist', { name: 'Files' }).locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return demo
}

function faceOf(page: Page, preset: string) {
  // The innermost Ground section of this preset that carries its name label.
  return page
    .locator('.demo')
    .first()
    .locator(`section[data-ground="${preset}"]`)
    .filter({ has: page.getByText(preset, { exact: true }) })
    .last()
}

test('grounds renders an underline and a segmented set in each ground scope', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  await expect(demo.getByRole('tab', { name: 'Map', exact: true })).toHaveCount(grounds.length)
  await expect(demo.getByRole('tab', { name: 'Now', exact: true })).toHaveCount(grounds.length)

  for (const { preset, theme, filled } of grounds) {
    const face = faceOf(page, preset)
    await expect(face).toBeVisible()
    if (theme) await expect(face).toHaveAttribute('data-theme', theme)
    else await expect(face).not.toHaveAttribute('data-theme', /.+/)

    const lists = face.getByRole('tablist')
    await expect(lists).toHaveCount(2)
    // Each tab also holds a hidden copy of its label, so compare accessible names, not text.
    for (const [i, name] of ['Map', 'List'].entries())
      await expect(lists.nth(0).getByRole('tab').nth(i)).toHaveAccessibleName(name, { ignoreCase: true })
    for (const [i, name] of ['Now', 'Later'].entries())
      await expect(lists.nth(1).getByRole('tab').nth(i)).toHaveAccessibleName(name, { ignoreCase: true })
    await expect(face.getByRole('tab', { name: 'Map', exact: true })).toHaveAttribute('aria-selected', 'true')
    await expect(face.getByRole('tab', { name: 'Now', exact: true })).toHaveAttribute('aria-selected', 'true')
    await expect(face.getByRole('tab', { name: 'List', exact: true })).toHaveAttribute('aria-selected', 'false')
    await expect(face.getByRole('tab', { name: 'Later', exact: true })).toHaveAttribute('aria-selected', 'false')
    await expect(face.getByText('Trailheads and parking.')).toBeVisible()

    // The segmented root re-resolves against its ground; only paper's is filled.
    const segmented = face.locator('[class*="segmented"]').filter({ has: page.getByRole('tab', { name: 'Now', exact: true }) })
    await expect(segmented).toHaveCount(1)
    await expect(segmented).toHaveAttribute('data-ground', preset)
    if (filled) {
      await expect(segmented).toHaveClass(/filled/)
      await expect(face.getByText('Filled on a light ground.')).toBeVisible()
    } else {
      await expect(segmented).not.toHaveClass(/filled/)
      await expect(face.getByText('No cell fill on a deep ground.')).toBeVisible()
    }
  }

  expect(pageErrors, 'the demo should mount without uncaught errors').toEqual([])
})

test('grounds switches tabs by pointer and keyboard within one ground only', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  await openDemo(page)

  const paper = faceOf(page, 'paper')
  const forest = faceOf(page, 'forest')

  // Pointer on forest: List is chosen there, paper keeps Map.
  await forest.getByRole('tab', { name: 'List', exact: true }).click()
  await expect(forest.getByRole('tab', { name: 'List', exact: true })).toHaveAttribute('aria-selected', 'true')
  await expect(forest.getByText('Every preserve, A to Z.')).toBeVisible()
  await expect(forest.getByText('Trailheads and parking.')).toBeHidden()
  await expect(paper.getByRole('tab', { name: 'Map', exact: true })).toHaveAttribute('aria-selected', 'true')
  await expect(paper.getByText('Trailheads and parking.')).toBeVisible()

  // Keyboard on paper's segmented set: arrows move focus, Enter chooses (manual activation).
  await paper.getByRole('tab', { name: 'Now', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(paper.getByRole('tab', { name: 'Later', exact: true })).toBeFocused()
  await expect(paper.getByRole('tab', { name: 'Later', exact: true })).toHaveAttribute('aria-selected', 'false')
  await page.keyboard.press('Enter')
  await expect(paper.getByRole('tab', { name: 'Later', exact: true })).toHaveAttribute('aria-selected', 'true')
  await expect(paper.getByText('Upcoming.')).toBeVisible()
  await expect(paper.getByText('Filled on a light ground.')).toBeHidden()
  await expect(forest.getByRole('tab', { name: 'Now', exact: true })).toHaveAttribute('aria-selected', 'true')

  expect(pageErrors, 'the demo should mount without uncaught errors').toEqual([])
})
