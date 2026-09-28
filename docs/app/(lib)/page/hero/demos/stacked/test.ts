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

test('stacked puts the photo under the text, crossing into the paper seam', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  const hero = demo.locator('header')
  await expect(hero).toHaveCount(1)
  await expect(hero).toHaveAttribute('data-ground', 'night')
  await expect(hero).toHaveAttribute('data-theme', 'dark')

  const breadcrumb = hero.getByRole('navigation', { name: 'Breadcrumb' })
  await expect(breadcrumb).toBeVisible()
  await expect(breadcrumb.getByRole('link', { name: 'News' }).first()).toHaveAttribute(
    'href',
    '#stacked',
  )
  await expect(breadcrumb.locator('[aria-current="page"]').first()).toHaveText('Stories')

  const title = demo.getByRole('heading', { level: 1 })
  await expect(title).toHaveCount(1)
  await expect(title).toHaveText('The birds came back to Boone Creek')
  await expect(
    hero.getByText("Five years after the dams came out, the creek's thrushes are nesting again."),
  ).toBeVisible()
  // No actions and no rail in this build.
  await expect(hero.getByRole('button')).toHaveCount(0)

  // The photo figure comes after the text, in the same band.
  const figure = hero.getByRole('figure')
  await expect(figure).toHaveCount(1)
  await expect(figure.getByRole('img', { name: 'A wooded creek bend in early summer' })).toBeVisible()
  const captionText = 'Boone Creek, Kentucky, in June. Photo: M. Chen'
  await expect(figure.locator('figcaption')).toHaveText(captionText)
  const titleBox = await title.boundingBox()
  const figureBox = await figure.getByRole('img').boundingBox()
  expect(titleBox && figureBox && figureBox.y > titleBox.y, 'the photo sits below the title').toBe(
    true,
  )

  // The exit seam on paper repeats the caption for sight only, so it is read once.
  const seam = demo.locator('header + [data-ground="paper"]')
  await expect(seam).toHaveCount(1)
  const seamCaption = seam.locator('p[aria-hidden="true"]')
  await expect(seamCaption).toHaveCount(1)
  await expect(seamCaption).toHaveText(captionText)
  // The hill edge lies in the seam; nothing in it is a link.
  await expect(seam.getByRole('link')).toHaveCount(0)

  await expect(demo.getByText('The article begins here, on the page ground.')).toBeVisible()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('stacked follows its breadcrumb by keyboard and pointer', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)
  const link = demo
    .getByRole('navigation', { name: 'Breadcrumb' })
    .getByRole('link', { name: 'News' })
    .first()

  await link.focus()
  await expect(link).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#stacked$/)

  await link.click()
  await expect(page).toHaveURL(/#stacked$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
