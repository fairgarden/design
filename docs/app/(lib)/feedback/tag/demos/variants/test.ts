import path from 'node:path'
import { test, expect, type Locator, type Page } from '@playwright/test'

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
  // are disabled until then, so wait for them before asserting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  // The Demo's preview surface (a CSS Module class, whose local name is stable across builds),
  // so the code panel's source text never matches the rendered tags.
  return demo.locator('[class*="__preview"]').first()
}

/** A tag's root element (a `span`, or an `a` when linked), found by its label text. */
function tagByLabel(scope: Locator, label: string) {
  return scope.getByText(label, { exact: true }).locator('xpath=..')
}

/** A tag's subject icon: a decorative SVG in an aria-hidden wrapper. */
function iconOf(tag: Locator) {
  return tag.locator(':scope > span[aria-hidden="true"] > svg')
}

test('variants shows plain tags and linked tags', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  // Two rows: three plain tags, then two linked ones.
  await expect(demo.getByText('Land protection', { exact: true })).toHaveCount(2)
  await expect(demo.getByText('Clean water', { exact: true })).toHaveCount(2)

  // Plain tags are spans, not links, and carry no href.
  const plain = ['Land protection', 'Clean water', 'No icon'].map((label) =>
    tagByLabel(demo, label).first(),
  )
  for (const tag of plain) {
    await expect(tag).toBeVisible()
    await expect(tag).toHaveJSProperty('tagName', 'SPAN')
    await expect(tag).not.toHaveAttribute('href')
  }
  await expect(iconOf(plain[0])).toHaveCount(1)
  await expect(iconOf(plain[1])).toHaveCount(1)
  // "No icon" renders only its label.
  await expect(iconOf(plain[2])).toHaveCount(0)
  await expect(plain[2]).toHaveText('No icon')

  // Linked tags are links named by their label (the icon is hidden from the name).
  const links = demo.getByRole('link')
  await expect(links).toHaveCount(2)
  const land = demo.getByRole('link', { name: 'Land protection', exact: true })
  const water = demo.getByRole('link', { name: 'Clean water', exact: true })
  await expect(land).toHaveAttribute('href', '#land')
  await expect(water).toHaveAttribute('href', '#water')
  await expect(iconOf(land)).toHaveCount(1)
  await expect(iconOf(water)).toHaveCount(1)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('variants linked tags take focus and follow their link', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const land = demo.getByRole('link', { name: 'Land protection', exact: true })
  const water = demo.getByRole('link', { name: 'Clean water', exact: true })

  // Keyboard: focus the first link, Tab to the next, Enter follows it.
  await land.focus()
  await expect(land).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(water).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#water$/)

  // Pointer: clicking the other link follows it.
  await land.click()
  await expect(page).toHaveURL(/#land$/)

  // Plain tags are not in the tab order.
  const plain = tagByLabel(demo, 'No icon')
  await expect(plain).not.toHaveAttribute('tabindex')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
