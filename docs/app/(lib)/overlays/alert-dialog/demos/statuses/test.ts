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
  return demo.locator('[class*="__preview"]').first()
}

function collectErrors(page: Page) {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  return pageErrors
}

test('statuses shows two destructive triggers and an empty log', async ({ page }) => {
  const pageErrors = collectErrors(page)
  const demo = await openDemo(page)

  await expect(demo.getByRole('button', { name: 'Delete Photos' })).toBeVisible()
  await expect(demo.getByRole('button', { name: 'Discard Changes' })).toBeVisible()
  await expect(demo.getByText('Nothing deleted or discarded yet.')).toHaveAttribute('aria-live', 'polite')
  // Nothing is open until a trigger is pressed.
  await expect(page.getByRole('alertdialog')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('statuses danger alert focuses Cancel, ignores an outside press and closes on Escape', async ({
  page,
}) => {
  const pageErrors = collectErrors(page)
  const demo = await openDemo(page)

  const trigger = demo.getByRole('button', { name: 'Delete Photos' })
  await trigger.click()

  const alert = page.getByRole('alertdialog', { name: 'Delete 3 photos?' })
  await expect(alert).toBeVisible()
  await expect(alert.getByRole('img', { name: 'Error' })).toBeVisible()
  await expect(alert).toContainText('They leave the trail report for everyone and can’t be restored.')
  await expect(alert.getByRole('button', { name: 'Delete 3 Photos' })).toBeVisible()
  // No close X: the least destructive action takes focus on open.
  await expect(alert.getByRole('button', { name: 'Keep Photos' })).toBeFocused()
  await expect(alert.getByRole('button', { name: /close/i })).toHaveCount(0)

  // An outside press never dismisses an alert.
  await page.mouse.click(4, 4)
  await expect(alert).toBeVisible()

  // Esc means Cancel: the alert closes, focus goes back and nothing is deleted.
  await page.keyboard.press('Escape')
  await expect(alert).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(demo.getByText('Nothing deleted or discarded yet.')).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('statuses danger confirm stays open and busy until the delete finishes', async ({ page }) => {
  const pageErrors = collectErrors(page)
  const demo = await openDemo(page)

  await demo.getByRole('button', { name: 'Delete Photos' }).click()
  const alert = page.getByRole('alertdialog', { name: 'Delete 3 photos?' })
  await expect(alert.getByRole('button', { name: 'Keep Photos' })).toBeFocused()

  await alert.getByRole('button', { name: 'Delete 3 Photos' }).click()

  // While the confirmation runs, the confirm reads "Deleting…", Cancel is disabled
  // and the alert cannot be dismissed.
  const busy = alert.getByRole('button', { name: 'Deleting…' })
  await expect(busy).toHaveAttribute('aria-busy', 'true')
  await expect(alert.getByRole('button', { name: 'Keep Photos' })).toBeDisabled()
  await page.keyboard.press('Escape')
  await expect(alert).toBeVisible()

  // Then it closes on the result and the log reports it.
  await expect(alert).toBeHidden()
  await expect(demo.getByText('Deleted 3 photos from the trail report.')).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('statuses warning alert opens and cancels by keyboard, then discards by pointer', async ({
  page,
}) => {
  const pageErrors = collectErrors(page)
  const demo = await openDemo(page)

  const trigger = demo.getByRole('button', { name: 'Discard Changes' })
  await trigger.focus()
  await page.keyboard.press('Enter')

  const alert = page.getByRole('alertdialog', { name: 'Discard your edits to Ridge Loop?' })
  await expect(alert).toBeVisible()
  await expect(alert.getByRole('img', { name: 'Warning' })).toBeVisible()
  await expect(alert).toContainText('Changes made since you opened the trail are lost.')

  // Cancel has focus, so Enter keeps editing and focus returns to the trigger.
  const cancel = alert.getByRole('button', { name: 'Keep Editing' })
  await expect(cancel).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(alert).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(demo.getByText('Nothing deleted or discarded yet.')).toBeVisible()

  // Reopen by pointer and confirm.
  await trigger.click()
  await expect(alert).toBeVisible()
  await alert.getByRole('button', { name: 'Discard Edits' }).click()
  await expect(alert).toBeHidden()
  await expect(demo.getByText('Discarded the edits to Ridge Loop.')).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
