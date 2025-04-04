import { test, expect } from '@playwright/test';

test('Authenticate and save session', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Wait for email input
  await page.waitForSelector('input[id="email"]', { timeout: 10000 });

  // Fill out login form
  await page.locator('input[id="email"]').fill('cian.mck01@gmail.com');
  await page.locator('input[id="password"]').fill('Kilkenny1!');

  // Click the Login button more reliably
  await page.locator('form button:has-text("Login")').click();

  // Wait for either route to appear
  await page.waitForURL(/localhost:5173\/(home|userinterests)/, { timeout: 15000 });

  // Save auth state
  await page.context().storageState({ path: 'tests/auth.json' });
});
