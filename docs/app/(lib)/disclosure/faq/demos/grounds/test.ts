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

test('grounds sets one FAQ on paper and one on forest', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await open(page)
  const paper = demo
    .locator('[data-ground="paper"]')
    .filter({ has: page.getByText('paper', { exact: true }) })
    .last()
  const forest = demo.locator('[data-ground="forest"]').first()

  // Paper follows the page mode; forest is a dark-tinted field that fixes dark.
  await expect(paper).toHaveAttribute('data-tone', 'light-base')
  await expect(forest).toHaveAttribute('data-tone', 'dark-tinted')
  await expect(forest).toHaveAttribute('data-theme', 'dark')

  for (const [name, ground] of [['paper', paper], ['forest', forest]] as const) {
    await expect(ground.getByText(name, { exact: true })).toBeVisible()
    // The FAQ root writes its ground's scope.
    await expect(ground.locator(`section[data-ground="${name}"]`).last()).toBeAttached()
    await expect(ground.getByRole('heading', { level: 3 })).toHaveCount(2)
    const trails = ground.getByRole('button', { name: 'Are the trails open in winter?' })
    const restrooms = ground.getByRole('button', { name: 'Are there restrooms?' })
    await expect(trails).toHaveAttribute('aria-expanded', 'true')
    await expect(ground.getByText('Yes, except after ice storms.')).toBeVisible()
    await expect(restrooms).toHaveAttribute('aria-expanded', 'false')
    await expect(ground.getByText('At the north lot, May to October.')).toBeHidden()
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('grounds toggles each FAQ independently', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await open(page)
  const forest = demo.locator('[data-ground="forest"]').first()
  const paperRestrooms = demo.getByRole('button', { name: 'Are there restrooms?' }).first()
  const forestRestrooms = forest.getByRole('button', { name: 'Are there restrooms?' })
  const forestTrails = forest.getByRole('button', { name: 'Are the trails open in winter?' })

  await forestRestrooms.click()
  await expect(forestRestrooms).toHaveAttribute('aria-expanded', 'true')
  await expect(forest.getByText('At the north lot, May to October.')).toBeVisible()
  await expect(paperRestrooms).toHaveAttribute('aria-expanded', 'false')

  await forestTrails.focus()
  await page.keyboard.press('Enter')
  await expect(forestTrails).toHaveAttribute('aria-expanded', 'false')
  await expect(forest.getByText('Yes, except after ice storms.')).toBeHidden()
  await expect(
    demo.getByRole('button', { name: 'Are the trails open in winter?' }).first(),
  ).toHaveAttribute('aria-expanded', 'true')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
