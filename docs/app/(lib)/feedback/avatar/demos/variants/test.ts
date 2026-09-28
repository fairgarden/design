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
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before asserting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  return { demo, pageErrors }
}

test('variants renders five fixed sizes with photos and initials', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  // Row one: five photo avatars named by alt text; their initials faces unmount once loaded.
  await expect(demo.getByRole('img', { name: 'Ana Díaz', exact: true })).toHaveCount(5)

  // Row two: five initials avatars (the status row adds a sixth, the group a seventh).
  const initials = demo.getByText('BO', { exact: true })
  await expect(initials).toHaveCount(7)

  // xs 24, sm 32, md 40, lg 64 and xl 128 px.
  const expected = [24, 32, 40, 64, 128]
  let previous = 0
  for (const [i, size] of expected.entries()) {
    const box = await initials.nth(i).locator('xpath=..').boundingBox()
    expect(box, `avatar ${i} should be laid out`).not.toBeNull()
    expect(Math.abs(box!.width - size)).toBeLessThanOrEqual(4)
    expect(Math.abs(box!.height - box!.width)).toBeLessThanOrEqual(1)
    expect(box!.width).toBeGreaterThan(previous)
    previous = box!.width
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('variants names status in words beside the avatar', async ({ page }) => {
  const { demo, pageErrors } = await openDemo(page)

  await expect(demo.getByRole('img', { name: 'Online' })).toBeVisible()
  await expect(demo.getByRole('img', { name: 'Away' })).toBeVisible()
  await expect(demo.getByText('Ana Díaz · Online')).toBeVisible()
  await expect(demo.getByText('Ben Okafor · Away')).toBeVisible()
  // The photo beside a visible name has empty alt, so it is not announced.
  await expect(demo.locator('img[alt=""]')).toHaveCount(1)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

for (const [width, visible, hidden, shown] of [
  [390, '6 more', '4 more', 3],
  [1280, '4 more', '6 more', 5],
] as const) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } })

    test(`variants groups ${shown} avatars and a "+N" avatar`, async ({ page }) => {
      const { demo, pageErrors } = await openDemo(page)

      const group = demo.getByRole('group', { name: 'Stewardship team' })
      await expect(group).toBeVisible()
      // Six people passed with a total of nine: at most five avatars render, the sixth never.
      for (const initials of ['AD', 'BO', 'CP', 'DR', 'EM']) {
        await expect(group.getByText(initials, { exact: true })).toHaveCount(1)
      }
      await expect(group.getByText('FL', { exact: true })).toHaveCount(0)

      // Three avatars at base, five from 1024 px, and the "+N" count follows.
      await expect(group.getByRole('img', { name: visible })).toBeVisible()
      await expect(group.getByRole('img', { name: hidden })).toHaveCount(0)
      await expect(group.locator(`[aria-label="${hidden}"]`)).toBeHidden()
      const lastShown = ['AD', 'BO', 'CP', 'DR', 'EM'][shown - 1]
      await expect(group.getByText(lastShown, { exact: true })).toBeVisible()
      if (shown === 3) await expect(group.getByText('DR', { exact: true })).toBeHidden()

      expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
    })
  })
}
