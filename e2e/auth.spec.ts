import { test, expect } from "@playwright/test";

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
}

const SHARED_PASSWORD = "testpass123";

test.describe("Home page", () => {
  test("loads with hero and CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Start Planning")).toBeVisible();
    await expect(page.locator("text=Get Started Free")).toBeVisible();
  });
});

test.describe("Registration", () => {
  const email = uniqueEmail("reg");

  test("registers a new user and redirects to dashboard", async ({ page }) => {
    await page.goto("/register");
    await page.fill('input[type="text"]', "Test User");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', SHARED_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("shows error for duplicate email", async ({ page }) => {
    await page.goto("/register");
    await page.fill('input[type="text"]', "Test User");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', SHARED_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page.locator(".bg-red-50")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Login", () => {
  const email = uniqueEmail("login");

  test.beforeAll(async ({ request }) => {
    await request.post("/api/register", {
      data: { name: "Login User", email, password: SHARED_PASSWORD },
    });
  });

  test("logs in with valid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', SHARED_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("shows error for wrong password", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator(".bg-red-50")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Auth guards", () => {
  test("unauthenticated user is redirected from /dashboard to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login", { timeout: 15000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user is redirected from /trip/new to /login", async ({
    page,
  }) => {
    await page.goto("/trip/new");
    await page.waitForURL("**/login", { timeout: 15000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Logout", () => {
  test("logs out and returns to home", async ({ page }) => {
    const email = uniqueEmail("logout");

    await page.goto("/register");
    await page.fill('input[type="text"]', "Logout User");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', SHARED_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    await page.locator('button:text("Logout")').click();
    await page.waitForTimeout(3000);
    await page.goto("/dashboard");
    await page.waitForURL("**/login", { timeout: 15000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
