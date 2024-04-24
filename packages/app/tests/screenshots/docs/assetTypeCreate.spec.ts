import { screenshot, withLogin } from "tests/utils/fixtures";

screenshot.describe("assetTypes", () => {
  withLogin("user-screenshots", screenshot);
  screenshot("create-1", async ({ page, takeScreenshot }) => {
    await page.setViewportSize({ width: 1400, height: 570 });
    await page.goto(
      "/asset-types/create?annotationCollection=create-asset-type-1"
    );

    await page.getByLabel("Name").fill("Kitchen Utensils");

    await takeScreenshot("docs-assets");
  });

  screenshot("create-2", async ({ page, takeScreenshot }) => {
    await page.setViewportSize({ width: 1400, height: 920 });
    await page.goto(
      "/asset-types/create?annotationCollection=create-asset-type-2"
    );

    await page.getByLabel("Name").fill("Kitchen Utensils");
    await page.getByRole("button", { name: "Add Custom Field" }).click();
    await page.locator('input[name="fields\\.0\\.name"]').fill("Brand");
    await page.locator(".chakra-switch__track").first().click();

    await takeScreenshot("docs-assets");
  });
});
