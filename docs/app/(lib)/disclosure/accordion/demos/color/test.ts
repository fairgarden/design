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

test('color shows the plum and headed slate accordions', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const plumOpen = demo.getByRole('button', { name: 'Primary plum' })
  const collapsed = demo.getByRole('button', { name: 'Collapsed glyph' })
  const slate = demo.getByRole('button', { name: 'Primary slate, headed' })

  // Accordion triggers are the buttons inside the row headings.
  await expect(demo.getByRole('heading', { level: 3 }).getByRole('button')).toHaveCount(3)
  for (const name of ['Primary plum', 'Collapsed glyph', 'Primary slate, headed']) {
    await expect(demo.getByRole('heading', { level: 3, name })).toBeVisible()
  }

  // Only the plum accordion's first item starts open.
  await expect(plumOpen).toHaveAttribute('aria-expanded', 'true')
  await expect(demo.getByRole('region', { name: 'Primary plum' })).toContainText(
    'Rules, titles, glyph and panel text re-resolve together.',
  )
  await expect(collapsed).toHaveAttribute('aria-expanded', 'false')
  await expect(demo.getByText('The collapsed glyph is the muted step')).toBeHidden()
  await expect(slate).toHaveAttribute('aria-expanded', 'false')
  await expect(demo.getByText('The strong top rule is the text step')).toBeHidden()

  // Only the slate accordion draws the strong top rule (CSS Module local names are stable).
  await expect(demo.locator('[class*="headed"]')).toHaveCount(1)
  await expect(demo.locator('[class*="headed"]')).toContainText('Primary slate, headed')

  // The two accordions resolve different ink for their titles.
  const plumColor = await plumOpen.evaluate((el) => getComputedStyle(el).color)
  const slateColor = await slate.evaluate((el) => getComputedStyle(el).color)
  expect(plumColor).not.toEqual(slateColor)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('color toggles items by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const plumOpen = demo.getByRole('button', { name: 'Primary plum' })
  const collapsed = demo.getByRole('button', { name: 'Collapsed glyph' })
  const slate = demo.getByRole('button', { name: 'Primary slate, headed' })

  await collapsed.click()
  await expect(collapsed).toHaveAttribute('aria-expanded', 'true')
  await expect(demo.getByText('The collapsed glyph is the muted step')).toBeVisible()
  // Several items may be open at once.
  await expect(plumOpen).toHaveAttribute('aria-expanded', 'true')

  await slate.focus()
  await page.keyboard.press('Enter')
  await expect(slate).toHaveAttribute('aria-expanded', 'true')
  await expect(demo.getByText('The strong top rule is the text step')).toBeVisible()
  await page.keyboard.press('Space')
  await expect(slate).toHaveAttribute('aria-expanded', 'false')
  await expect(demo.getByText('The strong top rule is the text step')).toBeHidden()
  await expect(slate).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
