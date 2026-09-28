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

test('variants shows the outline, pill, static, sticker, status and count badges', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // Labels are authored in sentence case; the caps come from CSS, not the text.
  const labels = [
    'Members',
    'New',
    'Members only',
    'Est. 1998',
    'Guided',
    'Open',
    'Muddy',
    'Closed',
    '3',
    '12',
    '128',
  ]
  for (const label of labels) {
    await expect(demo.getByText(label, { exact: true })).toBeVisible()
  }

  // Badges are static labels: never buttons or links.
  await expect(demo.locator('button, a').filter({ hasText: /^(Members|New|Open)$/ })).toHaveCount(0)

  // The kinds: no variant is the outline base; solid, static and sticker add their classes.
  const outline = badge(demo, 'Members')
  await expect(outline).not.toHaveClass(moduleClass('solid'))
  await expect(outline).not.toHaveClass(moduleClass('staticFill'))
  await expect(badge(demo, 'New')).toHaveClass(moduleClass('solid'))
  await expect(badge(demo, 'Members only')).toHaveClass(moduleClass('staticFill'))

  // The sticker is its own nested paper face scope.
  const sticker = badge(demo, 'Est. 1998')
  await expect(sticker).toHaveClass(moduleClass('sticker'))
  await expect(sticker).toHaveAttribute('data-ground', 'paper')

  // Each status badge draws its glyph, named by the status word, beside the label.
  const statuses = [
    ['Guided', 'info', 'Information'],
    ['Open', 'success', 'Success'],
    ['Muddy', 'warning', 'Warning'],
    ['Closed', 'danger', 'Error'],
  ] as const
  await expect(demo.getByRole('img')).toHaveCount(statuses.length)
  for (const [label, status, word] of statuses) {
    const root = badge(demo, label)
    await expect(root).toHaveClass(moduleClass(status))
    await expect(root.getByRole('img', { name: word, exact: true })).toHaveCount(1)
  }

  // Counts are set in the data face, without a glyph.
  for (const count of ['3', '12', '128']) {
    const root = badge(demo, count)
    await expect(root).toHaveClass(moduleClass('numeric'))
    await expect(root.getByRole('img')).toHaveCount(0)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
