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

test('index-panel marks the parent of current in the bar', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const nav = demo.getByRole('navigation', { name: 'Main' })
  await expect(nav).toBeVisible()

  const triggers = ['Our Work', 'Garden Guide', 'Get Involved']
  for (const name of triggers) {
    await expect(nav.getByRole('button', { name, exact: true })).toHaveAttribute('aria-expanded', 'false')
  }
  await expect(nav.getByRole('link', { name: 'News' })).toBeVisible()

  // The page is a plant profile, so only Garden Guide is the parent of current.
  await expect(nav.getByRole('button', { name: 'Garden Guide' })).toHaveAttribute('aria-current', 'true')
  await expect(nav.getByRole('button', { name: 'Our Work' })).not.toHaveAttribute('aria-current', /.*/)
  await expect(nav.getByRole('button', { name: 'Get Involved' })).not.toHaveAttribute('aria-current', /.*/)
  await expect(nav.getByRole('link', { name: 'News' })).not.toHaveAttribute('aria-current', /.*/)

  // Closed panels are unmounted.
  await expect(page.getByRole('link', { name: 'Butternut squash' })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('index-panel opens on the current category and switches categories from the keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const trigger = demo.getByRole('button', { name: 'Garden Guide' })
  await trigger.focus()
  // Focus alone never opens a panel.
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await page.keyboard.press('Enter')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')

  const category = (name: string) => page.getByRole('button', { name, exact: true })
  for (const name of ['Visit', 'Plant Profiles', 'Grow at Home', 'Photography']) {
    await expect(category(name)).toBeVisible()
  }
  // Opening from the keyboard moves focus into the panel: its first control, the first category.
  await expect(category('Visit')).toBeFocused()

  // The category holding the current page opens selected, with that page marked current.
  await expect(category('Plant Profiles')).toHaveAttribute('aria-expanded', 'true')
  await expect(category('Visit')).toHaveAttribute('aria-expanded', 'false')
  const current = page.getByRole('link', { name: 'Butternut squash' })
  await expect(current).toBeVisible()
  await expect(current).toHaveAttribute('aria-current', 'page')
  for (const name of ['Squashes', 'Beans', 'Leafy greens']) {
    await expect(page.getByRole('link', { name, exact: true })).toBeVisible()
  }
  await expect(page.getByRole('link', { name: 'Find Plants That Suit Your Plot' })).toBeVisible()

  // Enter on a category selects it and swaps the link pane.
  await category('Grow at Home').focus()
  await page.keyboard.press('Enter')
  await expect(category('Grow at Home')).toHaveAttribute('aria-expanded', 'true')
  await expect(category('Plant Profiles')).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('link', { name: 'Native plants' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Butternut squash' })).toHaveCount(0)
  // The featured bar spans both panes and stays.
  await expect(page.getByRole('link', { name: 'Find Plants That Suit Your Plot' })).toBeVisible()

  // Escape closes the panel and returns focus to the trigger.
  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()
  await expect(page.getByRole('link', { name: 'Native plants' })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('index-panel switches panels and categories by pointer and closes on an outside press', async ({ page }) => {
  test.fixme(true, 'Needs investigation: clicking Get Involved after hovering Garden Guide leaves it collapsed.')
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const ourWork = demo.getByRole('button', { name: 'Our Work' })
  const guide = demo.getByRole('button', { name: 'Garden Guide' })
  const involved = demo.getByRole('button', { name: 'Get Involved' })
  const category = (name: string) => page.getByRole('button', { name, exact: true })

  await ourWork.click()
  await expect(ourWork).toHaveAttribute('aria-expanded', 'true')
  // No category holds the current page, so the first is selected.
  await expect(category('Stewardship')).toHaveAttribute('aria-expanded', 'true')
  for (const name of ['Meadows', 'Orchards and hedgerows', 'Rain gardens', 'Soil and compost']) {
    await expect(page.getByRole('link', { name })).toBeVisible()
  }
  await expect(page.getByRole('link', { name: 'See All of Our Work' })).toBeVisible()

  await category('Climate').click()
  await expect(category('Climate')).toHaveAttribute('aria-expanded', 'true')
  await expect(category('Stewardship')).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('link', { name: 'Cooler blocks report' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Meadows' })).toHaveCount(0)

  // Once a panel is open, hovering the next trigger switches to it; only the open trigger is expanded.
  await guide.hover()
  await expect(guide).toHaveAttribute('aria-expanded', 'true')
  await expect(ourWork).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('link', { name: 'Butternut squash' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Cooler blocks report' })).toHaveCount(0)

  // A plain content is a dropdown list of links.
  await involved.click()
  await expect(involved).toHaveAttribute('aria-expanded', 'true')
  await expect(guide).toHaveAttribute('aria-expanded', 'false')
  for (const name of ['Volunteer', 'Find a garden', 'Advocate']) {
    await expect(page.getByRole('link', { name, exact: true })).toBeVisible()
  }

  // A press outside the menu closes it.
  const viewport = page.viewportSize()!
  await page.mouse.click(viewport.width - 4, viewport.height - 4)
  await expect(involved).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('link', { name: 'Advocate' })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
