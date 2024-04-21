import { test as base } from "@playwright/test";
import { type PanthoraPage } from "./panthoraPage";
import { e2eUsers, type E2EUserType } from "./constants";

type Fixutres = {
  panthora: PanthoraPage;
};

export const test = base.extend<Fixutres>({
  page: async ({ browser }, use) => {
    const context = await browser.newContext({
      colorScheme:
        process.env.E2E_COLOR_MODE?.toLowerCase() === "dark" ? "dark" : "light",
    });
    const page = await context.newPage();
    await use(page);
    await page.close();
  },
});

export const withLogin = (type: E2EUserType = "user") => {
  const user = e2eUsers[type];
  test.use({ storageState: user.storageState });
  return user;
};

export { expect } from "@playwright/test";
