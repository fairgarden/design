import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

/** Opens the demo and waits until it has finished loading; returns the demo container. */
async function open(page: Page) {
  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The code's tabs are disabled until then, so wait for them before interacting.
  const files = demo.getByRole('tablist', { name: 'Files' })
  await expect(files).toBeVisible({ timeout: 15000 })
  await expect(files.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]')).toHaveCount(0, {
    timeout: 15000,
  })
  return demo
}

test('single labels its lone document without a tablist', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await open(page)

  // One document: a plain label, no tablist (the only tablist is the code's own).
  await expect(demo.getByText('Volunteer handbook', { exact: true })).toBeVisible()
  await expect(demo.getByRole('tab', { name: 'Volunteer handbook' })).toHaveCount(0)
  await expect(demo.getByRole('tablist', { name: 'Documents' })).toHaveCount(0)
  await expect(demo.getByText(/Sign in at the shed whistle board/)).toBeVisible()

  // Its controls: a copy button and a download link, both named.
  await expect(demo.getByRole('button', { name: 'Copy link' })).toBeVisible()
  const download = demo.getByRole('link', { name: 'Download Volunteer handbook' })
  await expect(download).toHaveAttribute('download', 'volunteer-handbook.txt')
  await expect(download).toHaveAttribute('href', /^data:text\/plain,/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test.describe('copying', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('single copies its link and confirms in a toast', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))
    const demo = await open(page)

    const copy = demo.getByRole('button', { name: 'Copy link' })
    await copy.focus()
    await page.keyboard.press('Enter')

    // The confirmation goes to the docked toast bar, never inline in the header.
    const toasts = page.getByRole('region', { name: 'Notifications' })
    await expect(toasts).toContainText('Link copied')
    await expect(demo.getByText('Link copied')).toHaveCount(0)
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/#single$/)

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})
