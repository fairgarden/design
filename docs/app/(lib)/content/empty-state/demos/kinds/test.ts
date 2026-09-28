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
  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return demo
}

test('kinds renders framed, illustrated and inline empty states', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await open(page)
  // Each empty state root writes its scope attributes; the innermost div holding its text.
  const root = (text: string) =>
    demo
      .locator('[class*="__preview"]')
      .first()
      .locator('div[data-ground]')
      .filter({ hasText: text })
      .last()

  // Two headings (h3) and two actions; the inline kind has neither.
  const headings = demo.getByRole('heading', { level: 3 })
  await expect(headings).toHaveText(['No saved trails yet', 'No sightings this week'])
  const preview = demo.locator('[class*="__preview"]').first()
  await expect(preview.getByRole('button')).toHaveText(['Browse Trails', 'Log a Sighting'])

  // Framed (default): the dashed frame outline and the decorative trail, an outline action.
  const framed = root('No saved trails yet')
  await expect(framed).toHaveClass(/framed/)
  await expect(framed).toHaveAttribute('data-ground', 'paper')
  await expect(framed.locator(':scope > div > svg[aria-hidden="true"] > rect')).toHaveCount(1)
  await expect(
    framed.getByText('Save a trail from its page and it will wait for you here.'),
  ).toBeVisible()
  const browse = framed.getByRole('button', { name: 'Browse Trails', exact: true })
  await expect(browse).toBeEnabled()
  await expect(browse).toHaveClass(/outline/)

  // Illustrated: framed too, with a decorative sticker drawing and the solid action.
  const illustrated = root('No sightings this week')
  await expect(illustrated).toHaveClass(/illustrated/)
  await expect(illustrated).not.toHaveClass(/framed/)
  await expect(illustrated.locator(':scope > div > svg[aria-hidden="true"] > rect')).toHaveCount(1)
  const drawing = illustrated.locator('div[aria-hidden="true"]:has(svg[viewBox="0 0 152 152"])')
  await expect(drawing).toHaveCount(1)
  await expect(drawing).toBeVisible()
  await expect(illustrated.getByText('Be the first to log a bird on the preserve.')).toBeVisible()
  const log = illustrated.getByRole('button', { name: 'Log a Sighting', exact: true })
  await expect(log).toBeEnabled()
  await expect(log).toHaveClass(/solid/)

  // A drawing or a trail, never both: the framed one has no sticker art.
  await expect(framed.locator('svg[viewBox="0 0 152 152"]')).toHaveCount(0)

  // Inline: one sentence, no frame, heading or action.
  const inline = root('Readings will appear here after the first sync.')
  await expect(inline).toHaveClass(/inline/)
  await expect(inline.locator('svg')).toHaveCount(0)
  await expect(inline.getByRole('heading')).toHaveCount(0)
  await expect(inline.getByRole('button')).toHaveCount(0)
  await expect(inline.getByText('Readings will appear here after the first sync.')).toBeVisible()

  // None of them is a status region unless filtered.
  for (const r of [framed, illustrated, inline]) await expect(r).not.toHaveAttribute('role', /.+/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds reaches both actions by keyboard and pointer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await open(page)
  const browse = demo.getByRole('button', { name: 'Browse Trails', exact: true })
  const log = demo.getByRole('button', { name: 'Log a Sighting', exact: true })

  // The decorative trail and drawing take no focus: Tab goes straight to the next action.
  await browse.focus()
  await expect(browse).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(log).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(browse).toBeFocused()

  await log.click()
  await expect(log).toBeFocused()
  await expect(demo.locator('[class*="__preview"]').first().getByRole('button')).toHaveCount(2)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
