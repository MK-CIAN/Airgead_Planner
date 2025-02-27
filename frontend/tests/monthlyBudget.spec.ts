import { test, expect } from "@playwright/test";

test.use({ storageState: "tests/auth.json" }); // Ensure user is logged in

test("Testing Monthly Budget Navigation and Item Adding and Removing", async ({
  page,
}) => {
  await page.goto("/budget"); // Navigate to the Dashboard

  // Ensure the page loads correctly by checking the title
  await page.waitForSelector('h2:text("Budgets Overview")', { timeout: 10000 });
  await expect(page.locator('h2:text("Budgets Overview")')).toBeVisible();

  const budgetCards = await page
    .locator('[data-testid="monthly-budget-card"]')
    .count();
  console.log(`Number of budget cards found: ${budgetCards}`);

  const budgetCard = page
    .locator('[data-testid="monthly-budget-card"]')
    .first();
  await expect(budgetCard).toBeVisible(); // Ensure it is present
  await budgetCard.click();

  await page.waitForTimeout(3000); // Temporary wait to observe behavior
  console.log(`Current URL after click: ${page.url()}`);

  await page.waitForURL(/monthly-budget/, { timeout: 15000 });
  await expect(
    page.getByRole("heading", { level: 4, name: "Monthly Budget" })
  ).toBeVisible();

  console.log("Adding a budget item...");
  await page.fill('[data-testid="budget-amount-input"]', "100");
  await page.fill('[data-testid="budget-category-input"]', "Groceries");

  const selectTrigger = page.locator('[data-testid="budget-type-select"]');
  await selectTrigger.hover(); // Ensure the dropdown is activated
  await selectTrigger.click({ force: true }); // Open dropdown forcefully

  await page.waitForSelector('[data-testid="select-item-expense"]', {
    timeout: 5000,
  });
  await page
    .locator('[data-testid="select-item-expense"]')
    .click({ force: true });

  await page.click('[data-testid="add-budget-button"]');

  await page.waitForSelector(
    '[data-testid="budget-item"]:has-text("Groceries")',
    { timeout: 5000 }
  );
  const budgetItem = page.locator(
    '[data-testid="budget-item"]:has-text("Groceries")'
  );
  await expect(budgetItem).toBeVisible();
  console.log("Removing budget item...");

  // Find the row containing the exact budget item using the label "Groceries"
  const budgetItemRow = await page
    .locator(`[data-testid="budget-item"]`)
    .filter({ hasText: "Groceries" });

  // Ensure the row actually exists before proceeding
  await expect(budgetItemRow).toBeVisible({ timeout: 5000 });

  // Locate the remove button inside this row and click it
  await budgetItemRow.locator('[data-testid="remove-budget-button"]').click();

  // Wait for the specific budget item to disappear
  await expect(budgetItemRow).not.toBeVisible({ timeout: 7000 });

  console.log("Budget item successfully removed.");
});
