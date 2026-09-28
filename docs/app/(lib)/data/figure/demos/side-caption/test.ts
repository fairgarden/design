import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

async function open(page: Page) {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before measuring.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  const figure = demo.getByRole('figure')
  await expect(figure).toHaveCount(1)
  const media = figure.getByRole('img', { name: 'Water level by month, highest in April' })
  const caption = figure.locator('figcaption')
  await expect(media).toBeVisible()
  await expect(caption).toHaveText(
    'Fig. 4 Water level peaks in April, a month earlier than in 2020. Source: County water survey',
  )
  await expect(caption.getByText('Fig. 4', { exact: true })).toBeVisible()
  await expect(caption.getByText('Source: County water survey', { exact: true })).toBeVisible()
  return { pageErrors, figure, media, caption }
}

test.describe('wide', () => {
  test.use({ viewport: { width: 1600, height: 1200 } })

  test('side-caption sits beside the media, top-aligned, from 768 px of the figure', async ({ page }) => {
    const { pageErrors, figure, media, caption } = await open(page)

    const figureBox = (await figure.boundingBox())!
    expect(figureBox.width).toBeGreaterThanOrEqual(768)

    const mediaBox = (await media.boundingBox())!
    const captionBox = (await caption.boundingBox())!
    // After the media in visual order: in the adjacent column, not below it.
    expect(captionBox.x).toBeGreaterThanOrEqual(mediaBox.x + mediaBox.width - 1)
    expect(captionBox.y).toBeLessThan(mediaBox.y + mediaBox.height)
    // Top-aligned with the media.
    expect(Math.abs(captionBox.y - mediaBox.y)).toBeLessThanOrEqual(24)

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})

test.describe('narrow', () => {
  test.use({ viewport: { width: 390, height: 1200 } })

  test('side-caption stays below the media when the figure is narrower than 768 px', async ({ page }) => {
    const { pageErrors, figure, media, caption } = await open(page)

    const figureBox = (await figure.boundingBox())!
    expect(figureBox.width).toBeLessThan(768)

    const mediaBox = (await media.boundingBox())!
    const captionBox = (await caption.boundingBox())!
    expect(captionBox.y).toBeGreaterThanOrEqual(mediaBox.y + mediaBox.height - 1)

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})
