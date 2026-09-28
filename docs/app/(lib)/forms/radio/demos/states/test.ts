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

test('states shows a preselected group with a disabled option and a locked group', async ({
  page,
}) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  await expect(demo.getByRole('radiogroup')).toHaveCount(3)

  const delivery = demo.getByRole('radiogroup', { name: 'Delivery' })
  const standard = delivery.getByRole('radio', { name: 'Standard Post' })
  const express = delivery.getByRole('radio', { name: 'Express Post' })
  const pickup = delivery.getByRole('radio', { name: 'Store Pickup (unavailable)' })
  await expect(delivery.getByRole('radio')).toHaveCount(3)
  await expect(delivery.getByText('Arrives in 5–7 days.')).toBeVisible()
  await expect(standard).toHaveAttribute('aria-checked', 'true')
  await expect(pickup).toBeDisabled()

  await express.click()
  await expect(express).toHaveAttribute('aria-checked', 'true')
  await expect(standard).toHaveAttribute('aria-checked', 'false')
  // The disabled option stays unchosen by pointer or keyboard.
  await pickup.click({ force: true })
  await expect(pickup).toHaveAttribute('aria-checked', 'false')
  await expect(express).toHaveAttribute('aria-checked', 'true')
  await express.focus()
  await page.keyboard.press('ArrowUp')
  await expect(standard).toBeFocused()
  await expect(standard).toHaveAttribute('aria-checked', 'true')

  const tier = demo.getByRole('radiogroup', { name: 'Membership Tier' })
  const single = tier.getByRole('radio', { name: 'Single' })
  const family = tier.getByRole('radio', { name: 'Family' })
  await expect(single).toBeDisabled()
  await expect(family).toBeDisabled()
  await expect(family).toHaveAttribute('aria-checked', 'true')
  await single.click({ force: true })
  await expect(single).toHaveAttribute('aria-checked', 'false')
  await expect(family).toHaveAttribute('aria-checked', 'true')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states quiz marks the correct answer and a wrong pick once answered', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const quiz = demo.getByRole('radiogroup', { name: 'Which bird nests on the ground?' })
  const killdeer = quiz.getByRole('radio', { name: 'Killdeer' })
  const heron = quiz.getByRole('radio', { name: 'Great Blue Heron' })
  const swift = quiz.getByRole('radio', { name: 'Chimney Swift' })
  await expect(quiz.getByRole('radio')).toHaveCount(3)
  await expect(quiz.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0)
  await expect(quiz.getByText('Correct')).toHaveCount(0)
  await expect(quiz.getByText('Not quite')).toHaveCount(0)

  // A wrong pick: its own word, plus the correct answer revealed.
  await quiz.getByText('Great Blue Heron', { exact: true }).click()
  await expect(heron).toHaveAttribute('aria-checked', 'true')
  await expect(quiz.getByText('Not quite')).toHaveCount(1)
  await expect(quiz.getByText('Correct')).toHaveCount(1)
  await expect(quiz.locator('label').filter({ hasText: 'Great Blue Heron' })).toContainText('Not quite')
  await expect(quiz.locator('label').filter({ hasText: 'Killdeer' })).toContainText('Correct')

  // Moving by keyboard moves the wrong-pick feedback with it.
  await heron.focus()
  await page.keyboard.press('ArrowDown')
  await expect(swift).toBeFocused()
  await expect(swift).toHaveAttribute('aria-checked', 'true')
  await expect(quiz.getByText('Not quite')).toHaveCount(1)
  await expect(quiz.locator('label').filter({ hasText: 'Chimney Swift' })).toContainText('Not quite')
  await expect(quiz.locator('label').filter({ hasText: 'Great Blue Heron' })).not.toContainText(
    'Not quite',
  )

  // The right answer clears the wrong-pick feedback.
  await killdeer.click()
  await expect(killdeer).toHaveAttribute('aria-checked', 'true')
  await expect(quiz.getByText('Not quite')).toHaveCount(0)
  await expect(quiz.getByText('Correct')).toHaveCount(1)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
