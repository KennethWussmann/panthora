import { chromium, request } from "@playwright/test";
import { e2eBaseUrl, e2eUsers } from "./constants";
import { PanthoraPage } from "./panthoraPage";

const globalSetup = async () => {
  const browser = await chromium.launch();
  const apiContext = await request.newContext({
    baseURL: e2eBaseUrl,
  });

  for (const user of Object.values(e2eUsers)) {
    const page = await browser.newPage();
    const panthoraPage = new PanthoraPage(apiContext, page, user);

    await panthoraPage.setupUserWithTeam();
    await page.context().storageState({ path: user.storageState });
  }
};

export default globalSetup;
