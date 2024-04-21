import { expect, test, withLogin } from "../utils/fixtures";

test.describe("AssetType > Table", () => {
  withLogin("user-with-seed");
  test("should render the table", async ({ page }) => {
    await page.goto("/asset-types");

    await expect(page.getByText("Book")).toBeVisible();
    await expect(page.getByText("7 fields")).toBeVisible();
  });
});
