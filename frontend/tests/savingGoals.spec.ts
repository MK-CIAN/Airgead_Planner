import { test, expect } from "@playwright/test";

test.use({ storageState: "tests/auth.json" }); // Ensure user is logged in

test.describe("Savings Goals E2E Test", () => {
  test("Navigate to Savings Goals, Select a Goal, and Add a Contribution", async ({ page }) => {
    await page.goto("/savings"); // Navigate to the Savings Goals Page

    await page.waitForTimeout(2000); // Wait 2 seconds
    // Ensure the page loads correctly
    await page.waitForSelector('h1:text("Savings Goals")', { timeout: 10000 });
    await expect(page.locator('h1:text("Savings Goals")')).toBeVisible();

    // Check if any savings goals exist
    const savingsGoalCount = await page.locator('[data-testid="savings-goal-card"]').count();
    console.log(`Number of savings goals found: ${savingsGoalCount}`);

    if (savingsGoalCount === 0) {
      console.log("No savings goals found. Please add a goal before running the test.");
      return; // Exiting the test early if no goals exist
    }

    // Select the first available savings goal
    const savingsGoalCard = page.locator('[data-testid="savings-goal-card"]').first();
    await expect(savingsGoalCard).toBeVisible();
    savingsGoalCard.locator('[data-testid="savings-goal-card-expand"]').click();

    await page.waitForURL(/savings\/\d+/, { timeout: 15000 });
    await expect(page.locator("h1")).toBeVisible();

    console.log("Adding a contribution...");
    await page.fill('[data-testid="contribution-amount-input"]', "50"); // Entering 50€ as contribution

    // Click the Add Contribution button
    await page.click('[data-testid="add-contribution-button"]');

    // Verify that the contribution was successfully added
    await page.waitForSelector('.bg-green-500', { timeout: 5000 });
    console.log("Contribution successfully added.");
  });
});
