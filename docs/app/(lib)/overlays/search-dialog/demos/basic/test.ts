import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

const label = 'Search the docs'

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

function collectErrors(page: Page) {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  return pageErrors
}

async function openSearch(page: Page) {
  const demo = await openDemo(page)
  const trigger = demo.getByRole('button', { name: label })
  await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  // No keyboardShortcut in this demo: the header's search owns ⌘K / Ctrl K.
  await expect(trigger).not.toHaveAttribute('aria-keyshortcuts', /.+/)
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: label })
  await expect(dialog).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  const input = dialog.getByRole('combobox', { name: label })
  await expect(input).toBeFocused()
  return { demo, trigger, dialog, input }
}

test('basic opens with focus in the input and the default results', async ({ page }) => {
  const pageErrors = collectErrors(page)
  const { dialog, input } = await openSearch(page)

  await expect(input).toHaveAttribute('placeholder', label)
  await expect(input).toHaveValue('')
  await expect(dialog.getByRole('button', { name: 'Close search the docs' })).toBeVisible()

  // Before typing, the list shows the engine's default results: the site's first ten pages.
  const options = dialog.getByRole('option')
  await expect(options.first()).toBeVisible()
  expect(await options.count()).toBeGreaterThan(0)
  expect(await options.count()).toBeLessThanOrEqual(10)
  // Each row is a link to the result's page.
  await expect(options.first()).toHaveAttribute('href', /^\//)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('basic shows grouped results, the stats row and the empty status', async ({ page }) => {
  const pageErrors = collectErrors(page)
  const { dialog, input } = await openSearch(page)

  await input.fill('button')
  const options = dialog.getByRole('option')
  await expect(options.first()).toBeVisible()
  await expect(options.filter({ hasText: /button/i }).first()).toBeVisible()
  await expect(dialog.getByText(/^Found \d+ in /)).toBeVisible()

  // A word with no match shows the empty status once the empty delay has passed.
  await input.fill('zzqxvjw')
  await expect(dialog.getByText("No results for 'zzqxvjw'")).toBeVisible()
  await expect(options).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('basic closes by Escape, the close button and a press outside, returning focus', async ({
  page,
}) => {
  const pageErrors = collectErrors(page)
  const { trigger, dialog } = await openSearch(page)

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  await trigger.click()
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Close search the docs' }).click()
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()

  await trigger.click()
  await expect(dialog).toBeVisible()
  const box = await dialog.boundingBox()
  expect(box).not.toBeNull()
  // A press below the centred panel, outside it.
  const viewport = page.viewportSize()!
  const y = Math.min(viewport.height - 4, box!.y + box!.height + 40)
  if (y > box!.y + box!.height) {
    await page.mouse.click(4, y)
  } else {
    await page.mouse.click(4, 4)
  }
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('basic moves the highlight with the arrow keys and Enter goes to the page', async ({
  page,
}) => {
  const pageErrors = collectErrors(page)
  const { dialog, input } = await openSearch(page)

  await input.fill('button')
  const options = dialog.getByRole('option')
  await expect(options.nth(1)).toBeVisible()

  // The highlight starts on the first result.
  await expect(options.first()).toHaveAttribute('data-highlighted', '')
  await page.keyboard.press('ArrowDown')
  await expect(options.nth(1)).toHaveAttribute('data-highlighted', '')
  await expect(options.first()).not.toHaveAttribute('data-highlighted', '')
  await expect(input).toBeFocused()

  const href = (await options.nth(1).getAttribute('href'))!
  expect(href).toMatch(/^\//)
  const pathname = href.split(/[?#]/)[0]

  await page.keyboard.press('Enter')
  await expect(dialog).toBeHidden()
  await expect.poll(() => new URL(page.url()).pathname).toBe(pathname)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('basic navigates to a result chosen by pointer', async ({ page }) => {
  const pageErrors = collectErrors(page)
  const { dialog, input } = await openSearch(page)

  await input.fill('button')
  const option = dialog.getByRole('option').first()
  await expect(option).toBeVisible()
  const href = (await option.getAttribute('href'))!
  const pathname = href.split(/[?#]/)[0]

  await option.click()
  await expect(dialog).toBeHidden()
  await expect.poll(() => new URL(page.url()).pathname).toBe(pathname)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
