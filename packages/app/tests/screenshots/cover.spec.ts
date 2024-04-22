import { expect, screenshot, withLogin } from "tests/utils/fixtures";

screenshot.describe("website", () => {
  withLogin("user-screenshots", screenshot);
  screenshot("cover", async ({ page, takeScreenshot }) => {
    // TODO: Workaround until #147 is fixed. Remove once fixed.
    await page.goto("/settings/team");
    await page.waitForLoadState("networkidle");
    const rebuildIndexes = page.getByRole("button", {
      name: "Rebuild Search Indexes",
    });
    await expect(rebuildIndexes).toBeVisible();
    await rebuildIndexes.click();
    // --- End of workaround

    await page.goto("/assets");

    const addFilterButton = page.getByRole("button", {
      name: "Add Filter",
    });
    const milkCell = page.getByRole("cell", { name: "Milk, 1L" });
    const moreCollapse = page.getByText("Show 16 more");

    await milkCell.waitFor({ state: "visible", timeout: 5000 });

    await addFilterButton.click();
    await expect(moreCollapse).toBeVisible();

    await takeScreenshot();
    await takeScreenshot("website-assets");
  });
});
