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
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return demo
}

const places = [
  '01 Visitor Center',
  '02 Tool Shed',
  '03 Lake Overlook',
  '04 Pollinator Meadow',
  '05 Community Plots',
]

test('drawing shows the figure, numbered markers and a grouped index', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  await expect(demo.getByText('Parkside Community Garden', { exact: true }).first()).toBeVisible()
  await expect(demo.getByText('Fig. 2')).toBeVisible()
  await expect(
    demo.getByText('The loop trail links every garden; the orchard is still planned.'),
  ).toBeVisible()

  // The map frame: a focusable region named by the title, with the instructions as its description.
  const frame = demo.getByRole('region', { name: 'Parkside Community Garden', exact: true })
  await expect(frame).toHaveAttribute('aria-roledescription', 'map')
  await expect(frame).toHaveAttribute('tabindex', '0')
  await expect(frame).toHaveAccessibleDescription(
    'Drag or use the arrow keys to pan; press plus or minus to zoom. The index lists every place.',
  )
  // Text labels sit on the map at screen size, hidden from assistive technology.
  await expect(frame.getByText('Lake', { exact: true })).toBeVisible()
  await expect(frame.getByText('Planned orchard')).toBeVisible()
  await expect(frame.getByText('Planned orchard')).toHaveAttribute('aria-hidden', 'true')

  // Markers are numbered buttons, never tab stops, none selected at first.
  const markers = frame.getByRole('button')
  await expect(markers).toHaveCount(places.length)
  for (const name of places) {
    const marker = frame.getByRole('button', { name, exact: true })
    await expect(marker).toBeVisible()
    await expect(marker).toHaveAttribute('tabindex', '-1')
    await expect(marker).toHaveAttribute('aria-pressed', 'false')
  }

  // The index lists every place under its group, all collapsed.
  const index = demo.getByRole('region', { name: 'Index', exact: true })
  for (const group of ['Buildings', 'Views', 'Gardens']) {
    await expect(index.getByText(group, { exact: true })).toBeVisible()
  }
  const entries = index.getByRole('button')
  await expect(entries).toHaveCount(places.length)
  for (const name of places) {
    await expect(index.getByRole('button', { name, exact: true })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  }

  // The toolbar starts at the reset extent: zoom 1 of 4, so zoom out is disabled.
  const toolbar = demo.getByRole('toolbar', { name: 'Map controls' })
  await expect(toolbar.getByRole('button', { name: 'Zoom in' })).toBeEnabled()
  await expect(toolbar.getByRole('button', { name: 'Zoom out' })).toBeDisabled()
  await expect(toolbar.getByRole('button', { name: 'Reset map view' })).toBeEnabled()
  await expect(toolbar.locator('output')).toHaveText('Zoom 1 of 4')
  await expect(toolbar.locator('output')).toHaveAttribute('aria-live', 'polite')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('drawing zooms in steps from the toolbar and the keyboard, and resets', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const toolbar = demo.getByRole('toolbar', { name: 'Map controls' })
  const zoomIn = toolbar.getByRole('button', { name: 'Zoom in' })
  const zoomOut = toolbar.getByRole('button', { name: 'Zoom out' })
  const reset = toolbar.getByRole('button', { name: 'Reset map view' })
  const status = toolbar.locator('output')
  const frame = demo.getByRole('region', { name: 'Parkside Community Garden', exact: true })

  // Pointer: zoom in one step.
  await zoomIn.click()
  await expect(status).toHaveText('Zoom 2 of 4')
  await expect(zoomOut).toBeEnabled()

  // Keyboard on the focused map: plus zooms in to the last step, minus zooms out.
  await frame.focus()
  await page.keyboard.press('+')
  await expect(status).toHaveText('Zoom 3 of 4')
  await page.keyboard.press('=')
  await expect(status).toHaveText('Zoom 4 of 4')
  await expect(zoomIn).toBeDisabled()
  await page.keyboard.press('+')
  await expect(status).toHaveText('Zoom 4 of 4')
  await page.keyboard.press('-')
  await expect(status).toHaveText('Zoom 3 of 4')
  await expect(zoomIn).toBeEnabled()

  // The toolbar is one tab stop with arrow-key movement; its disabled buttons stay focusable.
  await zoomIn.focus()
  await page.keyboard.press('ArrowRight')
  await expect(zoomOut).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(reset).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(status).toHaveText('Zoom 1 of 4')
  await expect(zoomOut).toBeDisabled()
  await expect(reset).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('drawing pans by arrow keys and by dragging', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const status = demo.getByRole('toolbar', { name: 'Map controls' }).locator('output')
  const frame = demo.getByRole('region', { name: 'Parkside Community Garden', exact: true })
  const marker = frame.getByRole('button', { name: '05 Community Plots', exact: true })

  // Zoomed in, the drawing has room to pan; markers move with it.
  await frame.focus()
  await page.keyboard.press('+')
  await page.keyboard.press('+')
  await expect(status).toHaveText('Zoom 3 of 4')

  const atReset = await marker.getAttribute('style')
  await page.keyboard.press('ArrowLeft')
  await expect(marker).not.toHaveAttribute('style', atReset!)
  const afterLeft = await marker.getAttribute('style')
  await page.keyboard.press('ArrowUp')
  await expect(marker).not.toHaveAttribute('style', afterLeft!)
  const afterKey = await marker.getAttribute('style')

  // A pointer drag on the frame pans too, and never selects a marker.
  const box = (await frame.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 4
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x - 40, y - 20, { steps: 5 })
  await page.mouse.move(x - 80, y - 40, { steps: 5 })
  await expect(frame).toHaveAttribute('data-dragging', '')
  await page.mouse.up()
  await expect(frame).not.toHaveAttribute('data-dragging', '')
  await expect(marker).not.toHaveAttribute('style', afterKey!)
  await expect(frame.locator('[aria-pressed="true"]')).toHaveCount(0)

  // Reset returns the view to its extent at the first zoom step.
  await demo.getByRole('button', { name: 'Reset map view' }).click()
  await expect(status).toHaveText('Zoom 1 of 4')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('drawing links markers and index entries both ways', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const frame = demo.getByRole('region', { name: 'Parkside Community Garden', exact: true })
  const index = demo.getByRole('region', { name: 'Index', exact: true })

  // Pointer: selecting a marker presses it and opens its index entry.
  const meadowMarker = frame.getByRole('button', { name: '04 Pollinator Meadow', exact: true })
  const meadowEntry = index.getByRole('button', { name: '04 Pollinator Meadow', exact: true })
  await meadowMarker.click()
  await expect(meadowMarker).toHaveAttribute('aria-pressed', 'true')
  await expect(meadowEntry).toHaveAttribute('aria-expanded', 'true')
  await expect(
    index.getByText('Native asters, milkweed and bee balm, mown once each March.'),
  ).toBeVisible()

  // Selecting another marker moves the selection, across groups.
  const shedMarker = frame.getByRole('button', { name: '02 Tool Shed', exact: true })
  const shedEntry = index.getByRole('button', { name: '02 Tool Shed', exact: true })
  await shedMarker.click()
  await expect(shedMarker).toHaveAttribute('aria-pressed', 'true')
  await expect(meadowMarker).toHaveAttribute('aria-pressed', 'false')
  await expect(shedEntry).toHaveAttribute('aria-expanded', 'true')
  await expect(meadowEntry).toHaveAttribute('aria-expanded', 'false')
  await expect(
    index.getByText('Volunteers borrow tools here; sign them back in by dusk.'),
  ).toBeVisible()

  // Selecting the pressed marker again clears the selection.
  await shedMarker.click()
  await expect(shedMarker).toHaveAttribute('aria-pressed', 'false')
  await expect(shedEntry).toHaveAttribute('aria-expanded', 'false')

  // Keyboard: the index is the non-visual route; opening an entry selects its marker.
  const overlookEntry = index.getByRole('button', { name: '03 Lake Overlook', exact: true })
  const overlookMarker = frame.getByRole('button', { name: '03 Lake Overlook', exact: true })
  await overlookEntry.focus()
  await page.keyboard.press('Enter')
  await expect(overlookEntry).toHaveAttribute('aria-expanded', 'true')
  await expect(overlookMarker).toHaveAttribute('aria-pressed', 'true')
  await expect(index.getByText('A bench above the lake, reached by the loop trail.')).toBeVisible()
  await expect(overlookEntry).toBeFocused()

  // Closing the entry clears the selection.
  await page.keyboard.press('Space')
  await expect(overlookEntry).toHaveAttribute('aria-expanded', 'false')
  await expect(overlookMarker).toHaveAttribute('aria-pressed', 'false')

  // Pointer on the index: an entry in another group selects its marker.
  await index.getByRole('button', { name: '05 Community Plots', exact: true }).click()
  await expect(frame.getByRole('button', { name: '05 Community Plots', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(index.getByText('48 raised beds, allotted each spring by lottery.')).toBeVisible()
  await expect(frame.locator('[aria-pressed="true"]')).toHaveCount(1)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
