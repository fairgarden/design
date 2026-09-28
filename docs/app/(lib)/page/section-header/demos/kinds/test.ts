import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('kinds renders the six openers on one paper band', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // One paper band that follows the page mode.
  const band = demo.locator('section[data-ground]')
  await expect(band).toHaveCount(1)
  await expect(band).toHaveAttribute('data-ground', 'paper')
  await expect(band).toHaveAttribute('data-scheme', 'page')
  await expect(band).not.toHaveAttribute('data-theme', /.*/)

  // Five band heads (h2) and one module head (h3), in order.
  await expect(band.getByRole('heading')).toHaveCount(6)
  const bandHeads = band.getByRole('heading', { level: 2 })
  await expect(bandHeads).toHaveText([
    'Birds of the tallgrass prairie',
    'More from the trail',
    'Every acre counts',
    'Our kitchen garden',
    'Protecting working land',
  ])
  await expect(band.getByRole('heading', { level: 3 })).toHaveText('Dimensions and weight')

  // Each header is its heading's parent.
  const header = (name: string) => band.getByRole('heading', { name, exact: true }).locator('..')

  // Editorial: eyebrow over its hairline, then the lede.
  const editorial = header('Birds of the tallgrass prairie')
  await expect(editorial.getByText('Field guide', { exact: true })).toBeVisible()
  await expect(editorial.getByRole('separator')).toHaveAttribute('data-orientation', 'horizontal')
  await expect(
    editorial.getByText('Forty species nest in the grass itself; here is how to find them.'),
  ).toBeVisible()

  // Trailed: the kicker threaded by decorative trail art, no rule.
  const trailed = header('More from the trail')
  await expect(trailed.getByText('Keep exploring', { exact: true })).toBeVisible()
  await expect(trailed.getByRole('separator')).toHaveCount(0)
  await expect(trailed.locator('[aria-hidden="true"]')).toHaveCount(2)

  // Scene: heading, lede and the pill.
  const scene = header('Every acre counts')
  await expect(scene.getByText('Join the neighbors who keep this land open for good.')).toBeVisible()
  await expect(scene.getByRole('button')).toHaveCount(1)
  await expect(scene.getByRole('button', { name: 'Donate Now' })).toBeEnabled()

  // Anchored: the sticker on the heading, then its action.
  const anchored = header('Our kitchen garden')
  await expect(anchored.getByRole('img', { name: 'A leaf' })).toBeVisible()
  await expect(anchored.getByRole('button', { name: 'See the Menu' })).toBeEnabled()

  // Technical: the number and caps label over a rule, at module level.
  const technical = header('Dimensions and weight')
  await expect(technical.getByText('03', { exact: true })).toBeVisible()
  await expect(technical.getByText('Specifications', { exact: true })).toBeVisible()
  await expect(technical.getByRole('separator')).toHaveCount(1)

  // Topic: the tag above the heading.
  const topic = header('Protecting working land')
  await expect(topic.getByText('Conservation', { exact: true })).toBeVisible()
  await expect(topic.getByRole('separator')).toHaveCount(0)

  // Only the scene and anchored openers carry actions; none has a "See all" link.
  await expect(band.getByRole('button')).toHaveCount(2)
  await expect(band.getByRole('link')).toHaveCount(0)
  await expect(band.getByRole('separator')).toHaveCount(2)

  // The two actions are reachable in order by keyboard.
  await band.getByRole('button', { name: 'Donate Now' }).focus()
  await page.keyboard.press('Tab')
  await expect(band.getByRole('button', { name: 'See the Menu' })).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
