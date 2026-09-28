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
  // fallback. The tabs are disabled until then, so wait for them before interacting. (The code's
  // tabs: the preview's own tabs are never disabled here.)
  await expect(
    demo.getByRole('tablist', { name: 'Files' }).locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return demo.locator('[class*="__preview"]').first()
}

test('color renders a plum underline set and an indigo filled segmented set', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  // The primary-coloured underline tabs.
  const topics = demo.getByRole('tablist').filter({ has: page.getByRole('tab', { name: 'Birds' }) })
  await expect(topics).toHaveCount(1)
  // Each tab also holds a hidden copy of its label, so compare accessible names, not text.
  for (const [i, name] of ['Birds', 'Plants', 'Insects'].entries())
    await expect(topics.getByRole('tab').nth(i)).toHaveAccessibleName(name, { ignoreCase: true })
  await expect(topics.getByRole('tab', { name: 'Birds' })).toHaveAttribute('aria-selected', 'true')
  await expect(topics.getByRole('tab', { name: 'Plants' })).toHaveAttribute('aria-selected', 'false')
  await expect(topics.getByRole('tab', { name: 'Insects' })).toHaveAttribute('aria-selected', 'false')

  // The secondary-coloured filled segmented tabs.
  const actions = demo.getByRole('tablist').filter({ has: page.getByRole('tab', { name: 'Visit' }) })
  await expect(actions).toHaveCount(1)
  // Each tab also holds a hidden copy of its label, so compare accessible names, not text.
  for (const [i, name] of ['Visit', 'Volunteer', 'Give'].entries())
    await expect(actions.getByRole('tab').nth(i)).toHaveAccessibleName(name, { ignoreCase: true })
  await expect(actions.getByRole('tab', { name: 'Visit' })).toHaveAttribute('aria-selected', 'true')

  // Each root carries its colour axis (CSS Module classes keep their local names).
  const plumRoot = demo.locator('[class*="primaryPlum"]').filter({ has: page.getByRole('tab', { name: 'Birds' }) })
  await expect(plumRoot).toHaveCount(1)
  await expect(plumRoot).not.toHaveClass(/segmented/)
  const indigoRoot = demo.locator('[class*="secondaryIndigo"]').filter({ has: page.getByRole('tab', { name: 'Visit' }) })
  await expect(indigoRoot).toHaveCount(1)
  await expect(indigoRoot).toHaveClass(/segmented/)
  await expect(indigoRoot).toHaveClass(/filled/)

  // One panel visible per set: the default tab's.
  await expect(demo.getByText('Primary plum: labels, bar and baseline.')).toBeVisible()
  await expect(demo.getByText('Secondary indigo: the filled cell and its edge.')).toBeVisible()
  await expect(demo.getByText('Sedges, milkweed and bur oak.')).toBeHidden()
  await expect(demo.getByText('Workdays run year round.')).toBeHidden()

  expect(pageErrors, 'the demo should mount without uncaught errors').toEqual([])
})

test('color switches panels by pointer and by keyboard, each set on its own', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const topics = demo.getByRole('tablist').filter({ has: page.getByRole('tab', { name: 'Birds' }) })
  const actions = demo.getByRole('tablist').filter({ has: page.getByRole('tab', { name: 'Visit' }) })

  // Pointer: choosing Plants shows its panel and leaves the other set alone.
  await topics.getByRole('tab', { name: 'Plants' }).click()
  await expect(topics.getByRole('tab', { name: 'Plants' })).toHaveAttribute('aria-selected', 'true')
  await expect(topics.getByRole('tab', { name: 'Birds' })).toHaveAttribute('aria-selected', 'false')
  await expect(demo.getByText('Sedges, milkweed and bur oak.')).toBeVisible()
  await expect(demo.getByText('Primary plum: labels, bar and baseline.')).toBeHidden()
  await expect(actions.getByRole('tab', { name: 'Visit' })).toHaveAttribute('aria-selected', 'true')

  // Keyboard: arrows move focus, Enter chooses (manual activation).
  await page.keyboard.press('ArrowRight')
  await expect(topics.getByRole('tab', { name: 'Insects' })).toBeFocused()
  await expect(topics.getByRole('tab', { name: 'Insects' })).toHaveAttribute('aria-selected', 'false')
  await page.keyboard.press('Enter')
  await expect(topics.getByRole('tab', { name: 'Insects' })).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByText('Monarchs and native bees.')).toBeVisible()

  // The segmented set by pointer, then keyboard back to its first cell.
  await actions.getByRole('tab', { name: 'Give' }).click()
  await expect(actions.getByRole('tab', { name: 'Give' })).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByText('Every gift stays local.')).toBeVisible()
  await page.keyboard.press('Home')
  await expect(actions.getByRole('tab', { name: 'Visit' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(actions.getByRole('tab', { name: 'Visit' })).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByText('Secondary indigo: the filled cell and its edge.')).toBeVisible()
  await expect(topics.getByRole('tab', { name: 'Insects' })).toHaveAttribute('aria-selected', 'true')

  expect(pageErrors, 'the demo should mount without uncaught errors').toEqual([])
})
