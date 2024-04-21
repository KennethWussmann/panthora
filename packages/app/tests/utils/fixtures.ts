import { type BrowserContextOptions, test as base } from "@playwright/test";
import {
  e2eBaseUrl,
  e2eUsers,
  screenshotPath,
  type E2EUserType,
} from "./constants";
import { join } from "path";
import { readFileSync } from "fs";

export const test = base.extend({
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

type ScreenshotFixture = {
  takeScreenshot: () => Promise<void>;
};

export const screenshot = base.extend<ScreenshotFixture>({
  takeScreenshot: async ({ page, colorScheme }, use) => {
    const fn = async () => {
      await page.screenshot({
        path: join(screenshotPath, `assetTable_${colorScheme ?? "light"}.png`),
      });
    };
    await use(fn);
  },
});

type StorageState = Exclude<
  BrowserContextOptions["storageState"],
  undefined | string
>;
export const withLogin = (
  type: E2EUserType = "user",
  useTest: typeof test | typeof screenshot = test
) => {
  const user = e2eUsers[type];
  const state = JSON.parse(
    readFileSync(user.storageState, "utf-8")
  ) as StorageState;
  useTest.use({
    storageState: {
      ...state,
      origins: state.origins.map((origin) => {
        if (origin.origin === e2eBaseUrl && origin.localStorage) {
          return {
            ...origin,
            localStorage: origin.localStorage.map((item) => {
              if (item.name === "chakra-ui-color-mode") {
                return {
                  ...item,
                  value: "system",
                };
              }
              return item;
            }),
          };
        }
        return origin;
      }),
    } satisfies StorageState,
  });
  return user;
};

export { expect } from "@playwright/test";
