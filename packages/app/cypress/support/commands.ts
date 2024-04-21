/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import "@testing-library/cypress/add-commands";
import { z } from "zod";
import { createCaller } from "~/server/api/trpc";

Cypress.Commands.add("login", (dontSkipOnboarding: true | undefined) => {
  cy.request("GET", "/api/auth/csrf").then((csrfResponse) => {
    const { csrfToken } = z
      .object({
        csrfToken: z.string(),
      })
      .parse(csrfResponse.body);
    cy.request({
      method: "POST",
      url: "/api/auth/callback/password",
      form: true,
      body: {
        email: "test@test.com",
        password: "test@test.com",
        csrfToken,
        json: true,
        redirect: false,
        callbackUrl: "/",
      },
    }).then((response) => {
      console.log("Response", response);
      const cookiesRaw = response.headers["set-cookie"];
      const cookies = Array.isArray(cookiesRaw) ? cookiesRaw : [cookiesRaw];
      console.log("Cookies", cookies);
      if (cookies) {
        cookies.forEach((cookie) => {
          if (!cookie) {
            return;
          }
          const firstPart = cookie.split(";")[0];
          if (!firstPart) {
            return;
          }
          const separatorIndex = firstPart.indexOf("=");
          const name = firstPart.substring(0, separatorIndex);
          const value = firstPart.substring(separatorIndex + 1);
          console.log("Setting cookie", name, value);
          cy.setCookie(name, value);
        });
      }
      if (dontSkipOnboarding) {
        return;
      }
      cy.skipOnboarding();
    });
  });
});

Cypress.Commands.add("skipOnboarding", () => {
  const caller = createCaller();

  caller.team
    .create({
      name: "Test Team",
    })
    .then((team) => {
      console.log("Created team", team);
    })
    .catch((err) => console.error("Failed to create team", err));
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(dontSkipOnboarding?: true): Chainable<void>;
      skipOnboarding(): Chainable<void>;
    }
  }
}
