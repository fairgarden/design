import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('kinds renders a photo, a technical figure and a plate, each with its caption', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before asserting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  // Three figures, each a `figure` with its `figcaption` after the media.
  const figures = demo.getByRole('figure')
  await expect(figures).toHaveCount(3)
  for (let i = 0; i < 3; i++) {
    await expect(figures.nth(i).locator('figcaption')).toHaveCount(1)
  }

  // Photo (default kind): the media, an unnumbered caption and the credit in the same run.
  const photo = figures.nth(0)
  await expect(photo.getByRole('img', { name: 'A marsh at dusk' })).toBeVisible()
  const photoCaption = photo.locator('figcaption')
  await expect(photoCaption).toHaveText(
    'The reed line marks the high-water mark of the spring flood. Photo: Ada Reyes / Marsh Program',
  )
  await expect(photoCaption).not.toContainText('Fig.')
  // Text never sits on the image: the caption starts below the media.
  const photoMedia = await photo.getByRole('img').boundingBox()
  const photoCaptionBox = await photoCaption.boundingBox()
  expect(photoCaptionBox!.y).toBeGreaterThanOrEqual(photoMedia!.y + photoMedia!.height - 1)

  // Technical figure: the short label "Fig. 3", then the caption text.
  const technical = figures.nth(1)
  await expect(technical.getByRole('img', { name: 'Leaf outline, 18 cm long' })).toBeVisible()
  await expect(technical.locator('figcaption')).toHaveText(
    'Fig. 3 Leaf of the swamp white oak, lobes shallow and rounded.',
  )
  await expect(technical.getByText('Fig. 3', { exact: true })).toBeVisible()

  // Plate: catalog numbering with the detail mark, on a nested `white` face ground.
  const plate = figures.nth(2)
  await expect(plate.getByRole('img', { name: 'Leaf outline, 18 cm long' })).toBeVisible()
  await expect(plate.locator('figcaption')).toHaveText(
    'Figure 001 (DETAIL) Specimen from the north meadow collection.',
  )
  await expect(plate.getByText('Figure 001 (DETAIL)', { exact: true })).toBeVisible()
  const face = plate.locator('[data-ground="white"]')
  await expect(face).toHaveCount(1)
  await expect(face.getByRole('img', { name: 'Leaf outline, 18 cm long' })).toBeVisible()
  // The other kinds name no scope of their own.
  await expect(photo.locator('[data-ground]')).toHaveCount(0)
  await expect(technical.locator('[data-ground]')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
