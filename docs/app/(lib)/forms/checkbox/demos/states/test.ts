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
  // Scope to the preview surface; the code panel repeats the demo's text.
  return demo.locator('[class*="__preview"]').first()
}

test('states shows rest, checked, disabled and read-only boxes', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const box = (name: string | RegExp) => demo.getByRole('checkbox', { name })

  const email = box('Email Updates')
  const reports = box(/Trail Reports/)
  const catalog = box('Printed Catalog')
  const newsletter = box('Member Newsletter')
  const terms = box('Terms Accepted')

  await expect(email).toBeChecked()
  await expect(reports).not.toBeChecked()
  await expect(demo.getByText('One message a week, at most.')).toBeVisible()
  await expect(catalog).not.toBeChecked()
  await expect(catalog).toHaveAttribute('aria-disabled', 'true')
  await expect(newsletter).toBeChecked()
  await expect(newsletter).toHaveAttribute('aria-disabled', 'true')
  await expect(terms).toBeChecked()
  await expect(terms).toHaveAttribute('aria-readonly', 'true')

  // Space and the label row toggle an enabled box; Enter does not.
  await email.focus()
  await page.keyboard.press('Space')
  await expect(email).not.toBeChecked()
  await page.keyboard.press('Enter')
  await expect(email).not.toBeChecked()
  await demo.getByText('Trail Reports', { exact: true }).click()
  await expect(reports).toBeChecked()

  // Disabled and read-only boxes keep their state.
  await demo.getByText('Printed Catalog', { exact: true }).click({ force: true })
  await expect(catalog).not.toBeChecked()
  await demo.getByText('Member Newsletter', { exact: true }).click({ force: true })
  await expect(newsletter).toBeChecked()
  await terms.click()
  await expect(terms).toBeChecked()
  await terms.focus()
  await page.keyboard.press('Space')
  await expect(terms).toBeChecked()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states parent turns indeterminate while only some trails are ticked', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const group = demo.getByRole('group', { name: 'Trails to Walk' })
  await expect(group.getByRole('checkbox')).toHaveCount(5)

  const all = group.getByRole('checkbox', { name: 'All Trails' })
  const trail = (name: string) => group.getByRole('checkbox', { name })
  const children = ['Ridge Loop', 'River Walk', 'Meadow Path', 'Summit Trail'].map(trail)

  await expect(all).toHaveAttribute('aria-checked', 'mixed')
  await expect(trail('Ridge Loop')).toBeChecked()
  for (const child of children.slice(1)) await expect(child).not.toBeChecked()

  // The parent ticks every trail from the indeterminate state.
  await all.click()
  await expect(all).toHaveAttribute('aria-checked', 'true')
  for (const child of children) await expect(child).toBeChecked()

  // Unticking one child makes the parent indeterminate again.
  await trail('River Walk').focus()
  await page.keyboard.press('Space')
  await expect(trail('River Walk')).not.toBeChecked()
  await expect(all).toHaveAttribute('aria-checked', 'mixed')

  // Ticking it back makes the parent checked.
  await group.getByText('River Walk', { exact: true }).click()
  await expect(all).toHaveAttribute('aria-checked', 'true')

  // Unticking every child leaves the parent unchecked.
  for (const child of children) await child.click()
  for (const child of children) await expect(child).not.toBeChecked()
  await expect(all).toHaveAttribute('aria-checked', 'false')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
