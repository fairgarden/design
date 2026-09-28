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
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before asserting or interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return demo
}

const blocks = [
  {
    headline: 'Find a garden near you',
    actions: [{ label: 'Find a Garden', href: 'https://example.org/find' }],
  },
  {
    headline: 'Gardens for every neighborhood',
    actions: [{ label: 'Our Mission', href: 'https://example.org/mission' }],
  },
  {
    headline: 'Become a member and keep the gardens growing',
    actions: [
      { label: 'Join Today', href: 'https://example.org/join' },
      { label: 'Learn More', href: 'https://example.org/membership' },
    ],
  },
  {
    headline: 'Plant 10,000 trees this spring',
    actions: [{ label: 'Give a Tree', href: 'https://example.org/trees' }],
  },
  {
    headline: 'Request a survey of your land',
    actions: [{ label: 'Enquire', href: 'https://example.org/survey' }],
  },
]

test('kinds renders five sections labelled by their headlines with their actions', async ({
  page,
}) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  // Each block is a section named by its level-2 headline, so each is a region.
  await expect(demo.locator('section[aria-labelledby]')).toHaveCount(blocks.length)
  await expect(demo.getByRole('heading', { level: 2 })).toHaveCount(blocks.length)

  for (const { headline, actions } of blocks) {
    const region = demo.getByRole('region', { name: headline })
    await expect(region).toBeVisible()
    await expect(region.getByRole('heading', { level: 2, name: headline })).toBeVisible()
    // Every action is an anchor pill, in order: the solid pill, then any outline twin.
    const links = region.getByRole('link')
    await expect(links).toHaveCount(actions.length)
    for (const [i, { label, href }] of actions.entries()) {
      await expect(links.nth(i)).toContainText(label)
      await expect(links.nth(i)).toHaveAttribute('href', href)
    }
  }

  // Only the default sunburst kind has a kicker; its trail is decorative.
  const sunburst = demo.getByRole('region', { name: 'Find a garden near you' })
  await expect(sunburst.getByText('Keep exploring', { exact: true })).toBeVisible()
  await expect(demo.getByText('Keep exploring', { exact: true })).toHaveCount(1)

  // Support lines on the mission and deep kinds.
  await expect(
    demo
      .getByRole('region', { name: 'Gardens for every neighborhood' })
      .getByText('Local gardeners work with their neighbors', { exact: false }),
  ).toBeVisible()
  await expect(
    demo
      .getByRole('region', { name: 'Become a member and keep the gardens growing' })
      .getByText('Members fund seed, stewardship and the paths you walk.'),
  ).toBeVisible()

  // The mission's blob mount and its mark are hidden from assistive technology.
  const mission = demo.getByRole('region', { name: 'Gardens for every neighborhood' })
  await expect(mission.locator('[aria-hidden="true"] svg').first()).toBeAttached()

  // The framed kind draws its crop-mark frame as decoration.
  const framed = demo.getByRole('region', { name: 'Request a survey of your land' })
  await expect(framed.locator('svg[aria-hidden="true"] rect')).toHaveCount(1)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds sets the deep and saturated kinds on fixed-mode CTA fields', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  // Deep defaults to the forest field, always dark.
  const deep = demo.getByRole('region', { name: 'Become a member and keep the gardens growing' })
  const forest = deep.locator('[data-ground="forest"]:not(a, button)')
  await expect(forest).toHaveCount(1)
  await expect(forest).toHaveAttribute('data-theme', 'dark')
  await expect(forest.getByRole('link')).toHaveCount(2)

  // Saturated defaults to the amber campaign field, always light.
  const saturated = demo.getByRole('region', { name: 'Plant 10,000 trees this spring' })
  const amber = saturated.locator('[data-ground="amber"]:not(a, button)')
  await expect(amber).toHaveCount(1)
  await expect(amber).toHaveAttribute('data-theme', 'light')
  await expect(amber.getByRole('link')).toHaveCount(1)

  // The page-ground kinds render no field of their own.
  for (const headline of [
    'Find a garden near you',
    'Gardens for every neighborhood',
    'Request a survey of your land',
  ]) {
    await expect(
      demo.getByRole('region', { name: headline }).locator('[data-ground]:not(a, button)'),
    ).toHaveCount(0)
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('kinds reaches every action in order by keyboard and activates by pointer', async ({
  page,
}) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const labels = blocks.flatMap((block) => block.actions.map((action) => action.label))
  const links = demo.getByRole('link').filter({ hasText: new RegExp(labels.join('|')) })
  await expect(links).toHaveCount(labels.length)

  // Tab moves through the pills in document order, the deep kind's outline twin after its pill.
  await links.first().focus()
  await expect(links.first()).toBeFocused()
  for (let i = 1; i < labels.length; i++) {
    await page.keyboard.press('Tab')
    await expect(links.nth(i)).toBeFocused()
    await expect(links.nth(i)).toContainText(labels[i])
  }
  await page.keyboard.press('Shift+Tab')
  await expect(links.nth(labels.length - 2)).toBeFocused()

  // A pointer click follows the pill's href; intercept it so the test stays offline.
  await page.route('https://example.org/**', (r) =>
    r.fulfill({ status: 200, contentType: 'text/html', body: '<title>Target</title>' }),
  )
  await demo.getByRole('link').filter({ hasText: 'Give a Tree' }).click()
  await expect(page).toHaveURL('https://example.org/trees')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
