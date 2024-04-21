import { faker } from "@faker-js/faker";

describe("Login", () => {
  it("renderes login page", () => {
    cy.visit("/auth/signin");

    cy.findByText("Login").should("be.visible");
    cy.findByText("Create Account").should("be.visible");
  });

  it("registers new account", () => {
    const email = `${faker.person.firstName()}@panthora.io`.toLowerCase();
    const password = faker.internet.password();

    cy.visit("/auth/signin");

    cy.findByText("Create Account").click();
    cy.get("input[placeholder=E-Mail]").type(email);
    cy.get("input[placeholder=Password]").type(password);
    cy.get("input[placeholder='Password confirm']").type(password);
    cy.findByText("Create Account").click();
    cy.findByText("Registration complete! You can now login.").should(
      "be.visible"
    );
  });

  it.only("should render onboarding after login", () => {
    cy.login();

    cy.visit("/");

    cy.findByText("What is Panthora?").should("be.visible");
  });
});
