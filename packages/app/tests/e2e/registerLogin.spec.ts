import { expect, type Page } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { test } from "../utils/fixtures";

const signIn = async (page: Page, email: string, password: string) => {
  const emailField = page.getByRole("textbox", { name: "E-Mail" });
  const passwordField = page.getByPlaceholder("Password", { exact: true });

  // ASSERT that fields exist
  await expect(emailField).toBeVisible();
  await expect(passwordField).toBeVisible();

  // THEN fill fields
  await emailField.fill(email);
  await passwordField.fill(password);

  // THEN submit form
  await page.getByRole("button", { name: "Login" }).click();
};

test.describe("Register / Login", () => {
  test("redirects to login page when logged out", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("textbox", { name: "E-Mail" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create Account" })
    ).toBeVisible();
  });

  test.describe("Registration Flow", () => {
    const email =
      `${faker.person.firstName()}.${faker.person.lastName()}@panthora.app`.toLowerCase();
    const password = faker.internet.password();

    test.describe.configure({ mode: "serial" });

    test("registers new account", async ({ page }) => {
      // THEN
      await page.goto("/auth/signin");

      await page.getByRole("button", { name: "Create Account" }).click();

      const emailField = page.getByRole("textbox", { name: "E-Mail" });
      const passwordField = page.getByPlaceholder("Password", { exact: true });
      const passwordConfirmField = page.getByPlaceholder("Password confirm");

      // ASSERT that fields exist
      await expect(emailField).toBeVisible();
      await expect(passwordField).toBeVisible();
      await expect(passwordConfirmField).toBeVisible();

      // THEN fill fields
      await emailField.fill(email);
      await passwordField.fill(password);
      await passwordConfirmField.fill(password);

      // THEN submit form
      await page.getByRole("button", { name: "Create Account" }).click();

      // ASSERT account registered successfully
      await expect(
        page.getByText("Registration complete! You can now login.")
      ).toBeVisible();
    });
    test("logs in with new account", async ({ page }) => {
      // THEN
      await page.goto("/auth/signin");
      await signIn(page, email, password);

      // ASSERT that user is redirected to onboarding
      await expect(page.getByText("Dashboard")).not.toBeVisible();
      await expect(page.getByText("What is Panthora?")).toBeVisible();
    });
    test("completes onboarding", async ({ page }) => {
      // WHEN
      await page.goto("/auth/signin");
      await signIn(page, email, password);

      // THEN Step 1
      const next = page.getByRole("button", { name: "Next" });
      await expect(next).toBeVisible();
      await next.click();

      // THEN Step 2
      const teamName = faker.word.noun();
      const teamNameField = page.getByLabel("Name");
      await expect(teamNameField).toBeVisible();
      await teamNameField.fill(teamName);

      const complete = page.getByRole("button", { name: "Create" });
      await expect(complete).toBeVisible();
      await complete.click();

      // ASSERT that user is redirected to dashboard
      await expect(page.getByText(email)).toBeVisible();
      await expect(page.getByRole("combobox")).toHaveText(teamName);
      await expect(page.getByText("Team created successfully")).toBeVisible();
      await expect(page).toHaveURL(/.*\/dashboard/);
    });
  });
});
