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
  return demo.locator('[class*="__preview"]').first()
}

test('grounds shows the same sliders on paper and on the forest field', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.getByRole('slider')).toHaveCount(4)

  // The paper face follows the page mode; the forest field is always dark.
  const paper = demo.locator('[data-ground="paper"]:not([role="group"])').filter({ has: page.getByRole('slider') })
  const forest = demo.locator('[data-ground="forest"]:not([role="group"])').filter({ has: page.getByRole('slider') })
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
    await expect(ground.getByRole('slider')).toHaveCount(2)

    // Shade Cover: continuous, 45 of 0–100 with a percent readout; the root takes its ground's scope.
    const shade = ground.getByRole('group', { name: 'Shade Cover' })
    await expect(shade).toHaveAttribute('data-ground', name)
    const shadeThumb = shade.getByRole('slider', { name: 'Shade Cover' })
    await expect(shadeThumb).toHaveAttribute('aria-valuenow', '45')
    await expect(shade.locator('output')).toHaveText('45%')
    await shadeThumb.focus()
    await page.keyboard.press('ArrowRight')
    await expect(shadeThumb).toHaveAttribute('aria-valuenow', '46')
    await expect(shade.locator('output')).toHaveText('46%')

    // Trail Grade: stepped, 3 of 0–10, with the default major labels at the ends and midpoint.
    const grade = ground.getByRole('group', { name: 'Trail Grade' })
    await expect(grade).toHaveAttribute('data-ground', name)
    const gradeThumb = grade.getByRole('slider', { name: 'Trail Grade' })
    await expect(gradeThumb).toHaveAttribute('aria-valuenow', '3')
    await expect(gradeThumb).toHaveAttribute('max', '10')
    await expect(grade.locator('output')).toHaveText('3')
    for (const label of ['0', '5', '10']) {
      await expect(grade.locator('[aria-hidden="true"]').getByText(label, { exact: true })).toHaveCount(1)
    }
    await gradeThumb.focus()
    await page.keyboard.press('End')
    await expect(gradeThumb).toHaveAttribute('aria-valuenow', '10')
    await page.keyboard.press('Home')
    await expect(gradeThumb).toHaveAttribute('aria-valuenow', '0')
    await expect(grade.locator('output')).toHaveText('0')
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
