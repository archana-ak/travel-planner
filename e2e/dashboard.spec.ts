import { test, expect } from "@playwright/test";

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
}

async function registerAndLogin(page: import("@playwright/test").Page) {
  const email = uniqueEmail("dash");
  await page.goto("/register");
  await page.fill('input[type="text"]', "Dashboard User");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', "testpass123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

test.describe("Dashboard", () => {
  test("shows empty state for new user", async ({ page }) => {
    await registerAndLogin(page);
    await expect(page.locator("text=No trips yet")).toBeVisible();
    await expect(page.locator("text=Plan New Trip")).toBeVisible();
  });

  test("Plan New Trip button navigates to /trip/new", async ({ page }) => {
    await registerAndLogin(page);
    await page.click("text=Plan New Trip");
    await page.waitForURL("**/trip/new", { timeout: 10000 });
    await expect(page).toHaveURL(/\/trip\/new/);
  });
});
