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
  // The Demo's preview surface, the rendered demo without the Demo's own code section
  // (a CSS Module class, whose local name is stable across builds).
  const preview = demo.locator('[class*="__preview"]').first()
  return { demo, preview }
}

test('grounds sets the same block on pollen and heather', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { preview } = await openDemo(page)
  // Each preset is its own Ground, a `section` scope.
  await expect(preview.locator('section[data-ground]')).toHaveCount(2)

  for (const preset of ['pollen', 'heather']) {
    const face = preview.locator(`section[data-ground="${preset}"]`)
    await expect(face).toHaveCount(1)
    await expect(face.getByText(preset, { exact: true })).toBeVisible()

    // One named file: its name in the header and the inline actions, no tabs or menu.
    await expect(face.getByText('seasonReport.ts', { exact: true })).toBeVisible()
    await expect(face.getByRole('tab')).toHaveCount(0)
    await expect(face.getByRole('button', { name: 'More actions' })).toHaveCount(0)
    await expect(face.getByRole('button', { name: 'Copy seasonReport.ts source' })).toBeVisible()
    await expect(face.getByRole('button', { name: 'Copy seasonReport.ts link' })).toBeVisible()

    // The block takes its ground's scope, so its tokens resolve against that ground's scales.
    const block = face.locator(`:scope > div[data-ground="${preset}"]`).filter({ has: page.locator('pre') })
    await expect(block).toHaveCount(1)
    await expect(block.locator('pre')).toContainText('export function seasonReport(')
    // Code reads left to right on any page.
    await expect(block.locator('[dir="ltr"]').filter({ has: page.locator('pre') })).toHaveCount(1)
    // Its colours arrive after the first paint.
    await expect(block.locator('pre [class*="pl-"]').first()).toBeVisible({ timeout: 15000 })
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
