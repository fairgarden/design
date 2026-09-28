import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('grounds frames the quote on paper and forest and holds a band on clay', async ({
  page,
}) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  await expect(demo.locator('section[data-ground]')).toHaveCount(3)
  await expect(demo.getByRole('figure')).toHaveCount(3)

  const samples = [
    // A page ground follows the mode and writes no theme.
    { preset: 'paper', label: 'paper', theme: null, scheme: 'page', framed: true },
    // A deep field fixes dark; the frame and text turn light on their own.
    { preset: 'forest', label: 'forest field', theme: 'dark', scheme: 'dark', framed: true },
    // A saturated field fixes light and holds the band only.
    { preset: 'clay', label: 'clay field', theme: 'light', scheme: 'light', framed: false },
  ] as const

  for (const sample of samples) {
    const ground = demo.locator(`section[data-ground="${sample.preset}"]`)
    await expect(ground).toHaveCount(1)
    await expect(ground).toBeVisible()
    await expect(ground).toHaveAttribute('data-scheme', sample.scheme)
    if (sample.theme) await expect(ground).toHaveAttribute('data-theme', sample.theme)
    else await expect(ground).not.toHaveAttribute('data-theme', /.+/)
    await expect(ground.getByText(sample.label, { exact: true })).toBeVisible()

    const figure = ground.getByRole('figure')
    await expect(figure).toHaveCount(1)
    // The quote root carries its surrounding scope.
    await expect(figure).toHaveAttribute('data-ground', sample.preset)
    await expect(figure).toHaveAttribute('data-scheme', sample.scheme)

    const caption = figure.locator('figcaption')
    await expect(caption.getByText('Mei Lin', { exact: true })).toBeVisible()

    if (sample.framed) {
      // Framed: the open-quote glyph is decorative, and the role sits under the name.
      const mark = figure.locator(':scope > [aria-hidden="true"]')
      await expect(mark).toHaveCount(1)
      await expect(mark).toHaveText('“')
      await expect(figure.locator('blockquote')).toHaveText('Worth every early start.')
      await expect(caption.getByText('Member', { exact: true })).toBeVisible()
    } else {
      // Band: curly quotes in the text, no glyph, name only.
      await expect(figure.locator('[aria-hidden="true"]')).toHaveCount(0)
      await expect(figure.locator('blockquote')).toHaveText('“Worth every early start.”')
      await expect(caption).toHaveText('Mei Lin')
    }
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
