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

const sections = [
  'What neighbor-led stewardship means',
  'Who tends the plots',
  'How new gardens begin',
]

test('section shows the inline breadcrumb and the live Jump label', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const bar = demo.getByRole('navigation', { name: 'In this section' })
  await expect(bar).toBeVisible()
  await expect(bar.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'horizontal')

  // From 768 px the inline breadcrumb replaces the glyph and caps title.
  const crumbs = bar.getByRole('navigation', { name: 'Breadcrumb' })
  await expect(crumbs).toBeVisible()
  for (const name of ['Home', 'Resources', 'Guides']) {
    await expect(crumbs.getByRole('link', { name })).toHaveAttribute('href', '#bar-what')
  }
  await expect(crumbs.locator('[aria-current="page"]')).toHaveText('Neighbor-led stewardship')
  await expect(bar.getByRole('button', { name: 'Page path' })).toBeHidden()

  // The Jump label names the section in view, and the polite region announces it.
  const trigger = bar.getByRole('button', { name: /^Jump to/ })
  await expect(trigger).toHaveAccessibleName(`Jump to: ${sections[0]}`)
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(bar.locator('[aria-live="polite"]')).toHaveText(sections[0])

  // One heading per section.
  for (const name of sections) {
    await expect(demo.getByRole('heading', { level: 2, name })).toBeVisible()
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('section Jump panel opens, closes on Escape and follows a section by keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const bar = demo.getByRole('navigation', { name: 'In this section' })
  const trigger = bar.getByRole('button', { name: /^Jump to/ })
  const panel = page.getByRole('navigation', { name: 'On this page' })

  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(panel).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  const links = panel.getByRole('link')
  await expect(links).toHaveText(sections)
  await expect(links.first()).toHaveAttribute('aria-current', 'location')
  await expect(panel.locator('[aria-current="location"]')).toHaveCount(1)

  // Escape closes it and returns focus to the trigger.
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()

  // Tab moves into the list; following a link closes the panel and focuses its heading.
  await page.keyboard.press('Enter')
  await expect(panel).toBeVisible()
  await page.keyboard.press('Tab')
  const focused = panel.locator('a:focus')
  await expect(focused).toHaveCount(1)
  const label = (await focused.textContent())!.trim()
  const href = await focused.getAttribute('href')
  await page.keyboard.press('Enter')
  await expect(panel).toBeHidden()
  await expect(demo.getByRole('heading', { level: 2, name: label })).toBeFocused()
  await expect(page).toHaveURL(new RegExp(`${href}$`))

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('section Jump panel follows a section by pointer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const trigger = demo
    .getByRole('navigation', { name: 'In this section' })
    .getByRole('button', { name: /^Jump to/ })
  const panel = page.getByRole('navigation', { name: 'On this page' })

  await trigger.click()
  await expect(panel).toBeVisible()
  await panel.getByRole('link', { name: 'How new gardens begin' }).click()
  await expect(panel).toBeHidden()
  await expect(demo.getByRole('heading', { level: 2, name: 'How new gardens begin' })).toBeFocused()
  await expect(page).toHaveURL(/#bar-how$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test.describe('below 768 px', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('section opens the staircase from the glyph and titles the section in view', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    const demo = await openDemo(page)
    const bar = demo.getByRole('navigation', { name: 'In this section' })
    await expect(bar.getByRole('navigation', { name: 'Breadcrumb' })).toBeHidden()
    await expect(bar.getByText(sections[0], { exact: true }).first()).toBeVisible()
    await expect(bar.getByRole('button', { name: /^Jump to/ })).toHaveAccessibleName('Jump to')

    const glyph = bar.getByRole('button', { name: 'Page path' })
    await expect(glyph).toHaveAttribute('aria-expanded', 'false')
    await glyph.click()
    await expect(glyph).toHaveAttribute('aria-expanded', 'true')
    for (const name of ['Home', 'Resources', 'Guides']) {
      await expect(bar.getByRole('link', { name })).toBeVisible()
    }
    await expect(bar.locator('[aria-current="page"]:visible')).toHaveText('Neighbor-led stewardship')

    // Enter on the focused glyph closes it again.
    await glyph.focus()
    await page.keyboard.press('Enter')
    await expect(glyph).toHaveAttribute('aria-expanded', 'false')
    await expect(bar.getByRole('link', { name: 'Home' })).toBeHidden()

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})
