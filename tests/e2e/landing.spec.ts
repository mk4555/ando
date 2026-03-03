import { test, expect } from '@playwright/test'

test('landing page loads and shows primary CTA', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: /get started|continue with google|start planning/i }).first()).toBeVisible()
})
