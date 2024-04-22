import { type BrowserContextOptions, test as base } from "@playwright/test";
import {
  e2eBaseUrl,
  e2eUsers,
  screenshotPath,
  websiteAssets,
  type E2EUserType,
} from "./constants";
import { readFileSync } from "fs";
import { PanthoraPage } from "./panthoraPage";
import { join } from "path";

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

type ScreenshotPathType = "screenshots" | "website-assets";
type ScreenshotFixture = {
  takeScreenshot: (destination?: ScreenshotPathType) => Promise<void>;
  api: PanthoraPage;
  addUserAnnotation: string;
};

export const screenshot = base.extend<ScreenshotFixture>({
  takeScreenshot: async ({ page, colorScheme }, use, workerInfo) => {
    const fileName = `${workerInfo.titlePath[workerInfo.titlePath.length - 1]}-${colorScheme ?? "light"}.png`;
    const destinationPathMap: Record<ScreenshotPathType, string> = {
      screenshots: join(
        screenshotPath,
        ...workerInfo.titlePath.slice(1, workerInfo.titlePath.length - 1),
        fileName
      ),
      "website-assets": join(websiteAssets, fileName),
    };

    const fn = async (path?: ScreenshotPathType) => {
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: destinationPathMap[path ?? "screenshots"],
      });
    };
    await use(fn);
  },
  api: async ({ page, playwright }, use) => {
    const apiContext = await playwright.request.newContext({
      baseURL: e2eBaseUrl,
    });
    const panthoraPage = new PanthoraPage(
      apiContext,
      page,
      e2eUsers["user-screenshots"]
    );
    await panthoraPage.loadCookiesFromContext();
    await use(panthoraPage);
  },
  addUserAnnotation: [
    async ({ api }, use, workerInfo) => {
      await use("addUserAnnotation");
      const user = e2eUsers["user-screenshots"];
      workerInfo.annotations.push({
        type: "E-Mail",
        description: user.email,
      });
      workerInfo.annotations.push({
        type: "Password",
        description: user.password,
      });
      workerInfo.annotations.push({
        type: "Team Name",
        description: user.teamName,
      });
      workerInfo.annotations.push({
        type: "Team ID",
        description: api.teamId ?? "none",
      });
      workerInfo.annotations.push({
        type: "Seed",
        description: user.seed?.name ?? "none",
      });
    },
    { scope: "test", auto: true },
  ],
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
