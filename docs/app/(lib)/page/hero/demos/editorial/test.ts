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

test('editorial renders the type-only hero and the night media hero with its entry cards', async ({
  page,
}) => {
  const { demo, pageErrors } = await openDemo(page)

  // Two heroes, each a header with its own h1.
  const headers = demo.locator('header')
  await expect(headers).toHaveCount(2)
  const titles = demo.getByRole('heading', { level: 1 })
  await expect(titles).toHaveCount(2)
  await expect(titles.nth(0)).toHaveText('Gardens for good, for everyone')
  await expect(titles.nth(0).locator('em')).toHaveText('for everyone')
  await expect(titles.nth(1)).toHaveText('The prairie, one acre at a time')

  // A: eyebrow, lede and the solid pill with its outline twin.
  const typeOnly = headers.nth(0)
  await expect(typeOnly.getByText('Annual report', { exact: true })).toBeVisible()
  await expect(
    typeOnly.getByText('Ten years of shared plots, open gates and neighbors who kept them.'),
  ).toBeVisible()
  await expect(typeOnly.getByRole('button')).toHaveCount(2)
  await expect(typeOnly.getByRole('button', { name: 'Read the Report' })).toBeEnabled()
  await expect(typeOnly.getByRole('button', { name: 'Download PDF' })).toBeEnabled()
  await expect(typeOnly.getByRole('img')).toHaveCount(0)

  // The media hero sits on the night band, which fixes dark mode.
  const media = headers.nth(1)
  await expect(media).toHaveAttribute('data-ground', 'night')
  await expect(media).toHaveAttribute('data-theme', 'dark')
  const figure = media.getByRole('figure')
  await expect(
    figure.getByRole('img', { name: 'Tallgrass prairie at dawn under a low sun' }),
  ).toBeVisible()
  await expect(figure.locator('figcaption')).toHaveText(
    'Cedar Bend Prairie, Illinois. Photo: A. Rivera',
  )

  // The exit seam on white carries the three entry cards, each with one link.
  const seam = demo.locator('header[data-ground="night"] + [data-ground="white"]')
  await expect(seam).toHaveCount(1)
  const cards = seam.getByRole('listitem')
  await expect(cards).toHaveCount(3)
  const links = seam.getByRole('link')
  await expect(links).toHaveCount(3)
  const entries = [
    ['Program', 'Protect your land'],
    ['Events', 'Harvest Gathering 2026'],
    ['Resources', 'The garden handbook'],
  ] as const
  for (const [index, [category, title]] of entries.entries()) {
    await expect(cards.nth(index)).toContainText(category)
    const link = cards.nth(index).getByRole('link', { name: title })
    await expect(link).toHaveAttribute('href', '#editorial')
  }
  // The square images are decorative.
  await expect(seam.getByRole('img')).toHaveCount(0)

  // The white band below.
  await expect(
    demo.getByText('The white band below opens with its section space', { exact: false }),
  ).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('editorial follows its entry links by keyboard and pointer', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)
  const seam = demo.locator('header[data-ground="night"] + [data-ground="white"]')

  const first = seam.getByRole('link', { name: 'Protect your land' })
  await first.focus()
  await expect(first).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#editorial$/)

  // Tab moves on to the next card's link.
  await page.keyboard.press('Tab')
  await expect(seam.getByRole('link', { name: 'Harvest Gathering 2026' })).toBeFocused()

  await seam.getByRole('link', { name: 'The garden handbook' }).click()
  await expect(page).toHaveURL(/#editorial$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
