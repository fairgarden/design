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

const FILES = [
  'VolunteerShift.tsx',
  'volunteer-shift.module.css',
  'ShiftList.tsx',
  'useShifts.ts',
  'VolunteerShift.test.tsx',
  'index.ts',
]

test('files switches between its file tabs by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { preview } = await openDemo(page)
  const tablist = preview.getByRole('tablist', { name: 'Files' })
  const tabs = tablist.getByRole('tab')
  await expect(tabs).toHaveCount(FILES.length)
  await expect(tabs).toHaveText(FILES)
  const tab = (name: string) => tablist.getByRole('tab', { name, exact: true })
  const panel = preview.getByRole('tabpanel')

  // The main file is selected first; every tab is a deep link to its file's slug.
  await expect(tab('VolunteerShift.tsx')).toHaveAttribute('aria-selected', 'true')
  for (const name of FILES) await expect(tab(name)).toHaveAttribute('href', /^#.+/)
  await expect(panel).toContainText('export function VolunteerShift(')

  // A plain click switches the file.
  await tab('ShiftList.tsx').click()
  await expect(tab('ShiftList.tsx')).toHaveAttribute('aria-selected', 'true')
  await expect(tab('VolunteerShift.tsx')).toHaveAttribute('aria-selected', 'false')
  await expect(panel).toContainText('export function ShiftList()')
  await expect(panel).not.toContainText('export function VolunteerShift(')

  // Arrow keys move focus along the tabs; Enter selects.
  await tab('ShiftList.tsx').focus()
  await page.keyboard.press('ArrowLeft')
  await expect(tab('volunteer-shift.module.css')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(tab('volunteer-shift.module.css')).toHaveAttribute('aria-selected', 'true')
  await expect(panel).toContainText('.shift {')

  await page.keyboard.press('End')
  await expect(tab('index.ts')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(tab('index.ts')).toHaveAttribute('aria-selected', 'true')
  await expect(panel).toContainText("export * from './ShiftList'")

  await page.keyboard.press('Home')
  await expect(tab('VolunteerShift.tsx')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(tab('VolunteerShift.tsx')).toHaveAttribute('aria-selected', 'true')
  await expect(panel).toContainText('export function VolunteerShift(')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('files opens and dismisses its More actions menu from the keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { preview } = await openDemo(page)
  // With several files the actions live in the menu, not inline in the header.
  await expect(preview.getByRole('button', { name: 'Copy VolunteerShift.tsx source' })).toHaveCount(0)
  const trigger = preview.getByRole('button', { name: 'More actions' })
  await expect(trigger).toHaveCount(1)
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  await trigger.focus()
  await page.keyboard.press('Enter')
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(menu.getByRole('menuitem', { name: 'Copy VolunteerShift.tsx source' })).toBeVisible()
  await expect(menu.getByRole('menuitem', { name: 'Copy VolunteerShift.tsx link' })).toBeVisible()
  await expect(menu.getByRole('menuitem', { name: 'Copy all files as Markdown' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()

  // The copy action follows the selected file.
  await preview.getByRole('tab', { name: 'useShifts.ts', exact: true }).click()
  await trigger.click()
  await expect(menu.getByRole('menuitem', { name: 'Copy useShifts.ts source' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test.describe('copying', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('files copies every file as Markdown and confirms in a toast', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    const { demo, preview } = await openDemo(page)
    await preview.getByRole('button', { name: 'More actions' }).click()
    const menu = page.getByRole('menu')
    await menu.getByRole('menuitem', { name: 'Copy all files as Markdown' }).click()
    await expect(menu).toBeHidden()

    // The confirmation goes to the docked toast bar, never inline in the block.
    const toasts = page.getByRole('region', { name: 'Notifications' })
    await expect(toasts).toContainText('Markdown copied')
    await expect(demo.getByText('Markdown copied')).toHaveCount(0)
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    for (const name of FILES) expect(copied).toContain(name)
    expect(copied).toContain('export function useShifts()')
    expect(copied).toContain('.shift {')

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})
