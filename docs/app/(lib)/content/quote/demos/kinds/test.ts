import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('kinds composes five quotes as figures with blockquotes and captions', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // No pull quote duplicates the article, so every kind is a figure and none is a hidden aside.
  const figures = demo.getByRole('figure')
  await expect(figures).toHaveCount(5)
  await expect(demo.locator('aside')).toHaveCount(0)
  await expect(demo.locator('figure blockquote')).toHaveCount(5)
  // Only the band, framed and block quotes carry an attribution.
  await expect(demo.locator('figure > figcaption')).toHaveCount(3)

  // Outside a Ground, each root carries the default paper scope.
  for (let index = 0; index < 5; index++) {
    const figure = figures.nth(index)
    await expect(figure).toHaveAttribute('data-ground', 'paper')
    await expect(figure).toHaveAttribute('data-scheme', 'page')
  }

  // Band: a centered testimonial, the name over the role, no decorative marks.
  const band = figures.nth(0)
  await expect(band.locator('blockquote')).toHaveText(
    '“I came for the owls and stayed for the people who count them.”',
  )
  await expect(band.locator('figcaption')).toContainText('Ana Díaz')
  await expect(band.locator('figcaption')).toContainText('Volunteer since 2019')
  await expect(band.locator('figcaption')).not.toContainText('|')
  await expect(band.locator('[aria-hidden="true"]')).toHaveCount(0)

  // Framed: a heavy open-quote glyph hidden from assistive technology, and a portrait.
  const framed = figures.nth(1)
  const mark = framed.locator(':scope > [aria-hidden="true"]')
  await expect(mark).toHaveCount(1)
  await expect(mark).toHaveText('“')
  await expect(framed.locator('blockquote')).toHaveText(
    'The crew days are the best three hours of my month.',
  )
  const framedCaption = framed.locator('figcaption')
  await expect(framedCaption.getByText('BO', { exact: true })).toBeVisible()
  await expect(framedCaption.getByText('Ben Okafor', { exact: true })).toBeVisible()
  await expect(framedCaption.getByText('Trail crew lead', { exact: true })).toBeVisible()

  // Pull: closes with a short decorative rule inside the blockquote, no attribution.
  const pull = figures.nth(2)
  await expect(pull.locator('blockquote')).toHaveText(
    '“A meadow is a slow argument with the forest.”',
  )
  await expect(pull.locator('blockquote > [aria-hidden="true"]')).toHaveCount(1)
  await expect(pull.locator('figcaption')).toHaveCount(0)

  // Block: a quoted passage with a linked source in a cite.
  const block = figures.nth(3)
  await expect(block.locator('blockquote')).toContainText(
    'Burning in late winter keeps woody shrubs back',
  )
  const source = block.locator('figcaption cite')
  await expect(source).toHaveCount(1)
  const link = source.getByRole('link', { name: 'Prairie Management Handbook' })
  await expect(link).toHaveAttribute('href', '#kinds')
  await link.focus()
  await expect(link).toBeFocused()

  // Epigraph: one line, no marks and no attribution.
  const epigraph = figures.nth(4)
  await expect(epigraph.locator('blockquote')).toHaveText('Every trail is a promise to come back.')
  await expect(epigraph.locator('[aria-hidden="true"]')).toHaveCount(0)
  await expect(epigraph.locator('figcaption')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
