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

// Each field's mode is fixed: forest, royal and brick always dark; the solid light fields always light.
const fields = [
  { preset: 'forest', tone: 'dark-tinted', theme: 'dark' },
  { preset: 'royal', tone: 'solid-dark', theme: 'dark' },
  { preset: 'brick', tone: 'solid-dark', theme: 'dark' },
  { preset: 'leaf', tone: 'solid-light', theme: 'light' },
  { preset: 'amber', tone: 'solid-light', theme: 'light' },
  { preset: 'clay', tone: 'solid-light', theme: 'light' },
  { preset: 'pink', tone: 'solid-light', theme: 'light' },
] as const

test('fields paints the seven fields with their fixed modes', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  // Ground renders a section; the Link and Button roots inside write data-ground too.
  const grounds = demo.locator('section[data-ground]')
  await expect(grounds).toHaveCount(fields.length)

  for (const [index, { preset, tone, theme }] of fields.entries()) {
    const field = grounds.nth(index)
    await expect(field).toHaveAttribute('data-ground', preset)
    await expect(field).toHaveAttribute('data-tone', tone)
    await expect(field).toHaveAttribute('data-scheme', theme)
    await expect(field).toHaveAttribute('data-theme', theme)
    await expect(field.getByText(preset, { exact: true })).toBeVisible()
    await expect(field.getByRole('link', { name: 'Field notes' })).toHaveAttribute('href', '#fields')
    await expect(field.getByRole('button', { name: 'Join' })).toBeEnabled()
    // Fields never nest inside one another.
    await expect(field.locator('section[data-ground]')).toHaveCount(0)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('fields keeps each field its mode in both page modes', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const themes = async () =>
    demo.locator('section[data-ground]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-theme')),
    )

  await page.emulateMedia({ colorScheme: 'light' })
  const demo = await openDemo(page)
  const light = await themes()
  await page.emulateMedia({ colorScheme: 'dark' })
  const dark = await themes()

  expect(light).toEqual(fields.map((field) => field.theme))
  expect(dark).toEqual(light)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('fields reaches each link and action from the keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const grounds = demo.locator('section[data-ground]')

  for (const index of [0, fields.length - 1]) {
    const field = grounds.nth(index)
    const link = field.getByRole('link', { name: 'Field notes' })
    await link.focus()
    await expect(link).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(field.getByRole('button', { name: 'Join' })).toBeFocused()
  }

  // The pointer reaches the action too.
  const join = grounds.first().getByRole('button', { name: 'Join' })
  await join.click()
  await expect(join).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
