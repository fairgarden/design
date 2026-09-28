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

test('grounds shows the accordion on paper and forest', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const paper = demo.locator('[data-ground="paper"]').first()
  const forest = demo.locator('[data-ground="forest"]').first()
  await expect(paper).toBeVisible()
  await expect(forest).toBeVisible()
  await expect(paper.getByText('paper', { exact: true })).toBeVisible()
  await expect(forest.getByText('forest', { exact: true })).toBeVisible()
  // Forest is a fixed dark field.
  await expect(forest).toHaveAttribute('data-theme', 'dark')

  for (const face of [paper, forest]) {
    const expanded = face.getByRole('button', { name: 'Expanded' })
    const collapsed = face.getByRole('button', { name: 'Collapsed' })
    await expect(face.getByRole('button')).toHaveCount(2)
    await expect(face.getByRole('heading', { level: 3 })).toHaveCount(2)
    await expect(expanded).toHaveAttribute('aria-expanded', 'true')
    await expect(face.getByText('Arrows point inward.')).toBeVisible()
    await expect(collapsed).toHaveAttribute('aria-expanded', 'false')
    await expect(face.getByText('Arrows point outward.')).toBeHidden()
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('grounds toggles items on each ground independently', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const paper = demo.locator('[data-ground="paper"]').first()
  const forest = demo.locator('[data-ground="forest"]').first()

  // Pointer on forest opens the collapsed item there only.
  const forestCollapsed = forest.getByRole('button', { name: 'Collapsed' })
  await forestCollapsed.click()
  await expect(forestCollapsed).toHaveAttribute('aria-expanded', 'true')
  await expect(forest.getByText('Arrows point outward.')).toBeVisible()
  await expect(paper.getByRole('button', { name: 'Collapsed' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )

  // Keyboard on paper closes the expanded item.
  const paperExpanded = paper.getByRole('button', { name: 'Expanded' })
  await paperExpanded.focus()
  await page.keyboard.press('Enter')
  await expect(paperExpanded).toHaveAttribute('aria-expanded', 'false')
  await expect(paper.getByText('Arrows point inward.')).toBeHidden()
  await expect(paperExpanded).toBeFocused()
  await expect(forest.getByRole('button', { name: 'Expanded' })).toHaveAttribute(
    'aria-expanded',
    'true',
  )

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
