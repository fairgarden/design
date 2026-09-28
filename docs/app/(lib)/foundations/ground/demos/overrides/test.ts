import path from 'node:path'
import { test, expect, type Locator, type Page } from '@playwright/test'

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

/** The computed color of the face's section head and its edge (--role-edge on a face: --primary10). */
async function paints(face: Locator) {
  return face.evaluate((node) => {
    const head = node.querySelector('span')!
    return {
      heading: getComputedStyle(head).color,
      edge: getComputedStyle(node).borderTopColor,
    }
  })
}

test('overrides shows three paper faces with their scales', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  // Ground renders a section; the Link and Separator roots inside may write data-ground too.
  const faces = demo.locator('section[data-ground]')
  await expect(faces).toHaveCount(3)

  const expected = [
    { head: 'Defaults', link: 'olive × green' },
    { head: 'secondary="indigo"', link: 'olive × indigo' },
    { head: 'primary="slate"', link: 'slate × amber' },
  ]
  for (const [index, { head, link }] of expected.entries()) {
    const face = faces.nth(index)
    // Overrides change the scales, never the scope: each stays a paper face that follows the page.
    await expect(face).toHaveAttribute('data-ground', 'paper')
    await expect(face).toHaveAttribute('data-tone', 'light-base')
    await expect(face).toHaveAttribute('data-scheme', 'page')
    await expect(face).not.toHaveAttribute('data-theme', /.*/)
    await expect(face.getByText(head, { exact: true })).toBeVisible()
    await expect(face.getByRole('separator')).toHaveCount(1)
    await expect(face.getByRole('link', { name: link })).toHaveAttribute('href', '#overrides')
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('overrides re-resolves the section head and edge from the new scales', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const faces = demo.locator('section[data-ground]')
  await expect(faces).toHaveCount(3)
  const [defaults, indigo, slate] = await Promise.all([0, 1, 2].map((index) => paints(faces.nth(index))))

  // The section head takes the secondary: green, indigo and amber are three different heads.
  expect(indigo.heading).not.toBe(defaults.heading)
  expect(slate.heading).not.toBe(defaults.heading)
  expect(slate.heading).not.toBe(indigo.heading)
  // The edge takes the primary: a secondary override keeps olive, a primary override moves it.
  expect(indigo.edge).toBe(defaults.edge)
  expect(slate.edge).not.toBe(defaults.edge)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('overrides moves through its links from the keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const first = demo.getByRole('link', { name: 'olive × green' })
  await first.focus()
  await expect(first).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(demo.getByRole('link', { name: 'olive × indigo' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(demo.getByRole('link', { name: 'slate × amber' })).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
