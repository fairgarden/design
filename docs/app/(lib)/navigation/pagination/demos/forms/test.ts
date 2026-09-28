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

// The pagers in demo order: numbered, compact, step, dots, more.
const pager = (demo: ReturnType<Page['locator']>, index: number) =>
  demo.getByRole('navigation', { name: 'Pagination' }).nth(index)

// The announced status line. Located by CSS, since the numbered form hides it at wide widths.
const status = (nav: ReturnType<Page['locator']>) => nav.locator('p[aria-live="polite"]')

test('forms shows five named pagers', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  await expect(demo.getByRole('navigation', { name: 'Pagination' })).toHaveCount(5)
  for (const name of ['numbered', 'compact', 'step', 'dots', 'more']) {
    await expect(demo.getByText(name, { exact: true })).toBeVisible()
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('forms numbered moves between pages by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const nav = pager(demo, 0)
  const previous = nav.getByRole('link', { name: 'Previous', exact: true })
  const next = nav.getByRole('link', { name: 'Next', exact: true })
  // The current page is unlinked and marked; located by CSS as the reflow may hide the numbers.
  const current = nav.locator('[aria-current="page"]')

  await expect(status(nav)).toHaveText('Page 5 of 12')
  await expect(current).toHaveCount(1)
  await expect(current).toHaveText(/^\s*Page\s*5\s*$/)
  await expect(current).not.toHaveAttribute('href', /.*/)
  // Every page has its own URL.
  await expect(previous).toHaveAttribute('href', '#page-4')
  await expect(previous).toHaveAttribute('rel', 'prev')
  await expect(next).toHaveAttribute('href', '#page-6')
  await expect(next).toHaveAttribute('rel', 'next')
  // Page 1 and 12 are always among the numbers, with 2 or 3 siblings around 5.
  await expect(nav.locator('a[href="#page-1"]')).toHaveCount(1)
  await expect(nav.locator('a[href="#page-12"]')).toHaveCount(1)
  await expect(nav.locator('a[href="#page-4"]')).toHaveCount(2)

  await next.click()
  await expect(status(nav)).toHaveText('Page 6 of 12')
  await expect(current).toHaveText(/^\s*Page\s*6\s*$/)
  await expect(next).toHaveAttribute('href', '#page-7')

  await previous.focus()
  await page.keyboard.press('Enter')
  await expect(status(nav)).toHaveText('Page 5 of 12')
  await expect(previous).toHaveAttribute('href', '#page-4')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('forms compact keeps the count and steps through it', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const nav = pager(demo, 1)
  const previous = nav.getByRole('link', { name: 'Previous', exact: true })
  const next = nav.getByRole('link', { name: 'Next', exact: true })

  // No page numbers at any width, only the count.
  await expect(nav.locator('ol')).toHaveCount(0)
  await expect(status(nav)).toBeVisible()
  await expect(status(nav)).toHaveText('Page 5 of 60')
  await expect(previous).toHaveAttribute('href', '#page-4')
  await expect(next).toHaveAttribute('href', '#page-6')

  await next.focus()
  await page.keyboard.press('Enter')
  await expect(status(nav)).toHaveText('Page 6 of 60')
  await page.keyboard.press('Enter')
  await expect(status(nav)).toHaveText('Page 7 of 60')

  await previous.click()
  await expect(status(nav)).toHaveText('Page 6 of 60')
  await expect(next).toHaveAttribute('href', '#page-7')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('forms step omits the control at the first page', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const nav = pager(demo, 2)
  const previous = nav.getByRole('button', { name: 'Previous', exact: true })
  const next = nav.getByRole('button', { name: 'Next', exact: true })

  await expect(status(nav)).toHaveText('3 of 12')
  await expect(previous).toBeVisible()
  await expect(next).toBeVisible()
  // Buttons, not links: the step pager is driven by onPageChange here.
  await expect(nav.getByRole('link')).toHaveCount(0)

  await next.focus()
  await page.keyboard.press('Enter')
  await expect(status(nav)).toHaveText('4 of 12')
  await page.keyboard.press('Space')
  await expect(status(nav)).toHaveText('5 of 12')

  for (const expected of ['4 of 12', '3 of 12', '2 of 12', '1 of 12']) {
    await previous.click()
    await expect(status(nav)).toHaveText(expected)
  }
  // At the first page Previous is omitted, never disabled.
  await expect(previous).toHaveCount(0)
  await expect(nav.locator('button[disabled], [aria-disabled="true"]')).toHaveCount(0)
  await expect(next).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('forms dots marks the current dot and walks both ends', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const nav = pager(demo, 3)
  const previous = nav.getByRole('button', { name: 'Previous photo' })
  const next = nav.getByRole('button', { name: 'Next photo' })
  // The dots repeat the announced count, so they are hidden from assistive technology.
  const dotRow = nav.locator('[class*="__dots"]')
  const dots = dotRow.locator(':scope > span')
  const currentDot = dotRow.locator('[aria-current="true"]')

  await expect(dotRow).toHaveAttribute('aria-hidden', 'true')
  await expect(dots).toHaveCount(6)
  await expect(status(nav)).toHaveText('2 of 6')
  await expect(currentDot).toHaveCount(1)
  await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true')

  await previous.click()
  await expect(status(nav)).toHaveText('1 of 6')
  await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true')
  await expect(previous).toHaveCount(0)

  await next.focus()
  for (let expected = 2; expected <= 5; expected += 1) {
    await page.keyboard.press('Enter')
    await expect(status(nav)).toHaveText(`${expected} of 6`)
    await expect(dots.nth(expected - 1)).toHaveAttribute('aria-current', 'true')
    await expect(currentDot).toHaveCount(1)
  }
  await next.click()
  await expect(status(nav)).toHaveText('6 of 6')
  await expect(dots.nth(5)).toHaveAttribute('aria-current', 'true')
  // At the last photo Next is omitted.
  await expect(next).toHaveCount(0)
  await expect(previous).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('forms more shows more until everything is showing', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const nav = pager(demo, 4)
  const more = nav.getByRole('link', { name: 'Show More' })

  await expect(status(nav)).toHaveText('Showing 20 of 54')
  await expect(more).toHaveAttribute('href', '#page-2')
  await expect(more).toHaveAttribute('rel', 'next')

  await more.click()
  await expect(status(nav)).toHaveText('Showing 40 of 54')
  await expect(more).toHaveAttribute('href', '#page-3')

  await more.focus()
  await page.keyboard.press('Enter')
  await expect(status(nav)).toHaveText('Showing 54 of 54')
  // Once everything shows, the Button is omitted.
  await expect(more).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
