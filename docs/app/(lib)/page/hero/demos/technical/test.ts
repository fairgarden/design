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

test('technical frames the title, install column and info cells on white', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const hero = demo.locator('header')
  await expect(hero).toHaveCount(1)
  await expect(hero).toHaveAttribute('data-ground', 'white')
  // No rail, photo or entry cards: the hero renders no exit seam.
  await expect(demo.locator('header + [data-ground]')).toHaveCount(0)
  await expect(hero.getByRole('figure')).toHaveCount(0)
  await expect(hero.getByRole('link')).toHaveCount(0)

  const title = demo.getByRole('heading', { level: 1 })
  await expect(title).toHaveCount(1)
  await expect(title).toHaveText('Hedgerow')
  await expect(hero.getByText('v1.3.0 · MIT · 3 kB', { exact: true })).toBeVisible()

  await expect(hero.getByRole('button')).toHaveCount(2)
  await expect(hero.getByRole('button', { name: 'Get Started' })).toBeEnabled()
  await expect(hero.getByRole('button', { name: 'Read the Docs' })).toBeEnabled()

  // The install column.
  await expect(hero.getByText('Install', { exact: true })).toBeVisible()
  await expect(hero.locator('code')).toHaveText('npm i hedgerow')

  // The info cells: a description list of four label/value pairs, in order.
  const list = hero.locator('dl')
  await expect(list).toHaveCount(1)
  const terms = list.getByRole('term')
  const values = list.getByRole('definition')
  await expect(terms).toHaveCount(4)
  await expect(values).toHaveCount(4)
  await expect(terms).toHaveText(['Size', 'Dependencies', 'Browsers', 'License'])
  await expect(values).toHaveText(['3 kB', '0', '98%', 'MIT'])

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('technical moves between its actions by keyboard', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)
  const hero = demo.locator('header')

  const start = hero.getByRole('button', { name: 'Get Started' })
  await start.focus()
  await expect(start).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(hero.getByRole('button', { name: 'Read the Docs' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(start).toBeFocused()

  await hero.getByRole('button', { name: 'Read the Docs' }).click()
  await expect(hero.getByRole('button', { name: 'Read the Docs' })).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
