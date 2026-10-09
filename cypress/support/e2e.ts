import "./commands";

// Ignora errori di hydration non bloccanti di React/Next.js durante i test
Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("Hydration failed") ||
    err.message.includes("hydrating") ||
    err.message.includes("Minified React error")
  ) {
    return false;
  }
});

beforeEach(() => {
  cy.unlockSite();
});
