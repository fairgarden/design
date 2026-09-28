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

test('guide lays out search, the breadcrumb, Jump to and Listen', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const bar = demo.getByRole('navigation', { name: 'In this section' })
  await expect(bar).toBeVisible()

  await expect(bar.getByRole('combobox', { name: 'Search the guide' })).toBeVisible()

  const crumbs = bar.getByRole('navigation', { name: 'Breadcrumb' })
  await expect(crumbs.getByRole('link', { name: 'Field guide' })).toHaveAttribute('href', '#guide-overview')
  await expect(crumbs.getByRole('link', { name: 'Thrushes' })).toHaveAttribute('href', '#guide-overview')
  await expect(crumbs.locator('[aria-current="page"]')).toHaveText('Wood Thrush')

  const trigger = bar.getByRole('button', { name: /^Jump to/ })
  await expect(trigger).toHaveAccessibleName('Jump to: Overview')

  const listen = bar.getByRole('link', { name: /^Listen/ })
  await expect(listen).toHaveAttribute('href', '#guide-recordings')
  await expect(listen).toContainText('6')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('guide search suggests matching birds and closes on Escape', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const search = demo
    .getByRole('navigation', { name: 'In this section' })
    .getByRole('combobox', { name: 'Search the guide' })

  await search.click()
  await search.fill('Veery')
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await expect(listbox.getByRole('option', { name: /Veery/ })).toBeVisible()
  await expect(listbox.getByRole('option', { name: /Wood Thrush/ })).toHaveCount(0)
  await expect(search).toHaveAttribute('aria-expanded', 'true')

  await page.keyboard.press('Escape')
  await expect(listbox).toBeHidden()
  await expect(search).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('guide Listen and Jump to move focus to the section heading', async ({ page }) => {
  test.fixme(true, 'Known bug: following the Listen link writes #guide-recordings but leaves focus on body instead of the Songs and calls heading.')
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const bar = demo.getByRole('navigation', { name: 'In this section' })

  // Listen by pointer.
  await bar.getByRole('link', { name: /^Listen/ }).click()
  await expect(page).toHaveURL(/#guide-recordings$/)
  await expect(demo.getByRole('heading', { level: 2, name: 'Songs and calls' })).toBeFocused()

  // Jump to by keyboard: Escape closes it with focus back on the trigger.
  const trigger = bar.getByRole('button', { name: /^Jump to/ })
  const panel = page.getByRole('navigation', { name: 'On this page' })
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(panel).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(panel.getByRole('link')).toHaveText(['Overview', 'Songs and calls'])
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(trigger).toBeFocused()

  // Following Overview closes the panel and focuses its heading.
  await trigger.click()
  await expect(panel).toBeVisible()
  await panel.getByRole('link', { name: 'Overview' }).focus()
  await page.keyboard.press('Enter')
  await expect(panel).toBeHidden()
  await expect(page).toHaveURL(/#guide-overview$/)
  await expect(demo.getByRole('heading', { level: 2, name: 'Overview' })).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
