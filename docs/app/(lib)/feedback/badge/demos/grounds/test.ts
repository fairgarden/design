import path from 'node:path'
import { test, expect, type Locator } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

/** A badge's root: the parent of its label or count span. */
function badge(scope: Locator, text: string) {
  return scope.getByText(text, { exact: true }).locator('xpath=..')
}

const labels = ['Members', 'New', 'Est. 1998', 'Open', 'Closed', '4']

test('grounds shows the same badges on the paper face and the forest field', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // Each ground is named by its preset caption.
  const paper = demo.getByText('paper', { exact: true }).locator('xpath=..')
  const forest = demo.getByText('forest', { exact: true }).locator('xpath=..')

  // The paper face follows the page mode; the forest field is always dark.
  await expect(paper).toHaveAttribute('data-ground', 'paper')
  await expect(paper).toHaveAttribute('data-scheme', 'page')
  await expect(paper).not.toHaveAttribute('data-theme')
  await expect(forest).toHaveAttribute('data-ground', 'forest')
  await expect(forest).toHaveAttribute('data-scheme', 'dark')
  await expect(forest).toHaveAttribute('data-theme', 'dark')

  for (const [ground, preset] of [
    [paper, 'paper'],
    [forest, 'forest'],
  ] as const) {
    for (const label of labels) {
      await expect(ground.getByText(label, { exact: true })).toBeVisible()
    }
    // Each status glyph names its status.
    await expect(ground.getByRole('img')).toHaveCount(2)
    await expect(ground.getByRole('img', { name: 'Success', exact: true })).toHaveCount(1)
    await expect(ground.getByRole('img', { name: 'Error', exact: true })).toHaveCount(1)

    // Badges write the scope they sit in.
    for (const label of ['Members', 'New', 'Open', 'Closed', '4']) {
      await expect(badge(ground, label)).toHaveAttribute('data-ground', preset)
    }
  }

  // The sticker is a nested paper face on both grounds: on forest it is a light island.
  const paperSticker = badge(paper, 'Est. 1998')
  const forestSticker = badge(forest, 'Est. 1998')
  await expect(paperSticker).toHaveAttribute('data-ground', 'paper')
  await expect(paperSticker).not.toHaveAttribute('data-theme')
  await expect(forestSticker).toHaveAttribute('data-ground', 'paper')
  await expect(forestSticker).toHaveAttribute('data-scheme', 'light')
  await expect(forestSticker).toHaveAttribute('data-theme', 'light')

  // Badges on the forest field inherit its dark scheme.
  await expect(badge(forest, 'Open')).toHaveAttribute('data-scheme', 'dark')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
