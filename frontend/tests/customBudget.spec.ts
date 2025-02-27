import { test, expect } from "@playwright/test";

test.use({ storageState: "tests/auth.json" }); // Ensure user is logged in

test.describe("Custom Budget Tests", () => {
  test("Navigate to Custom Budgets and Add/Remove an Item", async ({ page }) => {
    await page.goto("/budget"); // Navigate to the Budget Overview Page

    // Ensure the page loads correctly
    await page.waitForSelector('h2:text("Budgets Overview")', { timeout: 10000 });
    await expect(page.locator('h2:text("Budgets Overview")')).toBeVisible();

    // Check if a custom budget exists
    const budgetCount = await page.locator('[data-testid="custom-budget-card"]').count();
    console.log(`Number of custom budgets found: ${budgetCount}`);

    if (budgetCount === 0) {
      console.log("No custom budgets found, creating one...");

      // Open Custom Budget Form
      await page.click('button:text("Create New Custom Budget")');

      // Fill out the budget name field
      await page.fill('[data-testid="custom-budget-name-input"]', "Test Custom Budget");

      // Click the start date picker and select a date
      await page.click('[data-testid="custom-budget-start-date"]');
      await page.waitForSelector('.calendar'); // Ensure the calendar is visible
      await page.click('.calendar button:text("15")'); // Selects the 15th of the month

      // Click the end date picker and select a date
      await page.click('[data-testid="custom-budget-end-date"]');
      await page.waitForSelector('.calendar'); // Ensure the calendar is visible
      await page.click('.calendar button:text("28")'); // Selects the 28th of the month

      // Submit the form
      await page.click('[data-testid="create-custom-budget-button"]');

      // Wait for the new budget to appear
      await page.waitForSelector('[data-testid="custom-budget-card"]:has-text("Test Custom Budget")', { timeout: 7000 });
    }

    // Enter the first custom budget available
    const budgetCard = page.locator('[data-testid="custom-budget-card"]').first();
    await expect(budgetCard).toBeVisible();
    await budgetCard.click();

    // Ensure we are in the custom budget details page
    await page.waitForURL(/custom-budget/, { timeout: 15000 });

    console.log("Adding a budget item...");
    await page.fill('[data-testid="budget-amount-input"]', "150");
    await page.fill('[data-testid="budget-category-input"]', "Dining");

    // Select budget type using the same method as Monthly Budget
    const selectTrigger = page.locator('[data-testid="budget-type-select"]');
    await selectTrigger.hover(); // Ensure the dropdown is activated
    await selectTrigger.click({ force: true }); // Open dropdown forcefully

    await page.waitForSelector('[data-testid="select-item-expense"]', { timeout: 5000 });
    await page.locator('[data-testid="select-item-expense"]').click({ force: true });

    // Submit the new budget item
    await page.click('[data-testid="add-budget-button"]');

    // Verify item is added
    await page.waitForSelector('[data-testid="budget-item"]:has-text("Dining")', { timeout: 5000 });
    console.log("Budget item successfully added.");

    // Remove the added budget item
    console.log("Removing budget item...");
    const budgetItemRow = await page.locator(`[data-testid="budget-item"]`).filter({ hasText: "Dining" });

    // Ensure the row exists before proceeding
    await expect(budgetItemRow).toBeVisible({ timeout: 5000 });

    // Click remove inside the correct row
    await budgetItemRow.locator('[data-testid="remove-budget-button"]').click();

    // Wait for the specific budget item to disappear
    await expect(budgetItemRow).not.toBeVisible({ timeout: 7000 });

    console.log("Budget item successfully removed.");
  });
});
