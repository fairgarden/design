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

test('color shows photos, initials and a worded status', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  // Two photo avatars, named by their alt text; once loaded, their initials faces unmount.
  await expect(demo.getByRole('img', { name: 'Ana Díaz', exact: true })).toHaveCount(2)
  await expect(demo.getByText('AD', { exact: true })).toHaveCount(0)

  // The bronze avatar has no photo: its initials face and a status glyph named in words.
  const initials = demo.getByText('BO', { exact: true })
  await expect(initials).toHaveCount(1)
  await expect(initials).toBeVisible()
  await expect(demo.getByRole('img', { name: 'In a meeting' })).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('color drives the ring from primary while the initials face stays a light face', async ({
  page,
}) => {
  const { demo, pageErrors } = await openDemo(page)

  const photos = demo.getByRole('img', { name: 'Ana Díaz', exact: true })
  await expect(photos).toHaveCount(2)
  // Each photo sits directly in its avatar root, which carries the primary scale class.
  for (let i = 0; i < 2; i++) {
    await expect(photos.nth(i).locator('xpath=..')).toHaveClass(/primaryPlum/)
  }

  const initials = demo.getByText('BO', { exact: true })
  const bronze = initials.locator('xpath=..')
  await expect(bronze).toHaveClass(/primaryBronze/)
  // The initials face is a nested white face scope, never recoloured by primary.
  await expect(initials).toHaveAttribute('data-ground', 'white')
  await expect(initials).not.toHaveClass(/primaryBronze/)

  // The status disc is its own white face too.
  const disc = demo.getByRole('img', { name: 'In a meeting' }).locator('xpath=..')
  await expect(disc).toHaveAttribute('data-ground', 'white')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
