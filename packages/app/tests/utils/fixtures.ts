import { test as base } from "@playwright/test";
import { PanthoraPage } from "./panthoraPage";

type Fixutres = {
  panthora: PanthoraPage;
};

export const test = base.extend<Fixutres>({
  panthora: async ({ page }, use) => {
    await use(new PanthoraPage(page));
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
export { expect } from "@playwright/test";
