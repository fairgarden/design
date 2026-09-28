import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('grounds renders the same fields on the paper face and the forest field', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // Two ground scopes: paper follows the page mode, forest is always dark.
  const paper = demo.locator('section[data-ground="paper"]', { has: page.getByRole('textbox') }).first()
  const forest = demo.locator('section[data-ground="forest"]', { has: page.getByRole('textbox') }).first()
  await expect(paper).toHaveAttribute('data-scheme', 'page')
  await expect(paper).not.toHaveAttribute('data-theme')
  await expect(paper.getByText('paper', { exact: true })).toBeVisible()
  await expect(forest).toHaveAttribute('data-scheme', 'dark')
  await expect(forest).toHaveAttribute('data-theme', 'dark')
  await expect(forest.getByText('forest', { exact: true })).toBeVisible()

  await expect(demo.getByRole('textbox')).toHaveCount(4)

  for (const [ground, preset] of [
    [paper, 'paper'],
    [forest, 'forest'],
  ] as const) {
    const name = ground.getByRole('textbox', { name: 'Your Name', exact: true })
    const email = ground.getByRole('textbox', { name: 'Email Address', exact: true })
    await expect(ground.getByRole('textbox')).toHaveCount(2)

    // Rest field, described by its helper text.
    await expect(name).toHaveAttribute('placeholder', 'First and last name…')
    await expect(name).not.toHaveAttribute('aria-invalid', 'true')
    await expect(name).toHaveAccessibleDescription('As it appears on your card.')

    // Invalid field with its fix-it message.
    const message = 'Enter an email address, like name@example.com.'
    await expect(email).toHaveValue('heron@')
    await expect(email).toHaveAttribute('aria-invalid', 'true')
    await expect(ground.getByText(message, { exact: true })).toBeVisible()
    await expect(email).toHaveAccessibleDescription(message)

    // Each Field carries its ground's scope, so its roles resolve there.
    await expect(ground.locator('[data-invalid]', { has: email }).first()).toHaveAttribute(
      'data-ground',
      preset,
    )

    // Each control takes input independently.
    await name.click()
    await expect(name).toBeFocused()
    await page.keyboard.type(`Heron ${preset}`)
    await expect(name).toHaveValue(`Heron ${preset}`)
  }

  // Typing on one ground leaves the other's value alone.
  await expect(paper.getByRole('textbox', { name: 'Your Name' })).toHaveValue('Heron paper')
  await expect(forest.getByRole('textbox', { name: 'Your Name' })).toHaveValue('Heron forest')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
