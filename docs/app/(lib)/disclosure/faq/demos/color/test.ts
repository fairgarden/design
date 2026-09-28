import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

async function open(page: Page) {
  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return demo
}

test('color carries the slate primary and indigo secondary scales', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await open(page)
  const faq = demo
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Membership' }) })
    .last()
  await expect(faq.getByRole('heading', { level: 2, name: 'Membership' })).toBeVisible()
  await expect(faq).toHaveClass(/primarySlate/)
  await expect(faq).toHaveClass(/secondaryIndigo/)

  // Two questions, each an h3 wrapping its trigger; the first starts open.
  await expect(faq.getByRole('heading', { level: 3 })).toHaveCount(2)
  const renew = faq.getByRole('button', { name: 'When does my membership renew?' })
  const gift = faq.getByRole('button', { name: 'Can I give a membership as a gift?' })
  await expect(renew).toHaveAttribute('aria-expanded', 'true')
  await expect(gift).toHaveAttribute('aria-expanded', 'false')

  // The secondary scale reaches the link inside the open answer.
  await expect(faq.getByRole('link', { name: 'Renew online' })).toBeVisible()
  await expect(faq.getByRole('link', { name: 'Renew online' })).toHaveAttribute('href', '#renew')
  await expect(faq.getByText('Yes, with a printed card mailed to the recipient.')).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('color toggles answers by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await open(page)
  const renew = demo.getByRole('button', { name: 'When does my membership renew?' })
  const gift = demo.getByRole('button', { name: 'Can I give a membership as a gift?' })
  const giftAnswer = demo.getByText('Yes, with a printed card mailed to the recipient.')

  // Several items may be open at once.
  await gift.click()
  await expect(gift).toHaveAttribute('aria-expanded', 'true')
  await expect(giftAnswer).toBeVisible()
  await expect(renew).toHaveAttribute('aria-expanded', 'true')

  // Arrow keys move between questions; Enter and Space toggle.
  await gift.focus()
  await page.keyboard.press('ArrowUp')
  await expect(renew).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(renew).toHaveAttribute('aria-expanded', 'false')
  await expect(demo.getByRole('link', { name: 'Renew online' })).toBeHidden()
  await page.keyboard.press('ArrowDown')
  await expect(gift).toBeFocused()
  await page.keyboard.press('Space')
  await expect(gift).toHaveAttribute('aria-expanded', 'false')
  await expect(giftAnswer).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
