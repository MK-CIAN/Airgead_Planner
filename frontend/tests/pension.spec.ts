import { test, expect } from "@playwright/test";

test.use({ storageState: "tests/auth.json" }); // Ensure user is logged in

test.describe("Pension Planner E2E Test", () => {
  test("Calculate, Save, and Remove a Pension Projection", async ({ page }) => {
    await page.goto("/pensions"); // Navigate to Pension Planner Page

    // Ensure the page loads correctly
    await page.waitForSelector('h1:text("Pension Planner")', { timeout: 10000 });
    await expect(page.locator('h1:text("Pension Planner")')).toBeVisible();

    // Fill out the pension calculation form
    await page.fill('[data-testid="starting-age-input"]', "25");
    await page.fill('[data-testid="retirement-age-input"]', "65");
    await page.fill('[data-testid="annual-salary-input"]', "50000");
    await page.fill('[data-testid="contribution-rate-input"]', "10");
    await page.fill('[data-testid="employer-match-input"]', "5");
    await page.fill('[data-testid="roi-input"]', "7");

    // Click the Calculate button
    await page.click('[data-testid="calculate-pension-button"]');

    // Ensure the projection card appears
    await page.waitForSelector('[data-testid="pension-projection-card"]', { timeout: 5000 });
    await expect(page.locator('[data-testid="pension-projection-card"]')).toBeVisible();

    // Ensure the growth chart renders correctly
    await page.waitForSelector('[data-testid="pension-growth-chart"]', { timeout: 5000 });

    // Click the Save Projection button
    await page.click('[data-testid="save-pension-button"]');

    // Verify that the saved projection appears in the saved list
    await page.waitForSelector('[data-testid="saved-pension-card"]', { timeout: 5000 });
    const savedProjectionsCount = await page.locator('[data-testid="saved-pension-card"]').count();
    console.log(`Saved projections count: ${savedProjectionsCount}`);
    await expect(page.locator('[data-testid="saved-pension-card"]')).toBeVisible();

    // Click the Remove button inside the saved projection
    const savedProjection = page.locator('[data-testid="saved-pension-card"]').first();
    await savedProjection.locator('[data-testid="remove-pension-button"]').click();

    // Ensure the projection is removed
    await expect(savedProjection).not.toBeVisible({ timeout: 7000 });

    console.log("Pension projection successfully removed.");
  });
});
