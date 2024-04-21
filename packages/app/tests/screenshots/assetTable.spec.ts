import { screenshot, withLogin } from "tests/utils/fixtures";

screenshot.describe("Asset > Table", () => {
  withLogin("user-screenshots", screenshot);
  screenshot("should render the table", async ({ page, takeScreenshot }) => {
    await page.goto("/assets");

    await page.waitForLoadState("networkidle");

    await takeScreenshot();
  });
});
