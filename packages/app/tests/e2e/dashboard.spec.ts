import { expect, test, withLogin } from "../utils/fixtures";

test.describe("Dashboard", () => {
  const { teamName } = withLogin();
  test("should display the team name", async ({ page }) => {
    await page.goto("/dashboard");

    const combobox = page.getByRole("combobox");

    await expect(combobox).toBeVisible();
    await expect(page.getByRole("combobox")).toHaveText(teamName);
  });
});
