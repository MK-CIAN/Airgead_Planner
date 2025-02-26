import { test, expect } from '@playwright/test';

test('Authenticate and save session', async ({ page }) => {
  await page.goto('http://localhost:5173/'); // Adjust if needed

  // ✅ Wait for the login form
  await page.waitForSelector('form', { timeout: 10000 });

  // ✅ Fill in login form using more specific selectors
  await page.getByLabel('Email').fill('cian.mck01@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Kilkenny1!');  // 🔥 Updated selector

  // ✅ Click the login button
  await page.getByRole('button', { name: 'Login' }).click();

  // ✅ Wait for navigation to home page
  await page.waitForURL('http://localhost:5173/home', { timeout: 15000 });

  // ✅ Save authentication state
  await page.context().storageState({ path: 'tests/auth.json' });
});
