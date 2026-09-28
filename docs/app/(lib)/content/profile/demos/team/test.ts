import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'

// The standalone demo route, derived from this file's location under `app`.
// Route groups such as `(lib)` are not part of the URL.
const route = path
  .dirname(import.meta.filename)
  .split('/app')
  .pop()!
  .replace(/\/\([^)]+\)/g, '')

const people = [
  { name: 'Ana Díaz', role: 'Stewardship director' },
  { name: 'Ben Okafor', role: 'Trail crew lead' },
  { name: 'Mei Lin', role: 'Education' },
  { name: 'Sam Reyes', role: 'Former board chair' },
  { name: 'Iris Novak', role: 'Development' },
]

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

test('team lists each member with a photo, linked name and role', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const members = demo.getByRole('list').getByRole('listitem')
  await expect(members).toHaveCount(people.length)

  for (const [index, person] of people.entries()) {
    const member = members.nth(index)
    // The photo is decorative (empty alt) because the name follows it.
    const photo = member.locator('img')
    await expect(photo).toHaveCount(1)
    await expect(photo).toHaveAttribute('alt', '')
    const heading = member.getByRole('heading', { level: 3, name: person.name })
    await expect(heading).toBeVisible()
    await expect(heading.getByRole('link', { name: person.name })).toHaveAttribute('href', '#team')
    await expect(member).toContainText(person.role)
  }

  // Former members say so in words and are never dimmed.
  const former = members.filter({ hasText: 'Former board chair' })
  await expect(former).toHaveCount(1)
  await expect(former).toHaveCSS('opacity', '1')

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})

test('team moves through the member links by keyboard and follows them', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  const demo = await openDemo(page)

  const links = demo.getByRole('list').getByRole('link')
  await expect(links).toHaveText(people.map((person) => person.name))

  // One tab stop per member, in reading order.
  await links.first().focus()
  await expect(links.first()).toBeFocused()
  for (let index = 1; index < people.length; index++) {
    await page.keyboard.press('Tab')
    await expect(links.nth(index)).toBeFocused()
  }
  await page.keyboard.press('Shift+Tab')
  await expect(links.nth(people.length - 2)).toBeFocused()

  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#team$/)
  await page.evaluate(() => history.replaceState(null, '', location.pathname))
  await demo.getByRole('link', { name: 'Mei Lin' }).click()
  await expect(page).toHaveURL(/#team$/)

  expect(pageErrors, 'the demo should run without uncaught errors').toEqual([])
})
