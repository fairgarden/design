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
  // The Demo's preview surface, the rendered demo without its code panel (a CSS Module class,
  // whose local name is stable across builds), so source text and code buttons never match.
  return demo.locator('[class*="__preview"]').first()
}

test('grounds scopes a collapsible to paper and to forest', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const paper = demo.locator('section[data-ground="paper"]')
  const forest = demo.locator('section[data-ground="forest"]')
  await expect(paper).toHaveCount(1)
  await expect(forest).toHaveCount(1)
  await expect(paper.getByText('paper', { exact: true })).toBeVisible()
  await expect(forest.getByText('forest', { exact: true })).toBeVisible()

  // Paper follows the page mode (no data-theme); forest is a fixed dark field.
  await expect(paper).not.toHaveAttribute('data-theme', /.+/)
  await expect(forest).toHaveAttribute('data-theme', 'dark')
  await expect(forest).toHaveAttribute('data-tone', 'dark-tinted')

  // Each collapsible root carries its ground's scope.
  await expect(paper.locator('[data-ground="paper"][data-tone="light-base"]')).toHaveCount(1)
  await expect(forest.locator('[data-ground="forest"][data-tone="dark-tinted"]')).toHaveCount(1)

  for (const ground of [paper, forest]) {
    const trigger = ground.getByRole('button')
    await expect(trigger).toHaveAccessibleName('Show 3 more')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(ground.getByText('Fox Run, Willow Bend, Kettle Pond.')).toBeHidden()
  }

  // Pointer on paper: opens only that one.
  const paperTrigger = paper.getByRole('button')
  const forestTrigger = forest.getByRole('button')
  await paperTrigger.click()
  await expect(paperTrigger).toHaveAttribute('aria-expanded', 'true')
  await expect(paperTrigger).toHaveAccessibleName('Show less')
  await expect(paper.getByText('Fox Run, Willow Bend, Kettle Pond.')).toBeVisible()
  await expect(forestTrigger).toHaveAttribute('aria-expanded', 'false')

  // Keyboard on forest: Space opens and closes, focus stays on the trigger.
  await forestTrigger.focus()
  await page.keyboard.press('Space')
  await expect(forestTrigger).toHaveAttribute('aria-expanded', 'true')
  await expect(forestTrigger).toHaveAccessibleName('Show less')
  await expect(forest.getByText('Fox Run, Willow Bend, Kettle Pond.')).toBeVisible()
  await page.keyboard.press('Space')
  await expect(forestTrigger).toHaveAttribute('aria-expanded', 'false')
  await expect(forestTrigger).toHaveAccessibleName('Show 3 more')
  await expect(forestTrigger).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
