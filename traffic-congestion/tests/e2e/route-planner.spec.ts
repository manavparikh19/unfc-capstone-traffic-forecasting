import { expect, test } from "@playwright/test";

test("route planner navigates to results", async ({ page }) => {
  await page.goto("/route-planner");

  await page.getByLabel("Origin").selectOption("Downtown Core");
  await page.getByLabel("Destination").selectOption("Airport Corridor");
  await page.getByLabel("Departure date").fill("2026-03-16");
  await page.getByLabel("Departure time").fill("08:30");
  await page
    .getByRole("button", { name: /generate future-aware routes/i })
    .click();

  await expect(page).toHaveURL(/route-planner\/results/);
  await expect(page.getByText(/recommended route/i)).toBeVisible();
});
