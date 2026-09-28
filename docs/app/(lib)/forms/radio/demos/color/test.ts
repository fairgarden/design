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

test('color shows three scoped groups, each with its first option checked', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  await expect(demo.getByRole('radiogroup')).toHaveCount(3)
  await expect(demo.getByRole('radio')).toHaveCount(6)

  for (const [group, first] of [
    ['Scope colors', 'Scope Colors'],
    ['Secondary indigo', 'Secondary Indigo'],
    ['Primary plum', 'Primary Plum'],
  ] as const) {
    const radios = demo.getByRole('radiogroup', { name: group, exact: true })
    await expect(radios.getByRole('radio')).toHaveCount(2)
    await expect(radios.getByRole('radio', { name: first })).toHaveAttribute('aria-checked', 'true')
    await expect(radios.getByRole('radio', { name: 'Unchecked' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    await expect(radios.getByRole('radio', { name: 'Unchecked' })).toBeEnabled()
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('color groups choose independently by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const indigo = demo.getByRole('radiogroup', { name: 'Secondary indigo', exact: true })
  const plum = demo.getByRole('radiogroup', { name: 'Primary plum', exact: true })

  await indigo.getByRole('radio', { name: 'Unchecked' }).click()
  await expect(indigo.getByRole('radio', { name: 'Unchecked' })).toHaveAttribute('aria-checked', 'true')
  await expect(indigo.getByRole('radio', { name: 'Secondary Indigo' })).toHaveAttribute(
    'aria-checked',
    'false',
  )
  // The other groups keep their own selection.
  await expect(plum.getByRole('radio', { name: 'Primary Plum' })).toHaveAttribute('aria-checked', 'true')

  const plumFirst = plum.getByRole('radio', { name: 'Primary Plum' })
  await plumFirst.focus()
  await page.keyboard.press('ArrowDown')
  const plumSecond = plum.getByRole('radio', { name: 'Unchecked' })
  await expect(plumSecond).toBeFocused()
  await expect(plumSecond).toHaveAttribute('aria-checked', 'true')
  await expect(plumFirst).toHaveAttribute('aria-checked', 'false')
  await page.keyboard.press('ArrowUp')
  await expect(plumFirst).toBeFocused()
  await expect(plumFirst).toHaveAttribute('aria-checked', 'true')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
