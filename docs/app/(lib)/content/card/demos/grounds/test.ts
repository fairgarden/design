import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('grounds nests a white face on paper and a paper light island in each field', async ({
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

  await expect(demo.getByRole('article')).toHaveCount(3)

  const samples = [
    // A page ground follows the mode and writes no theme; its card face is `white`.
    { preset: 'paper', theme: null, face: 'white', faceScheme: 'page', faceTheme: null },
    // A dark field fixes its mode; the face inside is a `paper` light island.
    { preset: 'forest', theme: 'dark', face: 'paper', faceScheme: 'light', faceTheme: 'light' },
    // A solid-light field fixes light; the face inside is still a `paper` island.
    { preset: 'leaf', theme: 'light', face: 'paper', faceScheme: 'light', faceTheme: 'light' },
  ] as const

  for (const sample of samples) {
    const ground = demo.locator(`[data-ground="${sample.preset}"]`).first()
    await expect(ground).toBeVisible()
    if (sample.theme) await expect(ground).toHaveAttribute('data-theme', sample.theme)
    else await expect(ground).not.toHaveAttribute('data-theme', /.+/)

    const card = ground.getByRole('article')
    await expect(card).toHaveCount(1)
    // The card root carries its surrounding scope.
    await expect(card).toHaveAttribute('data-ground', sample.preset)
    await expect(card.getByRole('heading', { level: 3 })).toHaveText('Night walk')
    await expect(card.getByRole('link', { name: 'Night walk' })).toHaveAttribute(
      'href',
      '#grounds',
    )
    await expect(card.getByText(`On ${sample.preset}`, { exact: true })).toBeVisible()
    await expect(card.getByText('Owls, moths and the smell of wet leaves.')).toBeVisible()

    const face = card.locator('[data-ground]').first()
    await expect(face).toHaveAttribute('data-ground', sample.face)
    await expect(face).toHaveAttribute('data-scheme', sample.faceScheme)
    if (sample.faceTheme) await expect(face).toHaveAttribute('data-theme', sample.faceTheme)
    else await expect(face).not.toHaveAttribute('data-theme', /.+/)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
