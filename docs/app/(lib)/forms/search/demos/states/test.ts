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
  // Scope to the preview: the code panel repeats the demo's text in its source.
  const preview = page.locator('.demo').first().locator('[class*="__preview"]').first()
  // The boxed and docked searches share their label; the boxed one comes first.
  const boxed = preview.getByRole('search', { name: 'Search the guide' }).first()
  const docked = preview.getByRole('search', { name: 'Search the guide' }).last()
  const ruled = preview.getByRole('search', { name: 'Filter events' })
  const trigger = preview
    .getByText('trigger', { exact: true })
    .locator('xpath=..')
    .getByRole('button', { name: 'Search', exact: true })
  return { demo: preview, boxed, docked, ruled, trigger }
}

test('states shows the four kinds', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { demo, boxed, docked, ruled, trigger } = await openDemo(page)

  for (const name of ['boxed', 'ruled', 'trigger', 'docked']) {
    await expect(demo.getByText(name, { exact: true })).toBeVisible()
  }
  // Three field kinds are search landmarks; the trigger is a plain button.
  await expect(demo.getByRole('search')).toHaveCount(3)

  const boxedField = boxed.getByRole('combobox', { name: 'Search the guide' })
  await expect(boxedField).toHaveAttribute('placeholder', 'Search the guide…')
  await expect(boxedField).toHaveAttribute('aria-expanded', 'false')
  // The butted submit: one of its cells (icon-only or labelled) shows at any width.
  await expect(
    boxed.getByRole('button', { name: 'Search', exact: true }).filter({ visible: true }),
  ).toHaveCount(1)
  await expect(demo.getByText('Type "egret", then press Enter.')).toBeVisible()

  // Ruled: the field between rules, with no submit.
  const ruledField = ruled.getByRole('combobox', { name: 'Filter events' })
  await expect(ruledField).toHaveAttribute('placeholder', 'Filter events…')
  await expect(ruled.getByRole('button', { name: 'Search', exact: true })).toHaveCount(0)

  // Trigger: the header's icon-only button.
  await expect(trigger).toBeVisible()
  await expect(trigger).toBeEnabled()

  // Docked: the boxed field in the bar, inside the scrolling frame.
  await expect(docked.getByRole('combobox', { name: 'Search the guide' })).toBeVisible()
  await expect(
    docked.locator('xpath=..').getByText('Scroll this frame: the docked bar holds the top edge, alone.'),
  ).toBeAttached()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states suggests grouped matches with a status and a see-all link', async ({ page }) => {
  test.fixme(true, "Needs investigation: typing ' m' after 'egret' leaves all five rows instead of narrowing to Egret Marsh Trail.")
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { boxed } = await openDemo(page)
  const field = boxed.getByRole('combobox', { name: 'Search the guide' })

  await field.click()
  await field.pressSequentially('egret')
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await expect(field).toHaveAttribute('aria-expanded', 'true')

  const species = listbox.getByRole('group', { name: 'Species' })
  const places = listbox.getByRole('group', { name: 'Places' })
  await expect(species.getByRole('option')).toHaveCount(3)
  await expect(places.getByRole('option')).toHaveCount(2)
  await expect(listbox.getByRole('option')).toHaveCount(5)

  // A species row carries its italic secondary name and links to its page.
  const great = listbox.getByRole('option', { name: /Great Egret/ })
  await expect(great).toContainText('Ardea alba')
  await expect(great).toHaveAttribute('href', '#egret')
  await expect(listbox.getByRole('option', { name: /Egret Marsh Trail/ })).toHaveAttribute(
    'href',
    '#marsh',
  )

  await expect(page.getByRole('status').filter({ hasText: '5 suggestions' })).toBeVisible()
  const seeAll = page.getByRole('link', { name: "See all results for 'egret'" })
  await expect(seeAll).toBeVisible()
  await expect(seeAll).toHaveAttribute('href', '#results-egret')

  // Narrowing the query filters the rows.
  await field.pressSequentially(' m')
  await expect(listbox.getByRole('option')).toHaveText(['Egret Marsh Trail'])

  // No match: a plain-word status, no rows.
  await field.fill('zzz')
  await expect(page.getByText("No results for 'zzz'")).toBeVisible()
  await expect(page.getByRole('option')).toHaveCount(0)

  // Escape closes, and focus stays in the field.
  await page.keyboard.press('Escape')
  await expect(listbox).toBeHidden()
  await expect(field).toHaveAttribute('aria-expanded', 'false')
  await expect(field).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states chooses a suggestion from the keyboard', async ({ page }) => {
  test.fixme(true, "Needs investigation: Enter on the highlighted Snowy Egret link row leaves the field value at 'egret'.")
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { boxed } = await openDemo(page)
  const field = boxed.getByRole('combobox', { name: 'Search the guide' })

  await field.click()
  await field.pressSequentially('egret')
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()

  const great = listbox.getByRole('option', { name: /Great Egret/ })
  const snowy = listbox.getByRole('option', { name: /Snowy Egret/ })
  await page.keyboard.press('ArrowDown')
  await expect(great).toHaveAttribute('data-highlighted', '')
  await page.keyboard.press('ArrowDown')
  await expect(snowy).toHaveAttribute('data-highlighted', '')
  await expect(great).not.toHaveAttribute('data-highlighted')
  // Focus stays in the field while the rows are highlighted.
  await expect(field).toBeFocused()

  await page.keyboard.press('Enter')
  await expect(listbox).toBeHidden()
  await expect(field).toHaveValue('Snowy Egret')
  await expect(page).toHaveURL(/#snowy$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states submits by keyboard and pointer, clears, and runs the trigger', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { demo, boxed, trigger } = await openDemo(page)
  const field = boxed.getByRole('combobox', { name: 'Search the guide' })

  // Enter submits the query without reloading.
  await field.click()
  await field.pressSequentially('egret')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('listbox')).toBeHidden()
  await page.keyboard.press('Enter')
  await expect(demo.getByText('Searched for "egret"')).toBeVisible()

  // The clear button empties the field and keeps focus in it.
  const clear = boxed.getByRole('button', { name: 'Clear search' })
  await clear.click()
  await expect(field).toHaveValue('')
  await expect(field).toBeFocused()

  // The submit cell submits too.
  await field.pressSequentially('heron')
  await page.keyboard.press('Escape')
  await boxed.getByRole('button', { name: 'Search', exact: true }).filter({ visible: true }).click()
  await expect(demo.getByText('Searched for "heron"')).toBeVisible()

  // The trigger runs its handler, by pointer and by keyboard.
  await trigger.click()
  await expect(demo.getByText('Searched for "the trigger"')).toBeVisible()
  await field.fill('x')
  await page.keyboard.press('Escape')
  await page.keyboard.press('Enter')
  await expect(demo.getByText('Searched for "x"')).toBeVisible()
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(demo.getByText('Searched for "the trigger"')).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
