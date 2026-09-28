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

test('variants shows more and less by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  await expect(demo.getByRole('button')).toHaveCount(3)

  // "Show more": four preserves listed, four more held in the closed panel.
  const more = demo.getByRole('button', { name: 'Show 4 more' })
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await expect(demo.getByRole('listitem')).toHaveCount(4)
  await expect(demo.getByText('Bluestem Prairie')).toBeVisible()
  await expect(demo.getByText('Fox Run')).toBeHidden()

  await more.click()
  await expect(more).toHaveAttribute('aria-expanded', 'true')
  await expect(more).toHaveAccessibleName('Show less')
  await expect(demo.getByRole('listitem')).toHaveCount(8)
  await expect(demo.getByText('Sandhill Flats')).toBeVisible()

  await more.focus()
  await page.keyboard.press('Enter')
  await expect(more).toHaveAttribute('aria-expanded', 'false')
  await expect(more).toHaveAccessibleName('Show 4 more')
  await expect(demo.getByRole('listitem')).toHaveCount(4)
  await expect(more).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('variants opens by default and holds a disabled trigger shut', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  // Open by default; no open label, so the label stays.
  const deed = demo.getByRole('button', { name: 'Deed restrictions' })
  const deedCopy = demo.getByText('No subdivision, no new structures, and no removal of native trees.')
  await expect(deed).toHaveAttribute('aria-expanded', 'true')
  await expect(deedCopy).toBeVisible()
  await deed.focus()
  await page.keyboard.press('Space')
  await expect(deed).toHaveAttribute('aria-expanded', 'false')
  await expect(deed).toHaveAccessibleName('Deed restrictions')
  await expect(deedCopy).toBeHidden()
  await expect(deed).toBeFocused()
  await deed.click()
  await expect(deed).toHaveAttribute('aria-expanded', 'true')
  await expect(deedCopy).toBeVisible()

  // Disabled: the trigger is disabled and its panel never opens.
  const survey = demo.getByRole('button', { name: 'Survey records (unavailable)' })
  await expect(survey).toBeDisabled()
  await expect(survey).toHaveAttribute('data-disabled', '')
  await expect(survey).toHaveAttribute('aria-expanded', 'false')
  await survey.click({ force: true })
  await expect(survey).toHaveAttribute('aria-expanded', 'false')
  await expect(demo.getByText('Not shown.')).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
