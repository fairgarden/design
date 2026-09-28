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

/**
 * An open tooltip popup: it renders in a portal outside the demo, writes the
 * overlay scope (`white`) and carries Base UI's `data-open` while showing.
 */
function popup(page: Page, text: string) {
  return page.locator('[data-ground="white"][data-open]').filter({ hasText: text })
}

test('grounds shows a hint and a term on paper and forest, each opening an overlay-scope popup', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  // Each ground is named by its preset caption.
  const paper = demo.getByText('paper', { exact: true }).locator('xpath=..')
  const forest = demo.getByText('forest', { exact: true }).locator('xpath=..')

  // The paper face follows the page mode; the forest field is always dark.
  await expect(paper).toHaveAttribute('data-ground', 'paper')
  await expect(paper).toHaveAttribute('data-scheme', 'page')
  await expect(paper).not.toHaveAttribute('data-theme')
  await expect(forest).toHaveAttribute('data-ground', 'forest')
  await expect(forest).toHaveAttribute('data-scheme', 'dark')
  await expect(forest).toHaveAttribute('data-theme', 'dark')

  // Both grounds hold the same two triggers.
  for (const ground of [paper, forest]) {
    await expect(ground.getByRole('button')).toHaveCount(2)
    await expect(ground.getByRole('button', { name: 'About trail grades', exact: true })).toBeVisible()
    await expect(ground.getByRole('button', { name: 'kettle pond', exact: true })).toHaveText('kettle pond')
  }

  const hintText = 'Grades run from easy to strenuous.'
  const termText = 'A pond left by a melting glacier.'

  // Keyboard: focus the first trigger and tab through all four.
  const paperHint = paper.getByRole('button', { name: 'About trail grades', exact: true })
  const paperTerm = paper.getByRole('button', { name: 'kettle pond', exact: true })
  const forestHint = forest.getByRole('button', { name: 'About trail grades', exact: true })
  const forestTerm = forest.getByRole('button', { name: 'kettle pond', exact: true })

  await paperHint.focus()
  await expect(popup(page, hintText)).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(paperTerm).toBeFocused()
  await expect(popup(page, termText)).toBeVisible()
  await expect(popup(page, hintText)).toBeHidden()

  // From the dark forest field, the popup is still the overlay scope: it never
  // inherits the trigger's ground, scheme or scales.
  await page.keyboard.press('Tab')
  await expect(forestHint).toBeFocused()
  const forestHintPopup = popup(page, hintText)
  await expect(forestHintPopup).toBeVisible()
  await expect(forestHintPopup).toHaveAttribute('data-scheme', 'page')
  await expect(forestHintPopup).not.toHaveAttribute('data-theme')
  await expect(forestHintPopup).toHaveClass(/primaryOlive/)
  await expect(demo.locator('[data-ground="white"][data-open]')).toHaveCount(0)

  await page.keyboard.press('Escape')
  await expect(forestHintPopup).toBeHidden()
  await expect(forestHint).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(forestTerm).toBeFocused()
  await expect(popup(page, termText)).toBeVisible()
  await expect(popup(page, termText)).toHaveAttribute('data-ground', 'white')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('grounds opens the forest term on hover and closes on leave', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const forest = demo.getByText('forest', { exact: true }).locator('xpath=..')

  await forest.getByRole('button', { name: 'kettle pond', exact: true }).hover()
  const definition = popup(page, 'A pond left by a melting glacier.')
  await expect(definition).toBeVisible()
  await expect(definition).not.toHaveAttribute('data-theme')
  await page.mouse.move(0, 0)
  await expect(definition).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
