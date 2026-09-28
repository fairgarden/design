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

test('color sets the plum primary scale on the form', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const forms = demo.locator('form')
  await expect(forms).toHaveCount(1)
  const form = forms.first()
  // `primary="plum"` becomes the scales module class on the Form root.
  await expect(form).toHaveClass(/primaryPlum/)

  // One field, labelled.
  const input = form.getByRole('textbox', { name: 'Your Name' })
  await expect(input).toBeVisible()
  await expect(form.getByRole('textbox')).toHaveCount(1)

  const send = form.getByRole('button', { name: 'Send' })
  await expect(send).toHaveAttribute('type', 'submit')
  await expect(send).toBeEnabled()

  // The label focuses its control.
  await form.getByText('Your Name', { exact: true }).click()
  await expect(input).toBeFocused()
  await page.keyboard.type('Ada')
  await expect(input).toHaveValue('Ada')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
