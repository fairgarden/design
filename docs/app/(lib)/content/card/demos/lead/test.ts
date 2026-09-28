import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('lead shows the lead card and removes the unavailable card action', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const cards = demo.getByRole('article')
  await expect(cards).toHaveCount(4)
  await expect(cards.getByRole('heading', { level: 3 })).toHaveText([
    'The river comes back',
    'Owl prowl',
    'Seed library open house',
    'Spring bird count',
  ])

  // The lead card: a decorative photo, its title link, meta and a sm action.
  const lead = cards.filter({ has: page.getByRole('heading', { name: 'The river comes back' }) })
  await expect(lead.locator('figure img')).toHaveCount(1)
  await expect(lead.locator('figure img')).toHaveAttribute('alt', '')
  await expect(lead.getByRole('link', { name: 'The river comes back' })).toHaveAttribute(
    'href',
    '#lead',
  )
  await expect(lead.getByText('Feature · 12 min read')).toBeVisible()
  await expect(lead.getByRole('button', { name: 'Read the Story' })).toBeVisible()

  // Every card is faced.
  for (const index of [0, 1, 2, 3]) {
    await expect(cards.nth(index).locator('[data-ground]').first()).toHaveAttribute(
      'data-ground',
      'white',
    )
  }

  // The unavailable card keeps its title and text but loses its action; the others keep theirs.
  const past = cards.filter({ has: page.getByRole('heading', { name: 'Spring bird count' }) })
  await expect(past.getByText('Past event')).toBeVisible()
  await expect(past.getByRole('link', { name: 'Spring bird count' })).toBeVisible()
  await expect(past.getByRole('button', { name: 'Get Tickets' })).toBeHidden()
  await expect(demo.getByRole('button', { name: 'Get Tickets', exact: true })).toHaveCount(3)
  await expect(
    demo.getByRole('button', { name: 'Get Tickets', exact: true }).filter({ visible: true }),
  ).toHaveCount(2)
  // A dotted edge marks it, not a fade.
  const pastFace = past.locator('[data-ground]').first()
  await expect(pastFace).toHaveCSS('border-top-style', 'dotted')
  await expect(past).toHaveCSS('opacity', '1')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test.describe('at 1280px', () => {
  test.use({ viewport: { width: 1280, height: 1400 } })

  test('lead aligns a row of cards to one height with footers pinned', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    await page.goto(route)
    const demo = page.locator('.demo').first()
    // The preview remounts, losing its state, when the demo's code content replaces the loading
    // fallback. The tabs are disabled until then, so wait for them before interacting.
    await expect(
      demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
    ).toHaveCount(0, { timeout: 15000 })

    const card = (name: string) =>
      demo.getByRole('article').filter({ has: page.getByRole('heading', { name }) })
    const owl = card('Owl prowl')
    const seed = card('Seed library open house')

    const owlBox = (await owl.boundingBox())!
    const seedBox = (await seed.boundingBox())!
    // The two share a grid row, and one height despite their different body lengths.
    expect(Math.abs(owlBox.y - seedBox.y)).toBeLessThan(1)
    expect(Math.abs(owlBox.height - seedBox.height)).toBeLessThan(1)

    // Their actions are pinned to the bottom, so they line up.
    const owlAction = (await owl.getByRole('button', { name: 'Get Tickets' }).boundingBox())!
    const seedAction = (await seed.getByRole('button', { name: 'Get Tickets' }).boundingBox())!
    expect(Math.abs(owlAction.y - seedAction.y)).toBeLessThan(1)

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})

test('lead card actions take the pointer while the rest of the card follows its title link', async ({
  page,
}) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const owl = demo
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Owl prowl' }) })
  const titleLink = owl.getByRole('link', { name: 'Owl prowl' })
  const action = owl.getByRole('button', { name: 'Get Tickets' })

  // The footer button sits above the stretched link: clicking it does not follow the card.
  await action.click()
  await expect(action).toBeFocused()
  await expect(page).not.toHaveURL(/#lead$/)

  // By keyboard, the title link comes before the action: Shift+Tab goes back to it.
  await page.keyboard.press('Shift+Tab')
  await expect(titleLink).toBeFocused()

  // Elsewhere on the card, the pointer lands on the stretched title link.
  await owl.getByText('Sat 12 Oct · North kiosk').click()
  await expect(page).toHaveURL(/#lead$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
