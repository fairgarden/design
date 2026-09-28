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

test('grounds sets each preset scope and its plate', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const paper = demo.locator('section[data-ground="paper"]')
  const forest = demo.locator('section[data-ground="forest"]')
  await expect(paper).toHaveCount(1)
  await expect(forest).toHaveCount(1)

  // Paper follows the page's mode; forest is an always-dark field.
  await expect(paper).not.toHaveAttribute('data-theme', /.*/)
  await expect(forest).toHaveAttribute('data-theme', 'dark')
  await expect(forest).toHaveAttribute('data-tone', 'dark-tinted')
  await expect(paper.getByText('paper', { exact: true })).toBeVisible()
  await expect(forest.getByText('forest', { exact: true })).toBeVisible()

  for (const face of [paper, forest]) {
    await expect(face.getByRole('textbox')).toHaveCount(2)
    const email = face.getByLabel('Email Address')
    await expect(email).toHaveAttribute('type', 'email')
    await expect(email).toHaveAttribute('placeholder', 'Email address…')
    await expect(face.getByLabel('On a Plate')).toHaveAttribute(
      'placeholder',
      'For patterned grounds…',
    )
    const signUp = face.getByRole('button', { name: 'Sign Up' })
    await expect(signUp).toHaveCount(1)
    await expect(signUp).toHaveAttribute('type', 'button')

    // The plate is a nested white face holding only its own field.
    const plate = face.locator('[data-ground="white"]')
    await expect(plate).toHaveCount(1)
    await expect(plate.getByRole('textbox')).toHaveAttribute(
      'placeholder',
      'For patterned grounds…',
    )
  }

  // On paper the plate follows the page; inside the dark field it is a light island.
  await expect(paper.locator('[data-ground="white"]')).not.toHaveAttribute('data-theme', /.*/)
  await expect(forest.locator('[data-ground="white"]')).toHaveAttribute('data-theme', 'light')
  // The open boxes carry their scope's attributes.
  await expect(
    forest.locator('[data-ground="forest"][class*="input-module"]').filter({ has: page.getByLabel('Email Address') }),
  ).toHaveAttribute('data-scheme', 'dark')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('grounds takes input in both scopes', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const forest = demo.locator('section[data-ground="forest"]')
  const email = forest.getByLabel('Email Address')
  const plate = forest.getByLabel('On a Plate')

  await forest.getByText('Email Address', { exact: true }).click()
  await expect(email).toBeFocused()
  await page.keyboard.type('ada@example.org')
  await expect(email).toHaveValue('ada@example.org')
  await page.keyboard.press('Tab')
  await expect(forest.getByRole('button', { name: 'Sign Up' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(plate).toBeFocused()
  await page.keyboard.type('Grain')
  await expect(plate).toHaveValue('Grain')

  // The paper fields are independent of the forest ones.
  const paper = demo.locator('section[data-ground="paper"]')
  await expect(paper.getByLabel('Email Address')).toHaveValue('')
  await paper.getByLabel('On a Plate').click()
  await expect(paper.getByLabel('On a Plate')).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
