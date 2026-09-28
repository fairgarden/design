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
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before asserting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return { demo, pageErrors }
}

test('grounds renders the same avatars on paper and forest', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const paper = demo.locator('section[data-ground="paper"]')
  const forest = demo.locator('section[data-ground="forest"]')
  await expect(paper).toHaveCount(1)
  await expect(forest).toHaveCount(1)
  await expect(paper.getByText('paper', { exact: true })).toBeVisible()
  await expect(forest.getByText('forest', { exact: true })).toBeVisible()

  // Forest is a fixed dark field; paper follows the page and never forces dark.
  await expect(forest).toHaveAttribute('data-theme', 'dark')
  await expect(paper).not.toHaveAttribute('data-theme', 'dark')

  for (const ground of [paper, forest]) {
    // The single photo avatar and the group's first avatar show the loaded photo.
    await expect(ground.getByRole('img', { name: 'Ana Díaz', exact: true })).toHaveCount(2)
    await expect(ground.getByRole('img', { name: 'Online' })).toBeVisible()

    const group = ground.getByRole('group', { name: 'Volunteers' })
    await expect(group).toBeVisible()
    for (const initials of ['BO', 'CP', 'DR']) {
      await expect(group.getByText(initials, { exact: true })).toHaveCount(1)
    }
    // Four avatars: three shown at base plus "+1", all four from 1024 px (no "+N" then).
    await expect(group.locator('[aria-label="1 more"]')).toHaveCount(1)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('grounds keeps the initials face and status disc as light islands on forest', async ({
  page,
}) => {
  const { demo, pageErrors } = await openDemo(page)

  const forest = demo.locator('section[data-ground="forest"]')
  const initials = forest.getByText('BO', { exact: true })
  await expect(initials).toHaveCount(2)
  for (let i = 0; i < 2; i++) {
    // A white face nested in a fixed dark field is a light island.
    await expect(initials.nth(i)).toHaveAttribute('data-ground', 'white')
    await expect(initials.nth(i)).toHaveAttribute('data-theme', 'light')
  }
  const disc = forest.getByRole('img', { name: 'Online' }).locator('xpath=..')
  await expect(disc).toHaveAttribute('data-ground', 'white')
  await expect(disc).toHaveAttribute('data-theme', 'light')

  // Avatars inherit the scope of the ground they sit on.
  await expect(initials.first().locator('xpath=..')).toHaveAttribute('data-ground', 'forest')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
