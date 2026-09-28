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

test('color gives each link its own primary and secondary', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const defaults = demo.getByRole('link', { name: 'olive × green' })
  const indigo = demo.getByRole('link', { name: 'secondary="indigo"' })
  const plum = demo.getByRole('link', { name: 'primary="plum" secondary="pink"' })

  for (const link of [defaults, indigo, plum]) {
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '#color')
  }
  await expect(demo.getByText('Scope defaults:')).toBeVisible()

  const style = (link: typeof defaults) =>
    link.evaluate((el) => {
      const s = getComputedStyle(el)
      return { color: s.color, underline: s.textDecorationColor }
    })
  const [a, b, c] = [await style(defaults), await style(indigo), await style(plum)]

  // The text stays the primary's step 12; the underline is the secondary's accent.
  expect(b.color, 'same primary, same text colour').toBe(a.color)
  expect(b.underline, 'a new secondary changes the underline').not.toBe(a.underline)
  expect(c.color, 'a new primary changes the text colour').not.toBe(a.color)
  expect(c.underline).not.toBe(a.underline)
  expect(c.underline).not.toBe(b.underline)

  // The links are reachable from the keyboard in reading order.
  await defaults.focus()
  await expect(defaults).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(indigo).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(plum).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
