import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

const panels = [
  ['Trail Details', 'Ridge Loop'],
  ['Riparian Buffer', 'Riparian buffer'],
  ['Meeting Point', 'Visitor Barn'],
] as const

test('morph opens and closes each trigger by keyboard and pointer', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const demo = page.locator('.demo').first()
  // The preview remounts, losing its state, when the demo's code content replaces the loading
  // fallback. The tabs are disabled until then, so wait for them before interacting.
  await expect(
    demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })

  await expect(demo.getByRole('button')).toHaveText(panels.map(([label]) => label))

  for (const [label, title] of panels) {
    const trigger = demo.getByRole('button', { name: label })
    const panel = page.getByRole('dialog', { name: title })

    // Keyboard: the focus ring grows into the frame; Escape closes and focus returns.
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(panel).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()

    // Pointer: pressing the trigger again closes it.
    await trigger.click()
    await expect(panel).toBeVisible()
    await trigger.click()
    await expect(panel).toBeHidden()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  }

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test.describe('near the top of the window', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('morph opens the foot trigger upward and the top trigger downward', async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    await page.goto(route)
    const demo = page.locator('.demo').first()
    // The preview remounts, losing its state, when the demo's code content replaces the loading
    // fallback. The tabs are disabled until then, so wait for them before interacting.
    await expect(
      demo.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
    ).toHaveCount(0, { timeout: 15000 })

    const top = demo.getByRole('button', { name: 'Trail Details' })
    await top.click()
    const ridge = page.getByRole('dialog', { name: 'Ridge Loop' })
    await expect(ridge).toBeVisible()
    await expect(ridge).toHaveAttribute('data-side', 'bottom')
    await page.keyboard.press('Escape')
    await expect(ridge).toBeHidden()

    const foot = demo.getByRole('button', { name: 'Meeting Point' })
    await foot.click()
    const barn = page.getByRole('dialog', { name: 'Visitor Barn' })
    await expect(barn).toBeVisible()
    await expect(barn).toContainText('Meet by the bike racks at 8:30.')
    await expect(barn).toHaveAttribute('data-side', 'top')
    const [panelBox, triggerBox] = [(await barn.boundingBox())!, (await foot.boundingBox())!]
    expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(triggerBox.y)

    // Pressing outside closes it.
    await page.mouse.click(5, 5)
    await expect(barn).toBeHidden()

    expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
  })
})
