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

test('grounds opens a band on tide, paper and night with its parts', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  // Three band headers, each an h2.
  // The three bands: tide and paper sections, and the night footer.
  const bands = demo.locator('section[data-ground], footer[data-ground]')
  await expect(bands).toHaveCount(3)
  const headings = bands.getByRole('heading', { level: 2 })
  await expect(headings).toHaveCount(3)
  await expect(headings.nth(0)).toHaveText('Rivers coming back')
  await expect(headings.nth(1)).toHaveText('Visit a preserve near you')
  await expect(headings.nth(2)).toHaveText('The field notes letter')

  // Tide: a page ground that follows the mode, labelled by its heading's id.
  const tide = demo.getByRole('region', { name: 'Rivers coming back' })
  await expect(tide).toHaveAttribute('data-ground', 'tide')
  await expect(tide).toHaveAttribute('data-scheme', 'page')
  await expect(tide).not.toHaveAttribute('data-theme', /.*/)
  await expect(tide).toHaveAttribute('aria-labelledby', 'grounds-tide')
  await expect(tide.getByRole('heading', { level: 2 })).toHaveAttribute('id', 'grounds-tide')
  await expect(tide.getByText('Stories', { exact: true })).toBeVisible()
  await expect(
    tide.getByText('Three watersheds, ten years of work, and what the water says now.'),
  ).toBeVisible()
  // The editorial eyebrow sits over its hairline.
  const tideRule = tide.getByRole('separator')
  await expect(tideRule).toHaveCount(1)
  await expect(tideRule).toHaveAttribute('data-orientation', 'horizontal')

  // Paper: the trail kicker, its trail art decorative, and no eyebrow rule in the header.
  const paper = demo.locator('section[data-ground="paper"]')
  await expect(paper).toHaveCount(1)
  await expect(paper).toHaveAttribute('data-scheme', 'page')
  await expect(paper).not.toHaveAttribute('data-theme', /.*/)
  await expect(paper.getByText('Next', { exact: true })).toBeVisible()
  const trailed = paper.getByRole('heading', { name: 'Visit a preserve near you' }).locator('..')
  await expect(trailed.getByRole('separator')).toHaveCount(0)
  await expect(trailed.locator('[aria-hidden="true"]')).toHaveCount(3) // two trail pieces and the arrow
  await expect(trailed.getByRole('img')).toHaveCount(0)

  // Night: the footer band fixes dark mode.
  const night = demo.locator('footer')
  await expect(night).toHaveCount(1)
  await expect(night).toHaveAttribute('data-ground', 'night')
  await expect(night).toHaveAttribute('data-scheme', 'dark')
  await expect(night).toHaveAttribute('data-theme', 'dark')
  await expect(night.getByText('Stay in touch', { exact: true })).toBeVisible()
  await expect(night.getByText('On the night band every text takes the light ink', { exact: false })).toBeVisible()
  await expect(night.getByRole('separator')).toHaveCount(1)

  // One "See all" link per band; the night one falls back to the default label.
  const links = bands.getByRole('link')
  await expect(links).toHaveCount(3)
  const seeAll = [
    [tide, 'See all stories'],
    [paper, 'See all preserves'],
    [night, 'See all'],
  ] as const
  for (const [band, name] of seeAll) {
    const link = band.getByRole('link', { name, exact: true })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '#grounds')
    // The arrow is decorative; a relative href prints no URL.
    await expect(link.locator('[aria-hidden="true"]')).toHaveCount(1)
    await expect(link).not.toContainText('(')
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('grounds follows its see all links by keyboard and pointer', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const stories = demo.getByRole('link', { name: 'See all stories' })
  await stories.focus()
  await expect(stories).toBeFocused()

  // Tab order runs band by band.
  await page.keyboard.press('Tab')
  await expect(demo.getByRole('link', { name: 'See all preserves' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(demo.locator('footer').getByRole('link', { name: 'See all', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#grounds$/)

  await demo.getByRole('link', { name: 'See all preserves' }).click()
  await expect(page).toHaveURL(/#grounds$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
