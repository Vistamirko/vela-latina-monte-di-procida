/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      unlockSite(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("unlockSite", () => {
  cy.request({
    method: "POST",
    url: "/api/site-access",
    body: { password: "velalatina2026" },
    failOnStatusCode: false,
  });
});

export {};
