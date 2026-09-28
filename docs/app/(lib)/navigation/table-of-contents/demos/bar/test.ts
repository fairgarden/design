import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

async function open(page: Page) {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const bar = demo.getByRole('button', { name: /^On this page/ })
  // The panel is portaled outside the demo.
  const panel = page.getByRole('dialog', { name: 'On this page' })
  return { demo, bar, panel, pageErrors }
}

test('bar names the section in view and opens, marks and closes from the keyboard', async ({
  page,
}) => {
  const { bar, panel, pageErrors } = await open(page)

  // The bar names the first section at the top of the page, closed.
  await expect(bar).toContainText('On this page')
  await expect(bar).toContainText('Why save seed')
  await expect(bar).not.toHaveAttribute('aria-expanded', 'true')
  await expect(panel).toHaveCount(0)

  await bar.focus()
  await page.keyboard.press('Enter')
  await expect(panel).toBeVisible()
  await expect(bar).toHaveAttribute('aria-expanded', 'true')
  await expect(bar).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!)

  // The whole list, in the panel's nav; the section in view is marked and focused.
  const nav = panel.getByRole('navigation', { name: 'On this page' })
  await expect(nav.getByRole('link')).toHaveCount(22)
  const currentLink = nav.getByRole('link', { name: 'Why save seed', exact: true })
  await expect(currentLink).toHaveAttribute('aria-current', 'location')
  await expect(nav.locator('[aria-current]')).toHaveCount(1)
  await expect(currentLink).toBeFocused()

  // Escape closes the panel and focus returns to the bar.
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(bar).toBeFocused()
  await expect(bar).not.toHaveAttribute('aria-expanded', 'true')

  // Following an entry from the keyboard goes to its heading and closes the panel.
  await page.keyboard.press('Enter')
  await expect(panel).toBeVisible()
  const beans = nav.getByRole('link', { name: 'Beans and peas', exact: true })
  await beans.focus()
  await page.keyboard.press('Enter')
  await expect(panel).toBeHidden()
  await expect(page.getByRole('heading', { name: 'Beans and peas', level: 2 })).toBeFocused()
  await expect(bar).toContainText('Beans and peas')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('bar follows an entry and dismisses by pointer', async ({ page }) => {
  const { demo, bar, panel, pageErrors } = await open(page)

  await bar.click()
  await expect(panel).toBeVisible()

  // A press on an entry goes to its heading, closes the panel and names it in the bar.
  await panel.getByRole('link', { name: 'Fermenting the seed', exact: true }).click()
  await expect(panel).toBeHidden()
  const heading = demo.getByRole('heading', { name: 'Fermenting the seed', level: 3 })
  await expect(heading).toBeFocused()
  await expect(heading).toBeInViewport()
  await expect(bar).toContainText('Fermenting the seed')

  // Reopened, the new section is the marked, focused one.
  await bar.click()
  await expect(panel).toBeVisible()
  const marked = panel.getByRole('link', { name: 'Fermenting the seed', exact: true })
  await expect(marked).toHaveAttribute('aria-current', 'location')
  await expect(marked).toBeFocused()
  await expect(panel.getByRole('link', { name: 'Why save seed', exact: true })).not.toHaveAttribute(
    'aria-current',
    /.*/,
  )

  // A press outside closes it.
  await page.mouse.click(1, 1)
  await expect(panel).toBeHidden()
  await expect(bar).not.toHaveAttribute('aria-expanded', 'true')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
