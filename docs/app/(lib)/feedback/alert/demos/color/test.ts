import path from 'node:path'
import { test, expect } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

test('color computes the secondary from the status and lets explicit scales win', async ({
  page,
}) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(route)
  const code = page.locator('.demo').first()
  // The preview remounts when the demo's code content replaces the loading fallback. The tabs
  // are disabled until then, so wait for them before asserting.
  await expect(
    code.locator('[role="tab"][aria-disabled="true"], [role="tab"][disabled]'),
  ).toHaveCount(0, { timeout: 15000 })
  // The Demo's preview surface, without its code panel (a stable CSS Module local name).
  const demo = code.locator('[class*="__preview"]').first()

  // Three alerts, none of them danger, so all are polite status regions.
  const alerts = demo.getByRole('status')
  await expect(alerts).toHaveCount(3)
  await expect(demo.getByRole('alert')).toHaveCount(0)

  const [defaultAlert, irisAlert, slateAlert] = [alerts.nth(0), alerts.nth(1), alerts.nth(2)]

  // Each leads with its run-in title, then the message.
  await expect(defaultAlert.locator('strong')).toHaveText('Default.')
  await expect(defaultAlert).toContainText('Info takes indigo from its status.')
  await expect(irisAlert.locator('strong')).toHaveText('secondary="iris".')
  await expect(irisAlert).toContainText('The bar and glyph take the override.')
  await expect(slateAlert.locator('strong')).toHaveText('primary="slate".')
  await expect(slateAlert).toContainText('The text ink comes from slate.')

  // The glyph names the status in words, so status is never shape or color alone.
  await expect(defaultAlert.getByRole('img', { name: 'Information' })).toBeVisible()
  await expect(irisAlert.getByRole('img', { name: 'Information' })).toBeVisible()
  await expect(slateAlert.getByRole('img', { name: 'Success' })).toBeVisible()

  // Status computes the secondary scale; an explicit secondary overrides it; primary adds ink.
  await expect(defaultAlert).toHaveClass(/secondaryIndigo/)
  await expect(defaultAlert).not.toHaveClass(/primary[A-Z]/)
  await expect(irisAlert).toHaveClass(/secondaryIris/)
  await expect(irisAlert).not.toHaveClass(/secondaryIndigo/)
  await expect(slateAlert).toHaveClass(/secondaryGreen/)
  await expect(slateAlert).toHaveClass(/primarySlate/)

  // No action on any of them.
  await expect(demo.getByRole('button', { name: 'Retry' })).toHaveCount(0)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
