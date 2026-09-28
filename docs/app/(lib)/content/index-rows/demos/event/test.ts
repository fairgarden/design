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

const events = [
  { title: 'Night walk at Hemlock Ravine', date: '2026-10-03', key: '03 / 10', meta: 'In person · 7 p.m.' },
  { title: 'Seed swap', date: '2026-10-11', key: '11 / 10', meta: 'In person · 10 a.m.' },
  { title: 'Stream ecology talk', date: '2026-09-12', key: '12 / 09', meta: 'Virtual · Past' },
]

test('event lists dated rows with collapsed disclosure titles', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  // Event rows are an unordered list, not ranked.
  const list = demo.getByRole('list').first()
  await expect(list).toHaveJSProperty('tagName', 'UL')
  const rows = list.getByRole('listitem')
  await expect(rows).toHaveCount(events.length)

  for (const [index, event] of events.entries()) {
    const row = rows.nth(index)
    // The date key is a machine-readable time.
    const time = row.locator('time')
    await expect(time).toHaveText(event.key)
    await expect(time).toHaveAttribute('datetime', event.date)
    // The title is the trigger, inside an h3 heading, collapsed to start.
    await expect(row.getByRole('heading', { level: 3, name: event.title })).toBeVisible()
    const trigger = row.getByRole('button', { name: event.title })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    // The meta line shows in both states; past events say "Past" in words.
    await expect(row.getByText(event.meta)).toBeVisible()
  }

  // No details are open: the closed panels stay in the DOM (hidden until found) but unseen.
  await expect(demo.locator('button:visible', { hasText: 'Register' })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('event rows expand and collapse by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const rows = demo.getByRole('listitem')

  // Pointer: open the first row, revealing its details.
  const first = rows.nth(0)
  const firstTrigger = first.getByRole('button', { name: events[0].title })
  await firstTrigger.click()
  await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true')
  await expect(first.getByText('Meet at the north kiosk.')).toBeVisible()
  await expect(first.getByText('Host')).toBeVisible()
  await expect(first.getByText('Ana Díaz')).toBeVisible()
  await expect(first.getByText('Entrance')).toBeVisible()
  await expect(first.getByText('North lot')).toBeVisible()
  await expect(first.getByRole('button', { name: 'Register' })).toBeVisible()
  // Rows expand independently: the others stay collapsed.
  await expect(demo.locator('button:visible', { hasText: 'Register' })).toHaveCount(1)
  await expect(rows.nth(1).getByRole('button', { name: events[1].title })).toHaveAttribute(
    'aria-expanded',
    'false',
  )

  // Pointer again closes it.
  await firstTrigger.click()
  await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false')
  await expect(demo.locator('button:visible', { hasText: 'Register' })).toHaveCount(0)

  // Keyboard: Enter opens the second row, focus stays on its title.
  const secondTrigger = rows.nth(1).getByRole('button', { name: events[1].title })
  await secondTrigger.focus()
  await page.keyboard.press('Enter')
  await expect(secondTrigger).toHaveAttribute('aria-expanded', 'true')
  await expect(secondTrigger).toBeFocused()
  await expect(rows.nth(1).getByRole('button', { name: 'Register' })).toBeVisible()

  // Tab moves into the open details, to its Register button.
  await page.keyboard.press('Tab')
  await expect(rows.nth(1).getByRole('button', { name: 'Register' })).toBeFocused()
  // Tab on reaches the next row's title, skipping nothing else in between.
  await page.keyboard.press('Tab')
  const thirdTrigger = rows.nth(2).getByRole('button', { name: events[2].title })
  await expect(thirdTrigger).toBeFocused()

  // Space opens the past event too; it is still interactive, never disabled.
  await expect(thirdTrigger).toBeEnabled()
  await page.keyboard.press('Space')
  await expect(thirdTrigger).toHaveAttribute('aria-expanded', 'true')
  await expect(demo.locator('button:visible', { hasText: 'Register' })).toHaveCount(2)

  // Shift+Tab back to the second title and close it with Space.
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(secondTrigger).toBeFocused()
  await page.keyboard.press('Space')
  await expect(secondTrigger).toHaveAttribute('aria-expanded', 'false')
  await expect(secondTrigger).toBeFocused()
  await expect(thirdTrigger).toHaveAttribute('aria-expanded', 'true')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
