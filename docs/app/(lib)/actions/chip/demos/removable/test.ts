import path from 'node:path'
import { test, expect, type Locator, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

// The removable filters, in order, and the locked chip that closes each set.
const filters = ['Oak Savanna', 'Wetland', 'Tallgrass Prairie', 'Riparian Forest']
const locked = 'Members Only'

async function openDemo(page: Page) {
  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // One set of chips on the paper face, one on the forest field, sharing one list of filters.
  const lists = demo.getByRole('list', { name: 'Active filters' })
  const paper = lists.nth(0)
  const forest = lists.nth(1)
  return {
    demo,
    lists,
    paper,
    forest,
    status: demo.locator('p[aria-live="polite"]', { hasText: 'filters active' }),
    reset: demo.getByRole('button', { name: 'Reset', exact: true }),
  }
}

/** A chip's ×, by the chip's label, in one set. */
function remove(list: Locator, label: string) {
  return list.getByRole('button', { name: `Remove ${label}`, exact: true })
}

/** The chip labels a set shows, in order. */
function chips(list: Locator) {
  return list.getByRole('listitem')
}

test('removable shows the filters as removable chips on paper and on the forest field', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { lists, paper, forest, status, reset } = await openDemo(page)
  await expect(lists).toHaveCount(2)

  // Each set sits directly in its ground: the paper face follows the page mode, the forest
  // field is always dark.
  const paperGround = paper.locator('xpath=..')
  const forestGround = forest.locator('xpath=..')
  await expect(paperGround).toHaveAttribute('data-ground', 'paper')
  await expect(paperGround).toHaveAttribute('data-scheme', 'page')
  await expect(paperGround).not.toHaveAttribute('data-theme')
  await expect(paperGround.getByText('paper', { exact: true })).toBeVisible()
  await expect(forestGround).toHaveAttribute('data-ground', 'forest')
  await expect(forestGround).toHaveAttribute('data-scheme', 'dark')
  await expect(forestGround).toHaveAttribute('data-theme', 'dark')
  await expect(forestGround.getByText('forest', { exact: true })).toBeVisible()

  for (const list of [paper, forest]) {
    await expect(chips(list)).toHaveText([...filters, locked])
    await expect(list.getByRole('button')).toHaveCount(filters.length + 1)

    // Each × is named "Remove [label]" and can be pressed.
    for (const label of filters) {
      const button = remove(list, label)
      await expect(button).toBeEnabled()
      await expect(button.locator('xpath=..')).not.toHaveAttribute('data-disabled')
    }

    // The locked chip keeps its × but can't be removed: its own name, disabled, and the chip
    // marked disabled (the muted label and dotted edge).
    const lockedButton = list.getByRole('button', { name: `Remove ${locked} (locked)`, exact: true })
    await expect(lockedButton).toBeDisabled()
    await expect(lockedButton.locator('xpath=..')).toHaveAttribute('data-disabled', '')
  }

  // Each chip carries the scope of its own ground, so its roles resolve there.
  const paperChip = remove(paper, 'Wetland').locator('xpath=..')
  const forestChip = remove(forest, 'Wetland').locator('xpath=..')
  await expect(paperChip).toHaveAttribute('data-ground', 'paper')
  await expect(forestChip).toHaveAttribute('data-ground', 'forest')
  await expect(forestChip).toHaveAttribute('data-scheme', 'dark')

  // The × sits in a 44 px target.
  const target = await remove(paper, 'Oak Savanna').evaluate((button) => {
    const after = getComputedStyle(button, '::after')
    return { width: after.width, height: after.height }
  })
  expect(target).toEqual({ width: '44px', height: '44px' })

  await expect(status).toHaveAttribute('aria-live', 'polite')
  await expect(status).toHaveText('4 of 4 filters active')
  await expect(reset).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('removable removes a chip from both sets by pointer, and Reset brings it back', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { paper, forest, status, reset } = await openDemo(page)

  const button = remove(paper, 'Wetland')
  const glyph = button.locator('path')
  await expect(glyph).toHaveCount(2)
  // At rest the × draws its rest weight.
  await expect(glyph.nth(0)).toBeVisible()
  await expect(glyph.nth(1)).toBeHidden()
  const restInk = await button.evaluate((element) => getComputedStyle(element).color)

  // Hovering steps the glyph to the next stroke weight.
  await button.hover()
  await expect(glyph.nth(0)).toBeHidden()
  await expect(glyph.nth(1)).toBeVisible()

  // Pressing fills the × cell with the inverse pair: the chip's ink behind a light glyph.
  await page.mouse.down()
  await expect
    .poll(() => button.evaluate((element) => getComputedStyle(element).backgroundColor))
    .toBe(restInk)
  expect(await button.evaluate((element) => getComputedStyle(element).color)).not.toBe(restInk)

  // Releasing removes the value, from both sets.
  await page.mouse.up()
  const without = filters.filter((label) => label !== 'Wetland')
  await expect(chips(paper)).toHaveText([...without, locked])
  await expect(chips(forest)).toHaveText([...without, locked])
  await expect(status).toContainText('3 of 4 filters active')

  // A removal from the forest set goes from both too.
  await remove(forest, 'Oak Savanna').click()
  const fewer = without.filter((label) => label !== 'Oak Savanna')
  await expect(chips(paper)).toHaveText([...fewer, locked])
  await expect(chips(forest)).toHaveText([...fewer, locked])
  await expect(status).toContainText('2 of 4 filters active')

  await reset.click()
  await expect(chips(paper)).toHaveText([...filters, locked])
  await expect(chips(forest)).toHaveText([...filters, locked])
  await expect(status).toHaveText('4 of 4 filters active')
  await expect(reset).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('removable removes chips from the keyboard, passing over the locked chip', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { paper, forest, status, reset } = await openDemo(page)

  // Tab walks the ×s in order; the locked chip's disabled × is not a stop.
  await remove(paper, 'Oak Savanna').focus()
  await page.keyboard.press('Tab')
  await expect(remove(paper, 'Wetland')).toBeFocused()
  // The focused × draws its own ring.
  await expect
    .poll(() => remove(paper, 'Wetland').evaluate((element) => getComputedStyle(element).outlineStyle))
    .toBe('solid')
  await page.keyboard.press('Tab')
  await expect(remove(paper, 'Tallgrass Prairie')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(remove(paper, 'Riparian Forest')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(remove(forest, 'Oak Savanna')).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(remove(paper, 'Riparian Forest')).toBeFocused()

  // Enter removes the value, from both sets.
  await page.keyboard.press('Enter')
  const without = filters.filter((label) => label !== 'Riparian Forest')
  await expect(chips(paper)).toHaveText([...without, locked])
  await expect(chips(forest)).toHaveText([...without, locked])
  await expect(status).toContainText('3 of 4 filters active')

  // So does Space.
  await remove(forest, 'Wetland').focus()
  await page.keyboard.press('Space')
  const fewer = without.filter((label) => label !== 'Wetland')
  await expect(chips(paper)).toHaveText([...fewer, locked])
  await expect(chips(forest)).toHaveText([...fewer, locked])
  await expect(status).toContainText('2 of 4 filters active')

  await reset.focus()
  await page.keyboard.press('Enter')
  await expect(chips(paper)).toHaveText([...filters, locked])
  await expect(chips(forest)).toHaveText([...filters, locked])
  await expect(status).toHaveText('4 of 4 filters active')
  await expect(reset).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('removable keeps the locked chip when every other filter is removed', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const { paper, forest, status, reset } = await openDemo(page)

  for (const [index, label] of filters.entries()) {
    await remove(paper, label).click()
    await expect(status).toContainText(`${filters.length - index - 1} of 4 filters active`)
  }
  await expect(chips(paper)).toHaveText([locked])
  await expect(chips(forest)).toHaveText([locked])
  await expect(reset).toBeVisible()

  // The locked × stays disabled, and hovering it leaves the glyph at its rest weight.
  const lockedButton = paper.getByRole('button', { name: `Remove ${locked} (locked)`, exact: true })
  await expect(lockedButton).toBeDisabled()
  await lockedButton.hover()
  const glyph = lockedButton.locator('path')
  await expect(glyph.nth(0)).toBeVisible()
  await expect(glyph.nth(1)).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
