import { test as base } from "@playwright/test";
import { PanthoraPage } from "./panthoraPage";
import { e2eBaseUrl, e2eUser } from "./constants";

type Fixutres = {
  panthora: PanthoraPage;
};

export const test = base.extend<Fixutres>({
  panthora: async ({ playwright, page }, use) => {
    const apiContext = await playwright.request.newContext({
      baseURL: e2eBaseUrl,
    });
    await use(new PanthoraPage(apiContext, page));
  },
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

export const withLogin = () => {
  test.use({ storageState: e2eUser.storageState });
  return e2eUser;
};

export { expect } from "@playwright/test";
