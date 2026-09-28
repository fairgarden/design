import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('grounds scopes each breadcrumb to its ground', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // A light page ground, a pastel, a deep field and a saturated field.
  const navs = demo.getByRole('navigation', { name: 'Breadcrumb' })
  await expect(navs).toHaveCount(4)

  for (let index = 0; index < 4; index += 1) {
    const nav = navs.nth(index)
    // The breadcrumb's parent is its Ground, captioned with the preset's name.
    const ground = nav.locator('xpath=..')
    const preset = await ground.getAttribute('data-ground')
    expect(preset, 'each sample is a Ground').toBeTruthy()
    await expect(ground.locator('p').first()).toHaveText(preset!)

    // The breadcrumb root carries the scope it sits in.
    await expect(nav).toHaveAttribute('data-ground', preset!)
    await expect(nav).toHaveAttribute('data-tone', (await ground.getAttribute('data-tone'))!)
    await expect(nav).toHaveAttribute('data-scheme', (await ground.getAttribute('data-scheme'))!)

    // The staircase's one line at this width: two linked ancestors, then the current page.
    for (const name of ['Home', 'Guides']) {
      const link = nav.getByRole('link', { name, exact: true }).filter({ visible: true })
      await expect(link).toHaveCount(1)
      await expect(link).toHaveAttribute('href', '#grounds')
    }
    const current = nav.locator('[aria-current="page"]').filter({ visible: true })
    await expect(current).toHaveCount(1)
    await expect(current).toHaveText('Warblers of the Northeast')
    await expect(current.getByRole('link')).toHaveCount(0)
  }

  // Page grounds follow the page; the fields fix their mode.
  await expect(navs.nth(0)).toHaveAttribute('data-tone', 'light-base')
  await expect(navs.nth(1)).toHaveAttribute('data-tone', 'tinted')
  await expect(navs.nth(2).locator('xpath=..')).toHaveAttribute('data-theme', 'dark')
  await expect(navs.nth(2)).toHaveAttribute('data-scheme', 'dark')
  await expect(navs.nth(3).locator('xpath=..')).toHaveAttribute('data-theme', 'light')
  await expect(navs.nth(3)).toHaveAttribute('data-scheme', 'light')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
