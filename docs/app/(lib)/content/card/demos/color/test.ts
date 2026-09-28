import path from 'node:path'
import { test, expect, type Locator } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

// A face's resolved scale step, and the named scale's own step, read on the same element.
const scaleStep = (face: Locator, alias: string, scale: string) =>
  face.evaluate(
    (element, [alias, scale]) => {
      const style = getComputedStyle(element)
      return [style.getPropertyValue(alias).trim(), style.getPropertyValue(scale).trim()]
    },
    [alias, scale] as const,
  )

test('color passes primary and secondary through to each face scope', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const cards = demo.getByRole('article')
  await expect(cards).toHaveCount(3)

  const pairings = [
    { title: 'Scope defaults', meta: 'olive × green', primary: 'olive', secondary: 'green' },
    {
      title: 'Royal pairing',
      meta: 'primary="slate" secondary="indigo"',
      primary: 'slate',
      secondary: 'indigo',
    },
    {
      title: 'Clay pairing',
      meta: 'primary="olive" secondary="orange"',
      primary: 'olive',
      secondary: 'orange',
    },
  ]

  for (const [index, pairing] of pairings.entries()) {
    const card = cards.nth(index)
    await expect(card.getByRole('heading', { level: 3 })).toHaveText(pairing.title)
    await expect(card.getByRole('link', { name: pairing.title })).toHaveAttribute('href', '#color')
    await expect(card.getByText(pairing.meta, { exact: true })).toBeVisible()

    // Each card is faced: its face is a nested `white` Ground on the page ground.
    const face = card.locator('[data-ground]').first()
    await expect(face).toHaveAttribute('data-ground', 'white')
    await expect(face).toHaveAttribute('data-scheme', 'page')

    // The face's --primary* and --secondary* ladders resolve to the pairing's scales.
    for (const step of [9, 12]) {
      const [primary, primaryScale] = await scaleStep(
        face,
        `--primary${step}`,
        `--${pairing.primary}${step}`,
      )
      expect(primary, `${pairing.title}: --primary${step}`).not.toBe('')
      expect(primary, `${pairing.title}: --primary${step}`).toBe(primaryScale)
    }
    const [secondary, secondaryScale] = await scaleStep(
      face,
      '--secondary9',
      `--${pairing.secondary}9`,
    )
    expect(secondary, `${pairing.title}: --secondary9`).not.toBe('')
    expect(secondary, `${pairing.title}: --secondary9`).toBe(secondaryScale)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
