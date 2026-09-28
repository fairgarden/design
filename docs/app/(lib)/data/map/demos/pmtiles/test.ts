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

// These tests assert the component's own view, markers, controls and text, never the tiles,
// so they hold whether or not the remote archive loads.

test('pmtiles shows the location figure, address, credit and index', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)

  await expect(demo.getByText('Getting there', { exact: true })).toBeVisible()
  await expect(
    demo.getByText('Parkside Community Garden, 100 Garden Lane, Brooklyn, NY'),
  ).toBeVisible()
  await expect(
    demo.getByText(
      'Leave the station by the Lincoln Road exit; the garden is a four-minute walk east.',
    ),
  ).toBeVisible()

  // The credit sits below the frame, its name linked to the copyright page.
  const credit = demo.getByRole('link', { name: 'OpenStreetMap' })
  await expect(credit).toHaveAttribute('href', 'https://www.openstreetmap.org/copyright')

  // The frame is a focusable map region named by the title; the MapLibre canvas is hidden.
  const frame = demo.getByRole('region', { name: 'Getting there', exact: true })
  await expect(frame).toHaveAttribute('aria-roledescription', 'map')
  await expect(frame).toHaveAttribute('tabindex', '0')
  await expect(frame).toHaveAccessibleDescription(
    'Drag or use the arrow keys to pan; press plus or minus to zoom. The index lists every place.',
  )
  await expect(frame.getByRole('link')).toHaveCount(0)

  // Two numbered markers, not tab stops, none selected.
  await expect(frame.getByRole('button')).toHaveCount(2)
  for (const name of ['01 Parkside Community Garden', '02 Subway station']) {
    const marker = frame.getByRole('button', { name, exact: true })
    await expect(marker).toHaveAttribute('tabindex', '-1')
    await expect(marker).toHaveAttribute('aria-pressed', 'false')
  }

  // The index has one ungrouped entry per marker, all collapsed.
  const index = demo.getByRole('region', { name: 'Index', exact: true })
  await expect(index.getByRole('button')).toHaveCount(2)
  await expect(
    index.getByRole('button', { name: '01 Parkside Community Garden', exact: true }),
  ).toHaveAttribute('aria-expanded', 'false')
  await expect(
    index.getByRole('button', { name: '02 Subway station', exact: true }),
  ).toHaveAttribute('aria-expanded', 'false')

  // Zoom 16 within 13 to 18 is step 4 of 6, so both zoom buttons start enabled.
  const toolbar = demo.getByRole('toolbar', { name: 'Map controls' })
  await expect(toolbar.locator('output')).toHaveText('Zoom 4 of 6')
  await expect(toolbar.getByRole('button', { name: 'Zoom in' })).toBeEnabled()
  await expect(toolbar.getByRole('button', { name: 'Zoom out' })).toBeEnabled()
  await expect(toolbar.getByRole('button', { name: 'Reset map view' })).toBeEnabled()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('pmtiles zooms between its bounds and resets', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const toolbar = demo.getByRole('toolbar', { name: 'Map controls' })
  const zoomIn = toolbar.getByRole('button', { name: 'Zoom in' })
  const zoomOut = toolbar.getByRole('button', { name: 'Zoom out' })
  const reset = toolbar.getByRole('button', { name: 'Reset map view' })
  const status = toolbar.locator('output')
  const frame = demo.getByRole('region', { name: 'Getting there', exact: true })

  // Pointer: zoom in to maxZoom 18.
  await zoomIn.click()
  await expect(status).toHaveText('Zoom 5 of 6')
  await zoomIn.click()
  await expect(status).toHaveText('Zoom 6 of 6')
  await expect(zoomIn).toBeDisabled()

  // Keyboard on the focused map: minus zooms out to minZoom 13.
  await frame.focus()
  for (const expected of ['Zoom 5 of 6', 'Zoom 4 of 6', 'Zoom 3 of 6', 'Zoom 2 of 6', 'Zoom 1 of 6']) {
    await page.keyboard.press('-')
    await expect(status).toHaveText(expected)
  }
  await expect(zoomOut).toBeDisabled()
  await expect(zoomIn).toBeEnabled()
  await page.keyboard.press('_')
  await expect(status).toHaveText('Zoom 1 of 6')
  await page.keyboard.press('+')
  await expect(status).toHaveText('Zoom 2 of 6')

  // Reset returns to the starting step, from the keyboard in the toolbar.
  await reset.focus()
  await page.keyboard.press('Enter')
  await expect(status).toHaveText('Zoom 4 of 6')
  await expect(reset).toBeFocused()

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('pmtiles pans by arrow keys and by dragging', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const frame = demo.getByRole('region', { name: 'Getting there', exact: true })
  const marker = frame.getByRole('button', { name: '01 Parkside Community Garden', exact: true })

  const atReset = await marker.getAttribute('style')
  await frame.focus()
  await page.keyboard.press('ArrowUp')
  await expect(marker).not.toHaveAttribute('style', atReset!)
  const afterUp = await marker.getAttribute('style')
  await page.keyboard.press('ArrowLeft')
  await expect(marker).not.toHaveAttribute('style', afterUp!)

  // A pointer drag pans and selects nothing.
  const beforeDrag = await marker.getAttribute('style')
  const box = (await frame.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 4
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 30, y + 20, { steps: 5 })
  await page.mouse.move(x + 60, y + 40, { steps: 5 })
  await expect(frame).toHaveAttribute('data-dragging', '')
  await page.mouse.up()
  await expect(frame).not.toHaveAttribute('data-dragging', '')
  await expect(marker).not.toHaveAttribute('style', beforeDrag!)
  await expect(frame.locator('[aria-pressed="true"]')).toHaveCount(0)

  // Reset brings the marker back to where it started.
  await demo.getByRole('button', { name: 'Reset map view' }).click()
  await expect(marker).toHaveAttribute('style', atReset!)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('pmtiles links markers and index entries both ways', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  const demo = await openDemo(page)
  const frame = demo.getByRole('region', { name: 'Getting there', exact: true })
  const index = demo.getByRole('region', { name: 'Index', exact: true })
  const stationMarker = frame.getByRole('button', { name: '02 Subway station', exact: true })
  const stationEntry = index.getByRole('button', { name: '02 Subway station', exact: true })
  const gardenMarker = frame.getByRole('button', { name: '01 Parkside Community Garden', exact: true })
  const gardenEntry = index.getByRole('button', { name: '01 Parkside Community Garden', exact: true })

  // Pointer: a marker opens its entry; selecting it again clears.
  await stationMarker.click()
  await expect(stationMarker).toHaveAttribute('aria-pressed', 'true')
  await expect(stationEntry).toHaveAttribute('aria-expanded', 'true')
  await expect(index.getByText('Trains every 6 to 10 minutes.')).toBeVisible()
  await stationMarker.click()
  await expect(stationMarker).toHaveAttribute('aria-pressed', 'false')
  await expect(stationEntry).toHaveAttribute('aria-expanded', 'false')

  // Keyboard: opening an index entry selects its marker; one entry is open at a time.
  await gardenEntry.focus()
  await page.keyboard.press('Enter')
  await expect(gardenEntry).toHaveAttribute('aria-expanded', 'true')
  await expect(gardenMarker).toHaveAttribute('aria-pressed', 'true')
  await expect(index.getByText('Open daily from dawn to dusk.')).toBeVisible()

  await stationEntry.focus()
  await page.keyboard.press('Enter')
  await expect(stationEntry).toHaveAttribute('aria-expanded', 'true')
  await expect(gardenEntry).toHaveAttribute('aria-expanded', 'false')
  await expect(stationMarker).toHaveAttribute('aria-pressed', 'true')
  await expect(gardenMarker).toHaveAttribute('aria-pressed', 'false')

  await page.keyboard.press('Enter')
  await expect(stationEntry).toHaveAttribute('aria-expanded', 'false')
  await expect(frame.locator('[aria-pressed="true"]')).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
