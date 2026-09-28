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

test('grounds shows the form on paper and forest scopes', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const grounds = demo.locator('[data-ground]')
  await expect(grounds).toHaveCount(2)

  const paper = demo.locator('[data-ground="paper"]')
  const forest = demo.locator('[data-ground="forest"]')
  await expect(paper).toHaveCount(1)
  await expect(forest).toHaveCount(1)

  // Forest is a fixed dark field; paper follows the page and never forces dark.
  await expect(forest).toHaveAttribute('data-theme', 'dark')
  await expect(forest).toHaveAttribute('data-scheme', 'dark')
  await expect(forest).toHaveAttribute('data-tone', 'dark-tinted')
  await expect(paper).toHaveAttribute('data-tone', 'light-base')
  await expect(paper).not.toHaveAttribute('data-theme', 'dark')

  for (const [name, scope] of [
    ['paper', paper],
    ['forest', forest],
  ] as const) {
    await expect(scope.getByText(name, { exact: true })).toBeVisible()
    await expect(scope.locator('form')).toHaveCount(1)
    const email = scope.getByRole('textbox', { name: 'Email Address' })
    await expect(email).toHaveAttribute('type', 'email')
    const submit = scope.getByRole('button', { name: 'Sign Up' })
    await expect(submit).toHaveAttribute('type', 'submit')
    await expect(submit).toBeEnabled()
  }

  // Each form is independent: typing on forest leaves paper untouched.
  await forest.getByRole('textbox', { name: 'Email Address' }).fill('name@example.com')
  await expect(forest.getByRole('textbox', { name: 'Email Address' })).toHaveValue(
    'name@example.com',
  )
  await expect(paper.getByRole('textbox', { name: 'Email Address' })).toHaveValue('')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
