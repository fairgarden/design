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

test('grounds sets open and framed fieldsets on the paper face and the forest field', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const paper = demo.locator('[data-ground="paper"]').filter({ has: page.getByText('paper', { exact: true }) }).first()
  const forest = demo.locator('[data-ground="forest"]').filter({ has: page.getByText('forest', { exact: true }) }).first()

  // The paper face follows the page mode; the forest field is always dark.
  await expect(paper).toHaveAttribute('data-scheme', 'page')
  await expect(paper).not.toHaveAttribute('data-theme')
  await expect(forest).toHaveAttribute('data-scheme', 'dark')
  await expect(forest).toHaveAttribute('data-theme', 'dark')

  await expect(demo.getByRole('group')).toHaveCount(4)

  for (const [name, ground] of [
    ['paper', paper],
    ['forest', forest],
  ] as const) {
    await expect(ground.getByText(name, { exact: true })).toBeVisible()
    await expect(ground.getByRole('group')).toHaveCount(2)

    const contact = ground.getByRole('group', { name: 'Contact' })
    const calculator = ground.getByRole('group', { name: 'Calculator' })
    await expect(contact).toHaveClass(/__text/)
    await expect(calculator).toHaveClass(/__outline/)

    // Each fieldset carries the scope of the ground it sits in.
    await expect(contact).toHaveAttribute('data-ground', name)
    await expect(calculator).toHaveAttribute('data-ground', name)

    const email = contact.getByRole('textbox', { name: 'Email Address' })
    await expect(email).toHaveAttribute('type', 'email')
    await expect(email).toBeEnabled()
    await expect(calculator.getByRole('textbox', { name: 'Distance' })).toBeEnabled()
    await expect(calculator.getByText('km', { exact: true })).toBeVisible()
  }

  // Keyboard order runs through both fields of a ground.
  const paperEmail = paper.getByRole('textbox', { name: 'Email Address' })
  await paperEmail.click()
  await expect(paperEmail).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(paper.getByRole('textbox', { name: 'Distance' })).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
