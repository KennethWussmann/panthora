import { chromium, request } from "@playwright/test";
import { e2eBaseUrl, e2eUser } from "./constants";
import { PanthoraPage } from "./panthoraPage";

const globalSetup = async () => {
  const browser = await chromium.launch();
  const apiContext = await request.newContext({
    baseURL: e2eBaseUrl,
  });
  const page = await browser.newPage();
  const panthoraPage = new PanthoraPage(apiContext, page);

  await panthoraPage.setupUserWithTeam();
  await page.context().storageState({ path: e2eUser.storageState });
};

export default globalSetup;
