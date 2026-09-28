import path from 'node:path'
import { test, expect, type Locator, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

async function openDemo(page: Page) {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return { demo, pageErrors }
}

// The box is the input's nearest scope-writing ancestor (Base UI's InputGroup).
const boxOf = (input: Locator) => input.locator('xpath=ancestor::*[@data-ground][1]')

test('states shows single, multiple, grouped, creatable, invalid and disabled boxes', async ({
  page,
}) => {
  const { demo, pageErrors } = await openDemo(page)

  await expect(demo.getByRole('combobox')).toHaveCount(6)

  const species = demo.getByRole('combobox', { name: 'Species', exact: true })
  await expect(species).toHaveValue('')
  await expect(species).toHaveAttribute('placeholder', 'Start typing a name…')
  await expect(species).toHaveAttribute('aria-expanded', 'false')

  const birds = demo.getByRole('combobox', { name: 'Birds Seen', exact: true })
  const birdsBox = boxOf(birds)
  await expect(birdsBox.getByRole('button', { name: /^Remove / })).toHaveCount(2)
  await expect(birdsBox.getByRole('button', { name: 'Remove Great Blue Heron' })).toBeVisible()
  await expect(birdsBox.getByRole('button', { name: 'Remove Great Egret' })).toBeVisible()

  const habitat = demo.getByRole('combobox', { name: 'Habitat', exact: true })
  await expect(habitat).toHaveAttribute('placeholder', 'Search habitats…')

  const tags = demo.getByRole('combobox', { name: /^Tags/ })
  await expect(tags).toHaveAttribute('placeholder', 'Add a tag…')
  await expect(boxOf(tags).getByRole('button', { name: /^Remove / })).toHaveCount(0)

  const leader = demo.getByRole('combobox', { name: 'Leader', exact: true })
  await expect(leader).toHaveAttribute('aria-invalid', 'true')
  await expect(demo.getByText('Choose a leader from the list.')).toBeVisible()

  const reviewer = demo.getByRole('combobox', { name: 'Reviewer', exact: true })
  await expect(reviewer).toBeDisabled()
  await expect(reviewer).toHaveValue('Osprey')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states filters, chooses and dismisses from the keyboard', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const species = demo.getByRole('combobox', { name: 'Species', exact: true })
  await species.focus()
  await page.keyboard.type('great')

  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await expect(species).toHaveAttribute('aria-expanded', 'true')
  await expect(listbox.getByRole('option')).toHaveCount(2)
  await expect(listbox.getByRole('option', { name: 'Great Blue Heron' })).toBeVisible()
  await expect(listbox.getByRole('option', { name: 'Great Egret' })).toBeVisible()

  // Focus stays in the input while the arrow keys highlight rows.
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await expect(species).toBeFocused()
  await expect(listbox.getByRole('option', { name: 'Great Egret' })).toHaveAttribute(
    'data-highlighted',
    '',
  )
  await page.keyboard.press('Enter')
  await expect(listbox).toBeHidden()
  await expect(species).toHaveValue('Great Egret')
  await expect(species).toBeFocused()

  // The chosen option is marked in the list.
  await page.keyboard.press('ArrowDown')
  await expect(listbox).toBeVisible()
  await expect(listbox.getByRole('option', { name: 'Great Egret' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.keyboard.press('Escape')
  await expect(listbox).toBeHidden()
  await expect(species).toBeFocused()

  // No matches keeps what the user typed instead of closing.
  await species.fill('')
  await page.keyboard.type('egrit')
  await expect(page.getByText("No matches for 'egrit'")).toBeVisible()
  await expect(page.getByRole('option')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(page.getByText("No matches for 'egrit'")).toBeHidden()
  await expect(species).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states removes chips with Backspace and by pointer', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const birds = demo.getByRole('combobox', { name: 'Birds Seen', exact: true })
  const birdsBox = boxOf(birds)
  const removes = birdsBox.getByRole('button', { name: /^Remove / })
  await expect(removes).toHaveCount(2)

  // Backspace in the empty input focuses the last chip; a second removes it.
  await birds.focus()
  await page.keyboard.press('Backspace')
  await expect(removes).toHaveCount(2)
  await expect(birds).not.toBeFocused()
  await page.keyboard.press('Backspace')
  await expect(removes).toHaveCount(1)
  await expect(birdsBox.getByRole('button', { name: 'Remove Great Egret' })).toHaveCount(0)

  // Pointer: the chevron opens the list; choosing adds a chip.
  await birdsBox.getByRole('button', { name: 'Show options' }).click()
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await expect(listbox.getByRole('option')).toHaveCount(16)
  await expect(listbox.getByRole('option', { name: 'Great Blue Heron' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await listbox.getByRole('option', { name: 'Osprey' }).click()
  await expect(removes).toHaveCount(2)
  await expect(birdsBox.getByRole('button', { name: 'Remove Osprey' })).toBeVisible()

  // A click outside dismisses.
  await page.mouse.click(2, 2)
  await expect(listbox).toBeHidden()

  await birdsBox.getByRole('button', { name: 'Remove Great Blue Heron' }).click()
  await expect(removes).toHaveCount(1)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states groups habitats and clears the choice', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const habitat = demo.getByRole('combobox', { name: 'Habitat', exact: true })
  const box = boxOf(habitat)
  await box.getByRole('button', { name: 'Show options' }).click()

  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  await expect(listbox.getByRole('group')).toHaveCount(2)
  await expect(listbox.getByText('Wetland', { exact: true })).toBeVisible()
  await expect(listbox.getByText('Upland', { exact: true })).toBeVisible()
  await expect(listbox.getByRole('option')).toHaveCount(4)

  await listbox.getByRole('option', { name: 'Oak Savanna' }).click()
  await expect(listbox).toBeHidden()
  await expect(habitat).toHaveValue('Oak Savanna')

  await box.getByRole('button', { name: 'Clear' }).click()
  await expect(habitat).toHaveValue('')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('states creates a tag that is not in the list', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const tags = demo.getByRole('combobox', { name: /^Tags/ })
  const box = boxOf(tags)
  await tags.focus()
  await page.keyboard.type('Owl Prowl')

  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  const add = listbox.getByRole('option', { name: "Add 'Owl Prowl'" })
  await expect(add).toBeVisible()
  await expect(listbox.getByRole('option')).toHaveCount(1)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')

  await expect(box.getByRole('button', { name: 'Remove Owl Prowl' })).toBeVisible()
  await expect(box.getByRole('button', { name: /^Remove / })).toHaveCount(1)

  // An exact match offers no add row; the new tag is now an option.
  await tags.fill('')
  await page.keyboard.type('family')
  await expect(listbox.getByRole('option', { name: 'Family' })).toBeVisible()
  await expect(listbox.getByRole('option', { name: /^Add / })).toHaveCount(0)
  await listbox.getByRole('option', { name: 'Family' }).click()
  await expect(box.getByRole('button', { name: /^Remove / })).toHaveCount(2)

  await tags.fill('')
  await page.keyboard.press('ArrowDown')
  await expect(listbox.getByRole('option', { name: 'Owl Prowl' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.keyboard.press('Escape')
  await expect(listbox).toBeHidden()
  await expect(tags).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
