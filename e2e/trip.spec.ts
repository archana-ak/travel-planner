import { test, expect } from "@playwright/test";

const MOCK_ITINERARY = {
  transport: [
    {
      type: "flight",
      provider: "Test Airlines",
      departureTime: "08:00",
      arrivalTime: "10:30",
      duration: "2h 30m",
      pricePerPerson: 150,
      totalPrice: 300,
      notes: "Direct flight",
    },
  ],
  packingList: [
    { category: "Clothing", items: ["T-shirts", "Jacket", "Comfortable shoes"] },
    { category: "Electronics", items: ["Phone charger", "Camera"] },
  ],
  places: [
    {
      name: "Eiffel Tower",
      category: "tourist_attraction",
      description: "Iconic landmark",
      estimatedTime: "2 hours",
      cost: "€26",
    },
    {
      name: "Hidden Garden",
      category: "hidden_gem",
      description: "A quiet garden",
      estimatedTime: "1 hour",
      cost: "Free",
    },
  ],
  activities: [
    {
      name: "Seine River Cruise",
      description: "Scenic boat tour",
      estimatedCost: "€15",
      bestTime: "evening",
    },
  ],
  foods: [
    {
      name: "Croissant at Local Bakery",
      type: "local_cuisine",
      description: "Classic French pastry",
      priceRange: "€2-€4",
      mustTry: true,
    },
  ],
  dayPlan: [
    {
      day: 1,
      date: "2026-07-15",
      title: "Arrival & Exploration",
      activities: [
        {
          time: "09:00",
          activity: "Arrive in Paris",
          location: "CDG Airport",
          notes: "Take shuttle to hotel",
        },
        {
          time: "14:00",
          activity: "Visit Eiffel Tower",
          location: "Champ de Mars",
          notes: "Book tickets in advance",
        },
      ],
    },
  ],
};

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
}

async function registerAndLogin(page: import("@playwright/test").Page) {
  const email = uniqueEmail("trip");
  await page.goto("/register");
  await page.fill('input[type="text"]', "Trip User");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', "testpass123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

async function fillTripForm(
  page: import("@playwright/test").Page,
  destination = "Paris"
) {
  await page.fill('input[name="destination"]', destination);
  await page.fill('input[name="startDate"]', "2026-07-15");
  await page.fill('input[name="endDate"]', "2026-07-18");
  await page.fill('input[name="startPoint"]', "Amsterdam");
  await page.fill('input[name="endPoint"]', "Amsterdam");
  await page.fill('input[name="numPeople"]', "2");
  await page.fill('input[name="budget"]', "1500");
  await page.selectOption('select[name="currency"]', "EUR");
}

function makeTripResponse(destination: string, tripId: string) {
  return {
    id: tripId,
    destination,
    startDate: "2026-07-15",
    endDate: "2026-07-18",
    numPeople: 2,
    budget: 1500,
    currency: "EUR",
    startPoint: "Amsterdam",
    endPoint: "Amsterdam",
    createdAt: new Date().toISOString(),
    itinerary: {
      id: "itin-1",
      transport: JSON.stringify(MOCK_ITINERARY.transport),
      packingList: JSON.stringify(MOCK_ITINERARY.packingList),
      places: JSON.stringify(MOCK_ITINERARY.places),
      activities: JSON.stringify(MOCK_ITINERARY.activities),
      foods: JSON.stringify(MOCK_ITINERARY.foods),
      dayPlan: JSON.stringify(MOCK_ITINERARY.dayPlan),
    },
  };
}

async function setupTripMocks(
  page: import("@playwright/test").Page,
  destination: string
) {
  const tripId = `mock-${Date.now()}`;

  await page.route("**/api/generate", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ tripId, itinerary: MOCK_ITINERARY }),
    });
  });

  await page.route(`**/api/trips/${tripId}`, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(makeTripResponse(destination, tripId)),
      });
    } else {
      await route.continue();
    }
  });

  return tripId;
}

test.describe("Trip creation", () => {
  test("form renders all fields with correct defaults", async ({ page }) => {
    await registerAndLogin(page);
    await page.goto("/trip/new");

    await expect(page.locator('input[name="destination"]')).toBeVisible();
    await expect(page.locator('input[name="startDate"]')).toBeVisible();
    await expect(page.locator('input[name="endDate"]')).toBeVisible();
    await expect(page.locator('input[name="startPoint"]')).toBeVisible();
    await expect(page.locator('input[name="endPoint"]')).toBeVisible();
    await expect(page.locator('input[name="numPeople"]')).toHaveValue("2");
    await expect(page.locator('input[name="budget"]')).toHaveValue("2000");
    await expect(page.locator('select[name="currency"]')).toHaveValue("EUR");
  });

  test("submits form and redirects to trip detail (mocked AI)", async ({
    page,
  }) => {
    await registerAndLogin(page);
    await page.goto("/trip/new");
    await setupTripMocks(page, "Paris");

    await fillTripForm(page, "Paris");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/trip/**", { timeout: 30000 });
    await expect(page.locator("text=Paris")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Trip detail page", () => {
  test("shows all tabs and allows switching", async ({ page }) => {
    await registerAndLogin(page);
    await page.goto("/trip/new");
    await setupTripMocks(page, "Rome");

    await fillTripForm(page, "Rome");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/trip/**", { timeout: 30000 });

    await expect(page.locator("text=Rome")).toBeVisible({ timeout: 10000 });

    const tabs = ["Transport", "Packing List", "Places", "Activities", "Food", "Day Plan"];
    for (const tab of tabs) {
      const tabButton = page.locator("button", { hasText: tab }).first();
      await tabButton.click();
      await expect(tabButton).toBeVisible();
    }
  });
});

test.describe("Trip management", () => {
  test("trip appears on dashboard and can be deleted", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/trip/new");

    await page.route("**/api/generate", async (route) => {
      const postData = route.request().postDataJSON();
      const createRes = await route.fetch({
        url: route.request().url().replace("/api/generate", "/api/trips"),
        method: "POST",
        headers: route.request().headers(),
        postData: JSON.stringify(postData),
      });
      if (createRes.ok()) {
        const trip = await createRes.json();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ tripId: trip.id, itinerary: MOCK_ITINERARY }),
        });
      } else {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Failed" }),
        });
      }
    });

    await fillTripForm(page, "Tokyo");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/trip/**", { timeout: 30000 });

    await page.goto("/dashboard");
    await expect(page.locator("text=Tokyo")).toBeVisible({ timeout: 10000 });

    page.on("dialog", (dialog) => dialog.accept());
    await page.click("text=Delete");

    await expect(page.locator("text=Tokyo")).not.toBeVisible({ timeout: 10000 });
  });
});
