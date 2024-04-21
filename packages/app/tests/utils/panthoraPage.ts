import { type Page } from "@playwright/test";

export class PanthoraPage {
  constructor(private readonly page: Page) {}

  public async enableDarkMode() {
    await this.page.evaluate(() => {
      localStorage.setItem("chakra-ui-color-mode", "dark");
    });
    await this.page.reload();
  }
}
