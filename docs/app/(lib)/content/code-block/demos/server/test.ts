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

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('server arrives highlighted in the server HTML', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    // No script runs, so whatever is on the page came from the server.
    await page.goto(route)
    const preview = page.locator('.demo').first().locator('[class*="__preview"]').first()
    const tablist = preview.getByRole('tablist', { name: 'Files' })
    await expect(tablist.getByRole('tab')).toHaveText(['SeedPacket.tsx', 'seed-packet.module.css'])
    const pre = preview.getByRole('tabpanel').locator('pre')
    await expect(pre).toContainText('export function SeedPacket(')
    // `highlightAfter="init"`: the syntax tokens are already in the HTML.
    await expect(pre.locator('[class*="pl-"]').first()).toBeVisible()

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})

test('server shows every file highlighted as the tabs switch', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { preview } = await openDemo(page)
  const tablist = preview.getByRole('tablist', { name: 'Files' })
  const tab = (name: string) => tablist.getByRole('tab', { name, exact: true })
  const panel = preview.getByRole('tabpanel')

  await expect(tablist.getByRole('tab')).toHaveCount(2)
  await expect(tab('SeedPacket.tsx')).toHaveAttribute('aria-selected', 'true')
  await expect(panel.locator('pre [class*="pl-"]').first()).toBeVisible()

  // The extra file was parsed on the server too: highlighted as soon as it shows.
  await tab('seed-packet.module.css').click()
  await expect(tab('seed-packet.module.css')).toHaveAttribute('aria-selected', 'true')
  await expect(tab('SeedPacket.tsx')).toHaveAttribute('aria-selected', 'false')
  await expect(panel).toContainText('.packet {')
  await expect(panel.locator('pre [class*="pl-"]').first()).toBeVisible()

  // And back, from the keyboard.
  await tab('seed-packet.module.css').focus()
  await page.keyboard.press('ArrowLeft')
  await expect(tab('SeedPacket.tsx')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(tab('SeedPacket.tsx')).toHaveAttribute('aria-selected', 'true')
  await expect(panel).toContainText('export function SeedPacket(')

  // Several files: the actions sit in the More actions menu.
  const trigger = preview.getByRole('button', { name: 'More actions' })
  await trigger.click()
  const menu = page.getByRole('menu')
  await expect(menu.getByRole('menuitem', { name: 'Copy SeedPacket.tsx source' })).toBeVisible()
  await expect(menu.getByRole('menuitem', { name: 'Copy all files as Markdown' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
