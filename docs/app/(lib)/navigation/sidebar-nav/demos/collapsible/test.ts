import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('collapsible opens only the group holding the current page', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const nav = demo.getByRole('navigation', { name: 'Handbook' })
  await expect(nav).toBeVisible()
  await expect(nav.locator(':scope > ul > li')).toHaveCount(4)

  // Groups with an index page keep a heading link and get a glyph toggle named "{title} pages".
  await expect(nav.getByRole('link', { name: /^getting started$/i })).toHaveAttribute(
    'href',
    '/handbook',
  )
  await expect(nav.getByRole('link', { name: /^garden care$/i })).toHaveAttribute(
    'href',
    '/handbook/garden-care',
  )
  await expect(nav.getByRole('link', { name: /^shared spaces$/i })).toHaveAttribute(
    'href',
    '/handbook/shared-spaces',
  )
  const toggle = (name: string) => nav.getByRole('button', { name, exact: true })
  // The group without an index page: its whole heading row is the toggle, named by its text.
  const forms = nav.getByRole('button', { name: /^forms$/i })
  await expect(nav.getByRole('button')).toHaveCount(4)
  await expect(nav.getByRole('link', { name: /^forms$/i })).toHaveCount(0)

  // Garden care holds the current page, so it alone starts open.
  await expect(toggle('Garden care pages')).toHaveAttribute('aria-expanded', 'true')
  await expect(toggle('Getting started pages')).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle('Shared spaces pages')).toHaveAttribute('aria-expanded', 'false')
  await expect(forms).toHaveAttribute('aria-expanded', 'false')

  const gardenCare = nav.getByRole('list', { name: /^garden care$/i })
  await expect(gardenCare.getByRole('link')).toHaveText([
    'Soil and beds',
    'Watering',
    'Composting',
    'Seed saving',
  ])
  await expect(nav.getByRole('link', { name: 'Watering', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(nav.locator('[aria-current]')).toHaveCount(1)

  // The closed groups' pages are not shown.
  await expect(nav.getByRole('link', { name: 'Welcome', exact: true })).toBeHidden()
  await expect(nav.getByRole('link', { name: 'Tool shed', exact: true })).toBeHidden()
  await expect(nav.getByRole('link', { name: 'Plot application', exact: true })).toBeHidden()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('collapsible folds groups independently by pointer and keyboard', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const nav = demo.getByRole('navigation', { name: 'Handbook' })
  const toggle = (name: string) => nav.getByRole('button', { name, exact: true })
  const link = (name: string) => nav.getByRole('link', { name, exact: true })

  // Pointer: opening Getting started leaves Garden care open too; several groups may be open.
  await toggle('Getting started pages').click()
  await expect(toggle('Getting started pages')).toHaveAttribute('aria-expanded', 'true')
  await expect(nav.getByRole('list', { name: /^getting started$/i }).getByRole('link')).toHaveText([
    'Welcome',
    'Your first season',
    'Plot agreements',
  ])
  await expect(toggle('Garden care pages')).toHaveAttribute('aria-expanded', 'true')
  await expect(link('Watering')).toBeVisible()

  // Pointer: closing Garden care hides its pages, current page included, and leaves the heading link.
  await toggle('Garden care pages').click()
  await expect(toggle('Garden care pages')).toHaveAttribute('aria-expanded', 'false')
  await expect(link('Watering')).toBeHidden()
  await expect(nav.getByRole('link', { name: /^garden care$/i })).toBeVisible()
  await expect(link('Welcome')).toBeVisible()

  // Keyboard: Enter opens the Shared spaces group from its focused toggle; focus stays on it.
  await toggle('Shared spaces pages').focus()
  await page.keyboard.press('Enter')
  await expect(toggle('Shared spaces pages')).toHaveAttribute('aria-expanded', 'true')
  await expect(nav.getByRole('list', { name: /^shared spaces$/i }).getByRole('link')).toHaveText([
    'Tool shed',
    'Water points',
    'Work days',
  ])
  await expect(toggle('Shared spaces pages')).toBeFocused()

  // Keyboard: the Forms heading row is itself the toggle; Space opens it, Enter closes it.
  const forms = nav.getByRole('button', { name: /^forms$/i })
  await forms.focus()
  await page.keyboard.press('Space')
  await expect(forms).toHaveAttribute('aria-expanded', 'true')
  await expect(nav.getByRole('list', { name: /^forms$/i }).getByRole('link')).toHaveText([
    'Plot application',
    'Tool loan',
    'Work-day sign-up',
  ])
  // Tab moves from the open toggle into its pages.
  await page.keyboard.press('Tab')
  await expect(link('Plot application')).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(forms).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(forms).toHaveAttribute('aria-expanded', 'false')
  await expect(link('Plot application')).toBeHidden()
  await expect(forms).toBeFocused()

  // Reopening Garden care brings the current page back, still marked.
  await toggle('Garden care pages').click()
  await expect(link('Watering')).toBeVisible()
  await expect(link('Watering')).toHaveAttribute('aria-current', 'page')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
