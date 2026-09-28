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

test('overview marks the parent of current in the bar', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const nav = demo.getByRole('navigation', { name: 'Main' })
  const triggers = nav.getByRole('button')
  await expect(triggers).toHaveText(['Our Work', 'Programs', 'Get Involved', 'About'])
  for (const name of ['Our Work', 'Programs', 'Get Involved', 'About']) {
    await expect(nav.getByRole('button', { name, exact: true })).toHaveAttribute('aria-expanded', 'false')
  }
  // The page sits in Programs › Garden Programs.
  await expect(nav.getByRole('button', { name: 'Programs' })).toHaveAttribute('aria-current', 'true')
  await expect(nav.locator('[aria-current]')).toHaveCount(1)
  // Closed panels are unmounted.
  await expect(page.getByRole('link', { name: 'Plot matching' })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('overview opens its panel from the keyboard and returns focus on Escape', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const trigger = demo.getByRole('button', { name: 'Programs' })
  await trigger.focus()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await page.keyboard.press('ArrowDown')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')

  // Focus moves to the panel's first link, the featured landing page.
  const featured = page.getByRole('link', { name: 'Programs', exact: true })
  await expect(featured).toBeFocused()
  await expect(page.getByText('We help neighbors start, tend and keep the gardens they love.')).toBeVisible()

  // Caps link groups, each list named by its heading link; the current page's heading is current.
  const heading = page.getByRole('link', { name: 'Garden Programs', exact: true })
  await expect(heading).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('link', { name: 'Our Impact', exact: true })).not.toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('list', { name: 'Garden Programs' }).getByRole('listitem')).toHaveCount(5)
  await expect(page.getByRole('list', { name: 'Our Impact' }).getByRole('listitem')).toHaveCount(3)
  await expect(page.getByRole('link', { name: 'Seed library' })).toBeVisible()

  // The promo card: its image and one title link.
  await expect(page.getByRole('img', { name: 'Volunteers planting along a creek' })).toBeVisible()
  await expect(page.getByRole('link', { name: "Together, Let's Grow Every Block" })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()
  await expect(page.getByRole('link', { name: 'Seed library' })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('overview opens on hover, switches panels and closes when the pointer leaves', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const ourWork = demo.getByRole('button', { name: 'Our Work' })
  const involved = demo.getByRole('button', { name: 'Get Involved' })

  await ourWork.hover()
  await expect(ourWork).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('link', { name: 'Our Work', exact: true })).toBeVisible()
  await expect(page.getByRole('list', { name: 'Stewardship' }).getByRole('listitem')).toHaveCount(4)
  await expect(page.getByRole('list', { name: 'Priorities' }).getByRole('listitem')).toHaveCount(5)
  await expect(page.getByRole('link', { name: 'Grown Close to Home' })).toBeVisible()

  // The next trigger switches the open panel; only it reads expanded.
  await involved.hover()
  await expect(involved).toHaveAttribute('aria-expanded', 'true')
  await expect(ourWork).toHaveAttribute('aria-expanded', 'false')
  for (const name of ['Volunteer', 'Share Your Land', 'Give', 'Partner']) {
    await expect(page.getByRole('link', { name, exact: true })).toBeVisible()
  }
  await expect(page.getByRole('link', { name: 'Why grow together' })).toHaveCount(0)

  // Leaving the menu closes the panel after the close delay.
  const viewport = page.viewportSize()!
  await page.mouse.move(viewport.width - 4, viewport.height - 4)
  await expect(involved).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('link', { name: 'Give monthly' })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('overview keeps its search panel open while the field is in use', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const involved = demo.getByRole('button', { name: 'Get Involved' })
  await involved.hover()
  await expect(involved).toHaveAttribute('aria-expanded', 'true')

  const field = page.getByLabel('Find a garden near you')
  await expect(field).toHaveAttribute('placeholder', 'Search by street or town…')
  await field.click()
  await field.fill('Maple Street')
  await expect(field).toHaveValue('Maple Street')
  await expect(field).toBeFocused()
  await expect(involved).toHaveAttribute('aria-expanded', 'true')

  // Escape from the field closes the panel (a first press may clear the field) and focus returns.
  await page.keyboard.press('Escape')
  if ((await involved.getAttribute('aria-expanded')) === 'true') await page.keyboard.press('Escape')
  await expect(involved).toHaveAttribute('aria-expanded', 'false')
  await expect(involved).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('overview toggles its dropdown by pointer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const about = demo.getByRole('button', { name: 'About' })
  await about.click()
  await expect(about).toHaveAttribute('aria-expanded', 'true')
  for (const name of ['Our story', 'Staff and board', 'Careers', 'Contact']) {
    await expect(page.getByRole('link', { name })).toBeVisible()
  }

  const viewport = page.viewportSize()!
  await page.mouse.click(viewport.width - 4, viewport.height - 4)
  await expect(about).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('link', { name: 'Our story' })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
