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
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  // The rendered demo, without its code panel.
  return demo.locator('[class*="__preview"]').first()
}

test('trail marks its stages in words and attributes', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const preview = await open(page)
  const lists = preview.getByRole('list')
  await expect(lists).toHaveCount(2)

  // The trail: four milestones; the ongoing terminal past the end is aria-hidden, so not an item.
  const trail = lists.nth(0)
  const entries = trail.getByRole('listitem')
  await expect(entries).toHaveCount(4)
  await expect(trail.locator('li[aria-hidden="true"]')).toHaveCount(1)
  await expect(preview.getByRole('heading', { level: 3 }).first()).toHaveText('The first 40 acres')
  await expect(entries.getByRole('heading', { level: 3 })).toHaveText([
    'The first 40 acres',
    'The meadow comes back',
    'Headwaters campaign',
    'Trail to the ridge',
  ])

  // Dates are machine-readable time elements; "Planned" is said in words.
  await expect(entries.nth(0).locator('time')).toHaveAttribute('datetime', '1987')
  await expect(entries.nth(1).locator('time')).toHaveAttribute('datetime', '2004')
  await expect(entries.nth(2).locator('time')).toHaveAttribute('datetime', '2026-09-22')
  await expect(entries.nth(2).locator('time')).toHaveText('Today, 22 Sep 2026')
  await expect(entries.nth(3)).toContainText('2028 · Planned')

  // Only the current entry is the step in progress.
  await expect(trail.locator('[aria-current]')).toHaveCount(1)
  await expect(entries.nth(2)).toHaveAttribute('aria-current', 'step')
  for (const index of [0, 1, 3]) {
    await expect(entries.nth(index)).not.toHaveAttribute('aria-current', /.+/)
  }

  // Markers and the spine are decorative; the caption defines "now" in words.
  for (const entry of await entries.all()) {
    await expect(entry.locator('[aria-hidden="true"]').first()).toBeAttached()
  }
  await expect(preview.getByText('● marks today, 22 Sep 2026.', { exact: true })).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('trail title link follows by keyboard and pointer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const preview = await open(page)
  const links = preview.getByRole('link')
  await expect(links).toHaveCount(1)
  const link = preview.getByRole('link', { name: 'The meadow comes back' })
  await expect(link).toHaveAttribute('href', '#trail')
  // The link sits inside the entry's title heading.
  await expect(
    preview.getByRole('heading', { level: 3, name: 'The meadow comes back' }).getByRole('link'),
  ).toHaveCount(1)

  await link.focus()
  await expect(link).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#trail$/)

  await page.evaluate(() => history.replaceState(null, '', location.pathname))
  await expect(page).not.toHaveURL(/#trail$/)
  await link.click()
  await expect(page).toHaveURL(/#trail$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('trail date block stacks month, day and weekday', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const preview = await open(page)
  const schedule = preview.getByRole('list').nth(1)
  const entries = schedule.getByRole('listitem')
  await expect(entries).toHaveCount(2)
  // No stage is set, so nothing is current.
  await expect(schedule.locator('[aria-current]')).toHaveCount(0)

  const expected = [
    { dateTime: '2026-10-03', month: 'Oct', day: '3', weekday: 'Sat', title: 'Night walk', text: 'North kiosk, 7 p.m.' },
    { dateTime: '2026-10-11', month: 'Oct', day: '11', weekday: 'Sun', title: 'Seed swap', text: 'Barn, 10 a.m.' },
  ]
  for (const [index, item] of expected.entries()) {
    const entry = entries.nth(index)
    const time = entry.locator('time')
    await expect(time).toHaveAttribute('datetime', item.dateTime)
    await expect(time.locator('> span')).toHaveText([item.month, item.day, item.weekday])
    await expect(entry.getByRole('heading', { level: 3 })).toHaveText(item.title)
    await expect(entry).toContainText(item.text)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
