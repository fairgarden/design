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
  // The site's one toast bar, mounted by its layout outside the demo.
  const bar = page.getByRole('region', { name: 'Notifications' })
  return { demo, bar }
}

test('statuses undoes a removal from the action toast', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { demo, bar } = await openDemo(page)
  const remove = demo.getByRole('button', { name: 'Remove Items' })
  const status = demo.getByText(/^Trip list: \d+ items\./)

  await expect(status).toHaveText(/^Trip list: 3 items\./)
  await expect(status).toHaveAttribute('aria-live', 'polite')
  await expect(remove).toBeEnabled()

  await remove.click()
  await expect(remove).toBeDisabled()
  await expect(status).toHaveText(/^Trip list: 0 items\./)

  // An action toast: success glyph, title, description and an Undo cell; it persists.
  const toast = bar.getByRole('dialog', { name: '3 items removed' })
  await expect(toast).toBeVisible()
  await expect(toast).toHaveAccessibleDescription('They left your trip list.')
  await expect(toast.getByRole('img', { name: 'Success' })).toBeVisible()
  // Base UI keeps the close button aria-hidden until the stack expands (hover or focus).
  await expect(toast.getByRole('button', { name: 'Close', includeHidden: true })).toBeVisible()

  // Undo runs busy: the cell reads "Undoing…" with aria-busy, then the toast closes.
  await toast.getByRole('button', { name: 'Undo' }).click()
  const busy = toast.getByRole('button', { name: 'Undoing…' })
  await expect(busy).toBeVisible()
  await expect(busy).toHaveAttribute('aria-busy', 'true')

  await expect(toast).toBeHidden()
  await expect(status).toHaveText(/^Trip list: 3 items\./)
  await expect(remove).toBeEnabled()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('statuses shows each status glyph and queues toasts one at a time', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { demo, bar } = await openDemo(page)

  // Neutral: no glyph.
  await demo.getByRole('button', { name: 'Save Draft' }).click()
  const draft = bar.getByRole('dialog', { name: 'Draft saved' })
  await expect(draft).toBeVisible()
  await expect(draft).toHaveAccessibleDescription('Saved 2 minutes ago.')
  await expect(draft.getByRole('img')).toHaveCount(0)

  // Info queues on top: one toast shows at a time, with the count.
  await demo.getByRole('button', { name: 'Show Info' }).click()
  const info = bar.getByRole('dialog', { name: 'Trail map updated' })
  await expect(info).toBeVisible()
  await expect(info).toHaveAccessibleDescription('The Alder crossing detour is marked.')
  await expect(info.getByRole('img', { name: 'Information' })).toBeVisible()
  await expect(info.getByText('1 of 2')).toBeVisible()
  await expect(draft).toBeHidden()

  // Closing it brings the waiting toast back, with no count.
  await info.getByRole('button', { name: 'Close', includeHidden: true }).click()
  await expect(info).toBeHidden()
  await expect(draft).toBeVisible()
  await expect(bar.getByText(/^\d+ of \d+$/)).toHaveCount(0)
  await draft.getByRole('button', { name: 'Close', includeHidden: true }).click()
  await expect(draft).toBeHidden()

  // Warning: its glyph, and it persists until dismissed.
  await demo.getByRole('button', { name: 'Show Warning' }).click()
  const warning = bar.getByRole('dialog', { name: 'Storm warning' })
  await expect(warning).toBeVisible()
  await expect(warning).toHaveAccessibleDescription('Ridge trails close at 3 pm today.')
  await expect(warning.getByRole('img', { name: 'Warning' })).toBeVisible()
  await warning.getByRole('button', { name: 'Close', includeHidden: true }).click()
  await expect(warning).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('statuses announces the error toast and dismisses it from the keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { demo, bar } = await openDemo(page)
  const trigger = demo.getByRole('button', { name: 'Show Error' })
  await trigger.focus()
  await page.keyboard.press('Enter')

  // Danger is high priority: an alertdialog, announced assertively through an alert.
  // Until the bar is focused the toast itself is aria-hidden, so include hidden nodes.
  const title = 'Couldn’t sync your notes'
  const error = bar.getByRole('alertdialog', { name: title, includeHidden: true })
  await expect(error).toBeVisible()
  await expect(page.getByRole('alert').filter({ hasText: title })).toHaveCount(1)
  await expect(error.getByRole('img', { name: 'Error', includeHidden: true })).toHaveCount(1)
  await expect(
    error.getByRole('button', { name: 'Try Again', includeHidden: true }),
  ).toBeVisible()
  await expect(
    error.getByRole('button', { name: 'Discard Notes', includeHidden: true }),
  ).toBeVisible()

  // F6 moves focus to the bar, Tab into the toast, and Esc dismisses it,
  // returning focus to the control that had it.
  await page.keyboard.press('F6')
  await expect(bar).toBeFocused()
  await expect(error).not.toHaveAttribute('aria-hidden', 'true')
  await page.keyboard.press('Tab')
  await expect(error).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(error).toBeHidden()
  await expect(trigger).toBeFocused()

  // Pointer: the destructive action closes it too.
  await trigger.click()
  await expect(error).toBeVisible()
  await error.getByRole('button', { name: 'Discard Notes', includeHidden: true }).click()
  await expect(error).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
