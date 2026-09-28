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

const pageGrounds = ['paper', 'white', 'tide', 'meadow', 'pollen', 'apricot', 'rose', 'heather']
const modes = [
  { theme: 'light', name: 'Light mode' },
  { theme: 'dark', name: 'Dark mode' },
] as const

test('page-grounds shows the eight page grounds in each mode', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.locator('section[data-ground]')).toHaveCount(pageGrounds.length * modes.length)

  for (const { theme, name } of modes) {
    // Each row forces its mode with data-theme on a wrapper, for the preview only.
    const row = demo.locator(`div[data-theme="${theme}"]`)
    await expect(row).toHaveCount(1)
    await expect(row.getByText(name, { exact: true })).toBeVisible()

    const faces = row.locator('section[data-ground]')
    await expect(faces).toHaveCount(pageGrounds.length)
    for (const [index, preset] of pageGrounds.entries()) {
      const face = faces.nth(index)
      await expect(face).toHaveAttribute('data-ground', preset)
      await expect(face).toHaveAttribute('data-tone', index < 2 ? 'light-base' : 'tinted')
      // Page grounds follow the mode, so the face writes no data-theme of its own.
      await expect(face).toHaveAttribute('data-scheme', 'page')
      await expect(face).not.toHaveAttribute('data-theme', /.*/)
      await expect(face.getByText(preset, { exact: true })).toBeVisible()
      await expect(face.getByRole('link', { name: 'Field notes' })).toHaveAttribute('href', '#page-grounds')
      await expect(face.getByRole('button', { name: 'Join' })).toBeEnabled()
    }
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('page-grounds paints each page ground differently in the two modes', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const backgrounds = (theme: string) =>
    demo
      .locator(`div[data-theme="${theme}"] section[data-ground]`)
      .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).backgroundColor))

  const light = await backgrounds('light')
  const dark = await backgrounds('dark')
  expect(light).toHaveLength(pageGrounds.length)
  expect(dark).toHaveLength(pageGrounds.length)
  for (const index of pageGrounds.keys()) {
    expect(dark[index], `${pageGrounds[index]} should follow the mode`).not.toBe(light[index])
  }
  // The six pastels are six different hues within one mode.
  expect(new Set(light.slice(2)).size).toBe(6)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('page-grounds reaches each face link and action from the keyboard and pointer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  for (const { theme } of modes) {
    const face = demo.locator(`div[data-theme="${theme}"] section[data-ground="heather"]`)
    const link = face.getByRole('link', { name: 'Field notes' })
    await link.focus()
    await expect(link).toBeFocused()
    await page.keyboard.press('Tab')
    const join = face.getByRole('button', { name: 'Join' })
    await expect(join).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(link).toBeFocused()
    await join.click()
    await expect(join).toBeFocused()
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
