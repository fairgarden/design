import * as fs from 'node:fs'
import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// Every page the sitemap lists: the home page, each section index
// `app/sitemap` imports, and each page that index lists (its
// auto-maintained `[Contents](./x/page.mdx)` links). The full-page
// previews, which no sitemap lists, are checked the same way.
const directory = path.dirname(import.meta.filename)
const sitemap = fs.readFileSync(path.join(directory, '../sitemap/index.ts'), 'utf8')
const sections = [...sitemap.matchAll(/from '\.\.\/\(lib\)\/([^']+)\/page\.mdx'/g)].map((match) => match[1])
const routes = [
  '/',
  ...sections.flatMap((section) => {
    const index = fs.readFileSync(path.join(directory, section, 'page.mdx'), 'utf8')
    const pages = [...index.matchAll(/\[Contents\]\(\.\/([^)]+)\/page\.mdx\)/g)].map((match) => match[1])
    return [`/${section}`, ...pages.map((name) => `/${section}/${name}`)]
  }),
]
const previews = fs
  .readdirSync(path.join(directory, '../preview'), { recursive: true, encoding: 'utf8' })
  .filter((file) => path.basename(file) === 'page.tsx')
  .map((file) => `/preview/${path.dirname(file).split(path.sep).join('/')}`)

// Console output that says nothing about the site. Name each entry's source.
const knownNoise = [
  // Chromium's WebGL driver reporting a slow readback while MapLibre draws the Map page.
  /GL Driver Message .*GPU stall due to ReadPixels/,
]

/** Collects uncaught errors, console errors and hydration warnings. Call before `goto`. */
function watchConsole(page: Page) {
  const problems: string[] = []
  page.on('pageerror', (error) => problems.push(`uncaught: ${error.message}`))
  page.on('console', (message) => {
    const text = message.text()
    if (knownNoise.some((pattern) => pattern.test(text))) return
    if (message.type() === 'error' || (message.type() === 'warning' && /hydrat/i.test(text))) {
      problems.push(`${message.type()}: ${text}`)
    }
  })
  return problems
}

test('home page renders its introduction inside the docs frame', async ({ page }) => {
  const problems = watchConsole(page)

  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1, name: 'FairGarden Design' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'FairGarden Design home' })).toHaveAttribute('href', '/')
  await expect(page.getByRole('navigation', { name: 'Documentation' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Installation' }).first()).toHaveAttribute(
    'href',
    '/overview/installation'
  )

  expect(problems, 'the page should render without errors').toEqual([])
})

test.describe('every page', () => {
  test('the sitemap lists every section', () => {
    // A broken route list would make the loop below pass without checking anything.
    expect(routes.length).toBeGreaterThan(90)
    expect(sections).toEqual(expect.arrayContaining(['overview', 'forms', 'overlays', 'content', 'data', 'page']))
    expect(previews.length).toBeGreaterThan(0)
  })

  for (const route of [...routes, ...previews]) {
    test(`${route} loads and hydrates without errors`, async ({ page }) => {
      const problems = watchConsole(page)

      const response = await page.goto(route)
      expect(response?.status()).toBe(200)
      await expect(page.locator('body')).toContainText(/\S/)
      // What arrives late (the lazy demos and code, the search index) reports by now.
      await page.waitForLoadState('networkidle')

      expect(problems, 'the page should log no errors or hydration warnings').toEqual([])
    })
  }
})

test.describe('the frame', () => {
  const widths = [390, 1280]
  // A spread of pages whose content is widest or most likely to push the frame.
  const representative = [
    '/',
    '/overview/tokens',
    '/forms/select',
    '/navigation/tabs',
    '/navigation/navigation-bar',
    '/overlays/dialog',
    '/content/code-block',
    '/content/carousel',
    '/data/table',
    '/data/scroll-area',
    '/data/chart',
    '/page/docs-layout',
  ]
  // The size-determining state that is easiest to get wrong: code windows,
  // a scroll-snap track, a wide table, scroll areas [D201].
  const still = ['/content/code-block', '/content/carousel', '/data/table', '/data/scroll-area']

  for (const width of widths) {
    test.describe(`at ${width}px`, () => {
      test.use({ viewport: { width, height: 900 } })

      for (const route of representative) {
        test(`${route} never scrolls sideways`, async ({ page }) => {
          await page.goto(route)
          await page.waitForLoadState('networkidle')
          await page.evaluate(() => document.fonts.ready)

          // `scrollbar-gutter: stable` keeps the scroll width under the client width by the gutter.
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
          )
          expect(overflow, 'the page should be no wider than the viewport').toBeLessThanOrEqual(0)
        })
      }

      for (const route of still) {
        test(`${route} paints its final layout first`, async ({ page }) => {
          await page.addInitScript(() => {
            const shifts: { value: number; sources: string[] }[] = []
            Object.assign(window, { layoutShifts: shifts })
            type LayoutShift = PerformanceEntry & {
              value: number
              hadRecentInput: boolean
              sources?: { node?: Node | null }[]
            }
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries() as LayoutShift[]) {
                if (entry.hadRecentInput) continue
                shifts.push({
                  value: entry.value,
                  sources: (entry.sources ?? []).map(({ node }) =>
                    node instanceof Element ? `${node.tagName.toLowerCase()}.${node.className}` : String(node)
                  ),
                })
              }
            }).observe({ type: 'layout-shift', buffered: true })
          })

          await page.goto(route)
          // The fonts and the lazy code and its colours are what could still move it.
          await page.waitForLoadState('networkidle')
          await page.evaluate(() => document.fonts.ready)
          await page.evaluate(
            () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
          )

          const shifts = await page.evaluate(() => (window as unknown as { layoutShifts: unknown[] }).layoutShifts)
          expect(shifts, 'nothing should move after the first paint').toEqual([])
        })
      }
    })
  }
})

test('the sidebar marks the current page and keeps it in view', async ({ page }) => {
  await page.goto('/data/table')

  const sidebar = page.getByRole('navigation', { name: 'Documentation' })
  const current = sidebar.locator('[aria-current="page"]')
  await expect(current).toHaveCount(1)
  await expect(current).toHaveText('Table')
  await expect(current).toHaveAttribute('href', '/data/table')
  // Far down the list, so the column has scrolled itself to it.
  await expect(current).toBeInViewport()
})

test.describe('the drawer on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('opens on the current page and gives focus back when it closes', async ({ page }) => {
    await page.goto('/data/table')
    await expect(page.getByRole('navigation', { name: 'Documentation' })).toBeHidden()

    const menu = page.getByRole('button', { name: 'Menu' })
    await menu.click()

    const drawer = page.getByRole('dialog', { name: 'Menu' })
    await expect(drawer).toBeVisible()
    const current = drawer.getByRole('navigation', { name: 'Documentation' }).locator('[aria-current="page"]')
    await expect(current).toHaveText('Table')
    await expect(current).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
    await expect(menu).toBeFocused()
  })
})

test.describe('search', () => {
  test('opens from the header button and closes with Escape', async ({ page }) => {
    await page.goto('/forms/select')

    const trigger = page.getByRole('button', { name: 'Search' })
    await trigger.click()

    const dialog = page.getByRole('dialog', { name: 'Search' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('combobox', { name: 'Search' })).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('opens with Ctrl K or ⌘K and finds a page', async ({ page }) => {
    await page.goto('/forms/select')
    // The shortcut listens once the page has hydrated.
    await expect(page.getByRole('button', { name: 'Search' })).toBeEnabled()
    await page.waitForLoadState('networkidle')

    await page.keyboard.press('ControlOrMeta+k')

    const dialog = page.getByRole('dialog', { name: 'Search' })
    await expect(dialog).toBeVisible()
    await page.keyboard.type('carousel')
    // The page itself ranks first, above its sections and exports.
    const result = dialog.getByRole('option').first()
    await expect(result).toHaveAttribute('href', '/content/carousel')

    await page.keyboard.press('Enter')
    await expect(page).toHaveURL('/content/carousel')
    await expect(page.getByRole('heading', { level: 1, name: 'Carousel' })).toBeVisible()
    await expect(dialog).toBeHidden()
  })

  test('closes with Escape after opening with the shortcut', async ({ page }) => {
    await page.goto('/forms/select')
    await page.waitForLoadState('networkidle')

    await page.keyboard.press('ControlOrMeta+k')
    const dialog = page.getByRole('dialog', { name: 'Search' })
    await expect(dialog).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })
})
