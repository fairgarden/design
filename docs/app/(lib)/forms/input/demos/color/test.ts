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
  const demoRoot = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demoRoot.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  // Scope to the preview surface; the code panel also carries grounds, buttons and text.
  const demo = demoRoot.locator('[class*="__preview"]').first()
  return demo
}

test('color scopes each box to its primary scale', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const plum = demo.getByLabel('Primary Plum')
  const indigo = demo.getByLabel('Primary Indigo')
  await expect(demo.getByRole('textbox')).toHaveCount(2)
  await expect(plum).toHaveAttribute('placeholder', 'Search the guide…')
  await expect(indigo).toHaveAttribute('placeholder', 'Email address…')

  // `primary` lands on the box as its scale class, one box per scale.
  const plumBox = demo.locator('[class*="primaryPlum"]')
  const indigoBox = demo.locator('[class*="primaryIndigo"]')
  await expect(plumBox).toHaveCount(1)
  await expect(indigoBox).toHaveCount(1)
  await expect(plumBox.getByRole('textbox')).toHaveAttribute('placeholder', 'Search the guide…')
  await expect(indigoBox.getByRole('textbox')).toHaveAttribute('placeholder', 'Email address…')

  // Only the indigo box carries the butted action, which does not submit.
  await expect(demo.getByRole('button')).toHaveCount(1)
  const send = indigoBox.getByRole('button', { name: 'Send' })
  await expect(send).toBeVisible()
  await expect(send).toHaveAttribute('type', 'button')
  await expect(plumBox.getByRole('button')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('color types into each field and reaches the action by keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const plum = demo.getByLabel('Primary Plum')
  const indigo = demo.getByLabel('Primary Indigo')

  // A click on the label focuses its field.
  await demo.getByText('Primary Plum', { exact: true }).click()
  await expect(plum).toBeFocused()
  await page.keyboard.type('Ferns')
  await expect(plum).toHaveValue('Ferns')

  await page.keyboard.press('Tab')
  await expect(indigo).toBeFocused()
  await page.keyboard.type('ada@example.org')
  await expect(indigo).toHaveValue('ada@example.org')

  await page.keyboard.press('Tab')
  const send = demo.getByRole('button', { name: 'Send' })
  await expect(send).toBeFocused()
  await page.keyboard.press('Enter')
  await send.click()
  // A `button` action leaves the value in place and the page where it is.
  await expect(indigo).toHaveValue('ada@example.org')
  await expect(page).toHaveURL(new RegExp(`${route}/?$`))

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
