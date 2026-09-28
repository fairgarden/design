import path from 'node:path'
import { test, expect } from '@playwright/test'

// The page's route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test.describe('the table of contents bar below 1440px', () => {
  // Short enough that the panel scrolls, so centring means something.
  test.use({ viewport: { width: 1280, height: 700 } })

  test('names the section in view and opens its panel centred on it', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    await page.goto(route)
    const bar = page.getByRole('button', { name: /^On this page/ })
    await expect(bar).toContainText('The frame')

    // Halfway down the list, so the panel can centre it from either end.
    await page.locator('#the-table-of-contents').evaluate((heading) => heading.scrollIntoView({ block: 'start' }))
    await expect(bar).toContainText('The table of contents')

    await bar.click()
    const panel = page.getByRole('dialog', { name: 'On this page' })
    await expect(panel).toBeVisible()
    const current = panel.getByRole('link', { name: 'The table of contents' })
    await expect(current).toHaveAttribute('aria-current', 'location')
    await expect(current).toBeFocused()

    const offset = await current.evaluate((link) => {
      let scroller = link.parentElement
      while (scroller && !/auto|scroll/.test(getComputedStyle(scroller).overflowY)) scroller = scroller.parentElement
      if (scroller == null) throw new Error('the panel should scroll')
      const box = scroller.getBoundingClientRect()
      const target = link.getBoundingClientRect()
      return target.top + target.height / 2 - (box.top + box.height / 2)
    })
    expect(Math.abs(offset), 'the current section should sit in the middle of the panel').toBeLessThanOrEqual(1)

    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(bar).toBeFocused()

    expect(pageErrors, 'the page should run without uncaught errors').toEqual([])
  })
})
