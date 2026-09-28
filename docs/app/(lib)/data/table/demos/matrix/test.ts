import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

const allergens = ['Gluten', 'Dairy', 'Egg', 'Soy', 'Peanut', 'Tree nut', 'Sesame']

const menu: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['Garden burger', ['●', '', '○', '●', '', '', '●']],
  ['Harvest bowl', ['', '', '', '●', '', '○', '●']],
  ['Field greens', ['', '●', '', '', '', '●', '']],
  ['Oat crumble', ['●', '●', '●', '', '○', '●', '']],
]

test('matrix shows the allergen grid with its marks and notes', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback. With one
  // file there are no tabs; its copy action is disabled until then instead.
  await expect(demo.getByRole('button', { name: 'Copy TableMatrix.tsx source' })).toBeEnabled({
    timeout: 15000,
  })

  const table = demo.getByRole('table').first()
  await expect(table).toBeVisible()
  await expect(table.locator('caption')).toContainText('Table 3')
  await expect(table.locator('caption')).toContainText('Allergens by dish')

  // A dish column followed by the seven allergens.
  await expect(table.getByRole('columnheader')).toHaveText(['Dish', ...allergens])
  // One header row and four dishes, each led by a row header.
  await expect(table.getByRole('row')).toHaveCount(1 + menu.length)
  await expect(table.getByRole('rowheader')).toHaveText(menu.map(([dish]) => dish))

  // Each cell carries its mark: contains, may contain, or nothing.
  for (const [dish, marks] of menu) {
    const row = table
      .getByRole('row')
      .filter({ has: page.getByRole('rowheader', { name: dish, exact: true }) })
    const values = row.getByRole('cell').locator('[class*="__cellValue"]')
    await expect(values).toHaveText(marks)
  }

  // The notes define the marks, below the table.
  await expect(demo.getByText('● Contains. ○ May contain traces.')).toBeVisible()
  // The scroll cue is rendered with the table (it shows only while the table overflows).
  await expect(demo.getByText('Scroll for more allergens →')).toHaveCount(1)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test.describe('at a narrow width', () => {
  test.use({ viewport: { width: 390, height: 1200 }, reducedMotion: 'reduce' })

  test('matrix scrolls with the dish column pinned', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    await page.goto(route)
    const demo = page.locator('.demo').first()
    await expect(demo.getByRole('button', { name: 'Copy TableMatrix.tsx source' })).toBeEnabled({
      timeout: 15000,
    })

    const table = demo.getByRole('table').first()
    await expect(table).toBeVisible()
    const firstDish = table.getByRole('rowheader', { name: 'Garden burger', exact: true })
    const lastAllergen = table.getByRole('columnheader', { name: 'Sesame', exact: true })
    await firstDish.scrollIntoViewIfNeeded()

    // The table overflows its scroll viewport, the nearest ancestor that scrolls horizontally.
    const scrollToEnd = () =>
      table.evaluate((element) => {
        let node = element.parentElement
        while (node && node.scrollWidth <= node.clientWidth) node = node.parentElement
        if (!node) return -1
        node.scrollLeft = node.scrollWidth
        return node.scrollLeft
      })
    await expect.poll(scrollToEnd).toBeGreaterThan(0)

    // Scrolled to the end: the last allergen is in view and the dish column stays pinned.
    await expect(lastAllergen).toBeInViewport()
    await expect(firstDish).toBeInViewport()
    const dishBox = await firstDish.boundingBox()
    const tableBox = await table.boundingBox()
    expect(dishBox, 'the pinned row header has a box').not.toBeNull()
    expect(tableBox, 'the table has a box').not.toBeNull()
    // The table has moved left under the pinned column.
    expect(tableBox!.x).toBeLessThan(dishBox!.x)

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})
