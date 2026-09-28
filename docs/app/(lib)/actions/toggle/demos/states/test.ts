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
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return { demo, pageErrors }
}

test('states shows pressed, off and disabled toggles', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  await expect(demo.getByRole('button', { name: 'Show Trails' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(demo.getByRole('button', { name: 'Magnify' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  await expect(demo.getByRole('button', { name: 'Small' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )

  const offline = demo.getByRole('button', { name: 'Offline Maps' })
  await expect(offline).toBeDisabled()
  await offline.click({ force: true })
  await expect(offline).toHaveAttribute('aria-pressed', 'false')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states toggles text toggles by pointer and keyboard', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const trails = demo.getByRole('button', { name: 'Show Trails' })
  await trails.click()
  await expect(trails).toHaveAttribute('aria-pressed', 'false')

  const magnify = demo.getByRole('button', { name: 'Magnify' })
  await magnify.focus()
  await page.keyboard.press('Space')
  await expect(magnify).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Enter')
  await expect(magnify).toHaveAttribute('aria-pressed', 'false')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states swaps the icon toggle name and announces its status', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const status = demo.locator('[aria-live="polite"]')
  const play = demo.getByRole('button', { name: 'Play Birdsong' })
  await expect(play).toHaveAttribute('aria-pressed', 'false')
  await expect(status).toHaveText('Paused')

  await play.click()
  const pause = demo.getByRole('button', { name: 'Pause Birdsong' })
  await expect(pause).toHaveAttribute('aria-pressed', 'true')
  await expect(pause).toBeFocused()
  await expect(status).toHaveText('Playing')

  await page.keyboard.press('Space')
  await expect(demo.getByRole('button', { name: 'Play Birdsong' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  await expect(status).toHaveText('Paused')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
