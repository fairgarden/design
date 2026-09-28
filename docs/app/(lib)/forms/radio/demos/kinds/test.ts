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

test('kinds chooses an option pill, never the disabled one', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  await expect(demo.getByRole('radiogroup')).toHaveCount(2)
  const pills = demo.getByRole('radiogroup', { name: 'How often do you hike?' })
  await expect(pills.getByRole('radio')).toHaveCount(4)
  const week = pills.getByRole('radio', { name: 'Every Week' })
  const month = pills.getByRole('radio', { name: 'Every Month' })
  const year = pills.getByRole('radio', { name: 'A Few Times a Year' })
  const never = pills.getByRole('radio', { name: 'Not Yet (unavailable)' })
  await expect(month).toHaveAttribute('aria-checked', 'true')
  await expect(week).toHaveAttribute('aria-checked', 'false')
  await expect(never).toBeDisabled()

  await pills.getByText('Every Week', { exact: true }).click()
  await expect(week).toHaveAttribute('aria-checked', 'true')
  await expect(month).toHaveAttribute('aria-checked', 'false')

  await week.focus()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await expect(year).toBeFocused()
  await expect(year).toHaveAttribute('aria-checked', 'true')
  await page.keyboard.press('ArrowDown')
  await expect(never).toHaveAttribute('aria-checked', 'false')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds swatches echo the chosen color name in the legend', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const legend = demo.getByText(/^Color: /)
  const swatches = demo.getByRole('radiogroup', { name: /^Color: / })
  await expect(legend).toHaveText('Color: Moss')
  await expect(swatches).toHaveAccessibleName('Color: Moss')
  await expect(swatches.getByRole('radio')).toHaveCount(5)
  for (const name of ['Moss', 'Rust', 'Slate', 'Oat', 'Ink']) {
    await expect(swatches.getByRole('radio', { name, exact: true })).toBeEnabled()
  }
  await expect(swatches.getByRole('radio', { name: 'Moss', exact: true })).toHaveAttribute(
    'aria-checked',
    'true',
  )

  const rust = swatches.getByRole('radio', { name: 'Rust', exact: true })
  await rust.click()
  await expect(rust).toHaveAttribute('aria-checked', 'true')
  await expect(swatches.getByRole('radio', { name: 'Moss', exact: true })).toHaveAttribute(
    'aria-checked',
    'false',
  )
  await expect(legend).toHaveText('Color: Rust')

  await rust.focus()
  await page.keyboard.press('ArrowRight')
  const slate = swatches.getByRole('radio', { name: 'Slate', exact: true })
  await expect(slate).toBeFocused()
  await expect(slate).toHaveAttribute('aria-checked', 'true')
  await expect(legend).toHaveText('Color: Slate')
  await expect(swatches).toHaveAccessibleName('Color: Slate')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
