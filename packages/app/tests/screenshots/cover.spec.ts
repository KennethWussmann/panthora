import { expect, screenshot, withLogin } from "tests/utils/fixtures";

screenshot.describe("website", () => {
  withLogin("user-screenshots", screenshot);
  screenshot("cover", async ({ page, takeScreenshot }) => {
    await page.goto("/assets");
    await page.waitForLoadState("networkidle");

    const addFilterButton = page.getByRole("button", {
      name: "Add Filter",
    });
    const milkCell = page.getByRole("cell", { name: "Milk, 1L" });
    const moreCollapse = page.getByText("Show 16 more");

    await milkCell.waitFor({ state: "visible", timeout: 5000 });
    await addFilterButton.click();

    await expect(moreCollapse).toBeVisible();

    await takeScreenshot();
  });
});
