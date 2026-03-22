import { expect, test } from "@playwright/test";

test("homepage presents the main value proposition", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /forecast congestion before it forms/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /explore the live demo/i }),
  ).toBeVisible();
});
