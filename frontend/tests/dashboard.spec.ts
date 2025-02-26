import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/auth.json' }); // ✅ Ensure user is logged in

test('Dashboard loads and displays the Financial Dashboard title', async ({ page }) => {
  await page.goto('/home'); // ✅ Navigate to the Dashboard

  // ✅ Ensure the page loads correctly by checking the title
  await expect(page).toHaveTitle(/Airgead Planner/);

  // ✅ Check for the H4 heading "Your Financial Dashboard"
  await expect(page.getByRole('heading', { level: 4, name: 'Your Financial Dashboard' })).toBeVisible();
});
