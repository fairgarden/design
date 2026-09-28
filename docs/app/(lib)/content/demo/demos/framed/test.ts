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
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return { demo, pageErrors }
}

test('framed renders its banner in the preview above its two files', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  // The banner: the day's tag, the line and the call to action, in the live preview.
  await expect(demo.getByText('Saturday', { exact: true })).toBeVisible()
  await expect(demo.locator('[class*="__preview"]').first().getByText('Twelve volunteers are planting the orchard.')).toBeVisible()
  const join = demo.getByRole('button', { name: 'Join the Crew' })
  await expect(join).toBeVisible()
  await join.focus()
  await expect(join).toBeFocused()

  const files = demo.getByRole('tablist', { name: 'Files' })
  await expect(files.getByRole('tab')).toHaveCount(2)
  const source = files.getByRole('tab', { name: /CrewBanner\.tsx/ })
  const styles = files.getByRole('tab', { name: /crew-banner\.module\.css/ })
  await expect(source).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByRole('tabpanel')).toContainText('export function CrewBanner()')

  // Arrow keys move between the file tabs.
  await source.focus()
  await page.keyboard.press('ArrowRight')
  await expect(styles).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(styles).toHaveAttribute('aria-selected', 'true')
  await expect(demo.getByRole('tabpanel')).toContainText('.banner')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
