import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

const photos = [
  { caption: 'Adult male in spring, singing from a low perch.', credit: 'Photo: A. Díaz' },
  { caption: 'Nest of dead leaves and mud in a sapling fork.', credit: 'Photo: J. Okafor' },
  { caption: 'Breeding habitat: mature eastern hardwood forest.', credit: 'Photo: M. Chen' },
  { caption: 'Juvenile, spotted on the back as well as the breast.', credit: 'Photo: A. Díaz' },
  { caption: 'Foraging in leaf litter along a stream.', credit: 'Photo: R. Silva' },
  { caption: 'Winter range in the lowland forests of Central America.', credit: 'Photo: L. Park' },
  { caption: 'Banding station, early May.', credit: 'Photo: J. Okafor' },
  { caption: 'Eggs: three to four, pale blue.', credit: 'Photo: M. Chen' },
]

// Buttons and keys scroll at once under reduced motion, so each position is reached in one step.
test.use({ reducedMotion: 'reduce' })

async function open(page: Page) {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const carousel = demo.getByRole('region', { name: 'Wood Thrush photos' })
  const track = carousel.getByRole('region', { name: 'Slides' })
  return {
    pageErrors,
    carousel,
    track,
    previous: carousel.getByRole('button', { name: 'Previous' }),
    next: carousel.getByRole('button', { name: 'Next' }),
    // The polite count, "n of N" with thin spaces.
    count: (n: number) => carousel.getByText(new RegExp(`^${n}\\s*of\\s*8$`)),
  }
}

test('photos shows eight captioned, credited photo slides', async ({ page }) => {
  const { pageErrors, carousel, track, previous, next, count } = await open(page)

  await expect(carousel).toHaveAttribute('aria-roledescription', 'carousel')
  const slides = track.getByRole('listitem')
  await expect(slides).toHaveCount(photos.length)

  for (const [index, photo] of photos.entries()) {
    const slide = track.getByRole('listitem', { name: `${index + 1} of ${photos.length}` })
    await expect(slide).toHaveAttribute('aria-roledescription', 'slide')
    // The image's alternative text is its caption, and the caption and credit stay in the figure.
    await expect(slide.getByRole('img', { name: photo.caption })).toHaveCount(1)
    const caption = slide.locator('figcaption')
    await expect(caption).toContainText(photo.caption)
    await expect(caption).toContainText(photo.credit)
  }

  // Eight photos overflow the track: the controls show, the count starts at the first slide,
  // and at the start only Next is offered.
  await expect(count(1)).toBeVisible()
  await expect(count(1)).toHaveAttribute('aria-live', 'polite')
  await expect(next).toBeVisible()
  await expect(previous).toBeHidden()

  // More than six photos: print summarises the rest with the short URL.
  await expect(carousel.getByText(/7 more images/)).toContainText('example.org/wood-thrush/photos')

  expect(pageErrors, 'the demo should mount without uncaught errors').toEqual([])
})

test('photos steps through the slides with Previous and Next', async ({ page }) => {
  const { pageErrors, track, previous, next, count } = await open(page)

  await next.click()
  await expect(count(2)).toBeVisible()
  await expect(previous).toBeVisible()
  expect(await track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)

  await next.click()
  await expect(count(3)).toBeVisible()

  await previous.click()
  await expect(count(2)).toBeVisible()
  await previous.click()
  await expect(count(1)).toBeVisible()
  await expect(previous).toBeHidden()
  await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeLessThanOrEqual(1)

  expect(pageErrors, 'the demo should mount without uncaught errors').toEqual([])
})

test('photos moves with the arrow, Home and End keys on the focused track', async ({ page }) => {
  const { pageErrors, track, previous, next, count } = await open(page)

  await track.focus()
  await expect(track).toBeFocused()

  await page.keyboard.press('ArrowRight')
  await expect(count(2)).toBeVisible()
  await page.keyboard.press('ArrowLeft')
  await expect(count(1)).toBeVisible()

  // End reaches the last slide: the count says so and Next is hidden with its space kept.
  await page.keyboard.press('End')
  await expect(count(8)).toBeVisible()
  await expect(next).toBeHidden()
  await expect(previous).toBeVisible()
  await expect(track).toBeFocused()

  await page.keyboard.press('Home')
  await expect(count(1)).toBeVisible()
  await expect(previous).toBeHidden()
  await expect(next).toBeVisible()

  expect(pageErrors, 'the demo should mount without uncaught errors').toEqual([])
})
