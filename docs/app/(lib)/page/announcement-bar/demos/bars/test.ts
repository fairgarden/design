import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

// The countdown's end date is formatted in the reader's time zone: fix it.
test.use({ timezoneId: 'UTC' })

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

test('bars renders a ruled bar, a countdown and two fields', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  // 1 day, 1 hour and 30 minutes before the countdown's end.
  await page.clock.setFixedTime(new Date('2026-12-30T15:30:00Z'))

  const demo = await openDemo(page)
  const bars = demo.getByRole('complementary', { name: 'Announcement' })
  await expect(bars).toHaveCount(4)

  // A white page-ground bar with its message, one link and the dismiss.
  const notice = bars.nth(0)
  await expect(notice).toHaveAttribute('data-ground', 'white')
  await expect(notice).toContainText('The visitor center is closed 24–26 December.')
  await expect(notice.getByRole('link', { name: 'See Hours' })).toHaveAttribute(
    'href',
    'https://example.org/hours',
  )
  await expect(notice.getByRole('button', { name: 'Dismiss announcement' })).toBeVisible()

  // A mono countdown: boxed digits (hidden from assistive tech), a polite spoken line and the end date.
  const countdown = bars.nth(1)
  await expect(countdown).toContainText('Registration closes in')
  await expect(countdown.getByRole('link')).toHaveCount(0)
  await expect(countdown.getByRole('button')).toHaveCount(0)
  const time = countdown.locator('time')
  await expect(time).toHaveAttribute('datetime', '2026-12-31T17:00:00.000Z')
  await expect(time.locator('[aria-hidden="true"]')).toHaveText(/01\s*d\s*01\s*h\s*30\s*min/)
  await expect(time.locator('[aria-live="polite"]')).toHaveText('1 d, 1 h, 30 min left')
  await expect(time).toContainText('Ends 31 Dec 2026')

  // A forest field bar with its link, set in a field Ground inside the aside.
  const field = bars.nth(2)
  await expect(field.locator('[data-ground="forest"]:not(a, button)')).toHaveCount(1)
  await expect(field).toContainText('Guided spring walks are open for booking.')
  await expect(field.getByRole('link', { name: 'Book a Walk' })).toHaveAttribute(
    'href',
    'https://example.org/walks',
  )
  await expect(field.getByRole('button')).toHaveCount(0)

  // An amber dual-voice record with its one serif accent phrase.
  const record = bars.nth(3)
  await expect(record.locator('[data-ground="amber"]:not(a, button)')).toHaveCount(1)
  await expect(record).toContainText('Product recall: Trail Mix No. 4, lots 12–19')
  await expect(record.getByText('Trail Mix No. 4', { exact: true })).toBeVisible()
  await expect(record.getByRole('link')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('bars countdown shows its expired text after the end', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  await page.clock.setFixedTime(new Date('2027-01-02T00:00:00Z'))

  const demo = await openDemo(page)
  const countdown = demo.getByRole('complementary', { name: 'Announcement' }).nth(1)
  await expect(countdown).toContainText('Registration closed')
  await expect(countdown.locator('time')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('bars dismisses the notice by pointer and keyboard and shows it again', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const bars = demo.getByRole('complementary', { name: 'Announcement' })
  const notice = bars.filter({ hasText: 'The visitor center is closed' })
  const dismiss = demo.getByRole('button', { name: 'Dismiss announcement' })
  const reset = demo.getByRole('button', { name: 'Show the dismissed bar again' })
  await expect(bars).toHaveCount(4)

  // Pointer: the bar goes at once, and only that bar.
  await dismiss.click()
  await expect(notice).toHaveCount(0)
  await expect(dismiss).toHaveCount(0)
  await expect(bars).toHaveCount(3)
  await expect(bars.first()).toContainText('Registration closes in')

  // The demo's reset remounts it.
  await reset.click()
  await expect(bars).toHaveCount(4)
  await expect(notice).toHaveCount(1)

  // Keyboard: Enter and Space on the focused dismiss both remove it.
  await dismiss.focus()
  await expect(dismiss).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(notice).toHaveCount(0)
  await expect(bars).toHaveCount(3)

  await reset.focus()
  await page.keyboard.press('Enter')
  await expect(notice).toHaveCount(1)

  await dismiss.focus()
  await page.keyboard.press('Space')
  await expect(notice).toHaveCount(0)
  await expect(bars).toHaveCount(3)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
