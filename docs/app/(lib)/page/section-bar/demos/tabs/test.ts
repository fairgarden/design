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

const sections = ['FairGarden', 'Community', 'Partners']

test('tabs shows the strip with Back to top on a white band', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.locator('#tabs-top')).toHaveAttribute('data-ground', 'white')
  const bar = demo.getByRole('navigation', { name: 'In this section' })
  // The bar takes the ground of the band it covers.
  await expect(bar).toHaveAttribute('data-ground', 'white')

  // From 1024 px the cells replace the breadcrumb and Jump to.
  await expect(bar.getByRole('navigation', { name: 'Breadcrumb' })).toBeHidden()
  await expect(bar.getByRole('button', { name: /^Jump to/ })).toBeHidden()
  const links = bar.getByRole('link')
  await expect(links).toHaveCount(sections.length + 1)
  await expect(links.first()).toHaveAccessibleName('Back to top')
  await expect(links.first()).toHaveAttribute('href', '#tabs-top')
  for (const [index, name] of sections.entries()) {
    const cell = bar.getByRole('link', { name, exact: true })
    await expect(cell).toHaveAttribute('href', `#tabs-${name.toLowerCase()}`)
    await expect(links.nth(index + 1)).toHaveText(name)
  }

  // The cell in view carries aria-current="location".
  await expect(bar.locator('[aria-current="location"]')).toHaveCount(1)
  await expect(bar.getByRole('link', { name: 'FairGarden', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  )

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('tabs jumps to a section by pointer and keyboard, and Back to top focuses the top', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const bar = demo.getByRole('navigation', { name: 'In this section' })

  // A click scrolls to the section, writes its hash and focuses its heading.
  await bar.getByRole('link', { name: 'Partners', exact: true }).click()
  await expect(page).toHaveURL(/#tabs-partners$/)
  await expect(demo.getByRole('heading', { level: 2, name: 'Partners' })).toBeFocused()

  // By keyboard.
  await bar.getByRole('link', { name: 'Community', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#tabs-community$/)
  await expect(demo.getByRole('heading', { level: 2, name: 'Community' })).toBeFocused()

  // Back to top moves focus to its target.
  const toTop = bar.getByRole('link', { name: 'Back to top' })
  await toTop.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#tabs-top$/)
  await expect(demo.locator('#tabs-top')).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test.describe('below 1024 px', () => {
  test.use({ viewport: { width: 800, height: 900 } })

  test('tabs falls back to the section bar', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    const demo = await openDemo(page)
    const bar = demo.getByRole('navigation', { name: 'In this section' })
    for (const name of sections) {
      await expect(bar.getByRole('link', { name, exact: true })).toBeHidden()
    }
    await expect(bar.getByRole('link', { name: 'Back to top' })).toBeHidden()
    const crumbs = bar.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(crumbs.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(crumbs.locator('[aria-current="page"]')).toHaveText('Contact')

    const trigger = bar.getByRole('button', { name: /^Jump to/ })
    await expect(trigger).toHaveAccessibleName('Jump to: FairGarden')
    await trigger.click()
    const panel = page.getByRole('navigation', { name: 'On this page' })
    await expect(panel.getByRole('link')).toHaveText(sections)
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(trigger).toBeFocused()

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})
