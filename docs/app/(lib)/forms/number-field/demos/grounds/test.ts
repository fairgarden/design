import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('grounds shows the same fields on paper and on the forest field', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demoRoot = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demoRoot.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  // Scope to the preview surface; the code panel also carries grounds, buttons and text.
  const demo = demoRoot.locator('[class*="__preview"]').first()

  // The paper face follows the page mode; the forest field is always dark.
  const paper = demo.locator('section[data-ground="paper"]').filter({ has: page.getByRole('textbox') })
  const forest = demo.locator('section[data-ground="forest"]').filter({ has: page.getByRole('textbox') })
  await expect(paper).toHaveCount(1)
  await expect(forest).toHaveCount(1)
  await expect(paper).toHaveAttribute('data-scheme', 'page')
  await expect(paper).not.toHaveAttribute('data-theme')
  await expect(forest).toHaveAttribute('data-scheme', 'dark')
  await expect(forest).toHaveAttribute('data-theme', 'dark')

  for (const [name, ground] of [
    ['paper', paper],
    ['forest', forest],
  ] as const) {
    await expect(ground.getByText(name, { exact: true })).toBeVisible()
    await expect(ground.getByRole('textbox')).toHaveCount(2)

    // Each number field root takes its ground's scope.
    const campers = ground.getByRole('textbox', { name: 'Campers' })
    const group = campers.locator('xpath=ancestor::*[@role="group"][1]')
    await expect(group.locator('xpath=..')).toHaveAttribute('data-ground', name)

    // The stepper: 2 of 1–8, both cells enabled; it steps by pointer and keyboard.
    const decrease = group.getByRole('button', { name: 'Decrease' })
    const increase = group.getByRole('button', { name: 'Increase' })
    await expect(campers).toHaveValue('2')
    await expect(decrease).toBeEnabled()
    await expect(increase).toBeEnabled()
    await decrease.click()
    await expect(campers).toHaveValue('1')
    await expect(decrease).toBeDisabled()
    await campers.focus()
    await page.keyboard.press('End')
    await expect(campers).toHaveValue('8')
    await expect(increase).toBeDisabled()

    // The amount: a km suffix and no step cells.
    const distance = ground.getByRole('textbox', { name: 'Distance' })
    const distanceGroup = distance.locator('xpath=ancestor::*[@role="group"][1]')
    await expect(distance).toHaveValue('12')
    await expect(distanceGroup.getByText('km')).toBeVisible()
    await expect(distanceGroup.getByRole('button')).toHaveCount(0)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
