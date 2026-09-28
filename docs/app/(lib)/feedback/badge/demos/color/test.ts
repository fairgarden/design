import path from 'node:path'
import { test, expect, type Locator } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

/** A CSS Module class by its local name, raw or hashed (`…__solid`). */
const moduleClass = (name: string) => new RegExp(`(^|\\s|_)${name}(\\s|$)`)

/** A badge's root: the parent of its label or count span. */
function badge(scope: Locator, text: string) {
  return scope.getByText(text, { exact: true }).locator('xpath=..')
}

test('color applies primary and secondary scales, with the static fill on red', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const code = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    code.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  // The Demo's preview surface, without its code panel (a stable CSS Module local name).
  const demo = code.locator('[class*="__preview"]').first()

  // The pills: the scope accent, then taxonomy scales passed as `secondary`.
  const scopeAccent = badge(demo, 'Scope accent')
  await expect(scopeAccent).toBeVisible()
  await expect(scopeAccent).toHaveClass(moduleClass('solid'))
  for (const [label, scale] of [
    ['Amber', 'secondaryAmber'],
    ['Indigo', 'secondaryIndigo'],
    ['Orange', 'secondaryOrange'],
  ] as const) {
    const pill = badge(demo, label)
    await expect(pill).toBeVisible()
    await expect(pill).toHaveClass(moduleClass('solid'))
    await expect(pill).toHaveClass(moduleClass(scale))
  }

  // Red carries no text on step 9, so the solid pill takes the static fill instead.
  const red = badge(demo, 'Red, static fill')
  await expect(red).toBeVisible()
  await expect(red).toHaveClass(moduleClass('staticFill'))
  await expect(red).not.toHaveClass(moduleClass('solid'))
  await expect(red).toHaveClass(moduleClass('secondaryRed'))

  // `primary` inks the outline, the sticker and the count.
  const outline = badge(demo, 'Primary plum')
  await expect(outline).toHaveClass(moduleClass('primaryPlum'))
  await expect(outline).not.toHaveClass(moduleClass('solid'))

  const sticker = badge(demo, 'Bronze sticker')
  await expect(sticker).toHaveClass(moduleClass('sticker'))
  await expect(sticker).toHaveClass(moduleClass('primaryBronze'))
  // The sticker is a nested paper face scope.
  await expect(sticker).toHaveAttribute('data-ground', 'paper')

  const count = badge(demo, '7')
  await expect(count).toHaveClass(moduleClass('numeric'))
  await expect(count).toHaveClass(moduleClass('primarySlate'))

  // A passed `secondary` overrides the status scale; the glyph still names the status.
  const status = badge(demo, 'Status override')
  await expect(status).toHaveClass(moduleClass('warning'))
  await expect(status).toHaveClass(moduleClass('secondaryOrange'))
  await expect(status).not.toHaveClass(moduleClass('secondaryAmber'))
  await expect(status.getByRole('img', { name: 'Warning', exact: true })).toHaveCount(1)
  await expect(demo.getByRole('img')).toHaveCount(1)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
