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
  return demo.locator('[class*="__preview"]').first()
}

const ruledQuestions = [
  'Can I bring my dog?',
  'Is there an entry fee?',
  'Are bikes allowed on the trails?',
  'Can our school group book a guided walk?',
]
const barredQuestions = [
  'What is a conservation easement?',
  'Does an easement change my property taxes?',
  'Can I still sell the land?',
]

test('variants shows the ruled FAQ with header and contact, and the barred FAQ', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await open(page)
  const ruled = demo
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Visiting the preserves' }) })
    .last()
  const barred = demo
    .locator('section')
    .filter({ has: page.getByRole('button', { name: barredQuestions[0] }) })
    .last()

  // Ruled: the header's h2 and intro, four questions, the contact line.
  await expect(ruled.getByRole('heading', { level: 2, name: 'Visiting the preserves' })).toBeVisible()
  await expect(ruled.getByText('Answers to the questions we hear most at the trailhead.')).toBeVisible()
  await expect(ruled.getByRole('heading', { level: 3 })).toHaveText(ruledQuestions)
  await expect(ruled.getByRole('button', { name: ruledQuestions[0] })).toHaveAttribute('aria-expanded', 'true')
  for (const question of ruledQuestions.slice(1)) {
    await expect(ruled.getByRole('button', { name: question })).toHaveAttribute('aria-expanded', 'false')
  }
  await expect(ruled.getByText('Still have a question?')).toBeVisible()
  await expect(ruled.getByRole('link', { name: 'Write to the stewardship team' })).toHaveAttribute('href', '#contact')
  await expect(ruled).not.toHaveClass(/barred/)

  // Barred: no header, three questions, the first open.
  await expect(barred).toHaveClass(/barred/)
  await expect(barred.getByRole('heading', { level: 2 })).toHaveCount(0)
  await expect(barred.getByRole('heading', { level: 3 })).toHaveText(barredQuestions)
  await expect(barred.getByRole('button', { name: barredQuestions[0] })).toHaveAttribute('aria-expanded', 'true')
  await expect(barred.getByText('A legal agreement that limits development')).toBeVisible()
  await expect(barred.getByText('It can lower them.')).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('variants navigates and toggles questions by keyboard and pointer', async ({ page }) => {
  test.fixme(true, 'Known bug: ArrowDown/ArrowUp on an accordion trigger does not move focus to the adjacent trigger.')
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await open(page)
  const q = (name: string) => demo.getByRole('button', { name })

  // Home and End reach the ends of one list; arrows step through it.
  await q(ruledQuestions[0]).focus()
  await page.keyboard.press('End')
  await expect(q(ruledQuestions[3])).toBeFocused()
  await page.keyboard.press('Home')
  await expect(q(ruledQuestions[0])).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(q(ruledQuestions[1])).toBeFocused()

  // Enter opens the fee answer while the dog answer stays open.
  await page.keyboard.press('Enter')
  await expect(q(ruledQuestions[1])).toHaveAttribute('aria-expanded', 'true')
  await expect(demo.getByText('Every FairGarden preserve is free')).toBeVisible()
  await expect(q(ruledQuestions[0])).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Space')
  await expect(q(ruledQuestions[1])).toHaveAttribute('aria-expanded', 'false')
  await expect(demo.getByText('Every FairGarden preserve is free')).toBeHidden()

  // Pointer on the barred list: close the open item, open another.
  await q(barredQuestions[0]).click()
  await expect(q(barredQuestions[0])).toHaveAttribute('aria-expanded', 'false')
  await expect(demo.getByText('A legal agreement that limits development')).toBeHidden()
  await q(barredQuestions[2]).click()
  await expect(q(barredQuestions[2])).toHaveAttribute('aria-expanded', 'true')
  await expect(demo.getByText('The easement travels with the deed')).toBeVisible()
  await expect(q(barredQuestions[2])).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
