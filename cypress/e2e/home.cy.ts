describe("Homepage & Navigazione", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("carica la home page con successo e mostra l'Header", () => {
    cy.get("header").should("be.visible");
    cy.contains("Vela Latina").should("be.visible");
    cy.contains("Monte di Procida").should("be.visible");
  });

  it("mostra il pulsante 'Diventa Socio' e reindirizza alla pagina dedicata", () => {
    // Il pulsante Diventa Socio deve essere visibile nell'header
    cy.get("header").contains("Diventa Socio").should("be.visible").click();

    // L'URL deve cambiare a /diventa-socio
    cy.url().should("include", "/diventa-socio");

    // La pagina deve contenere il titolo dell'adesione
    cy.contains("Diventa Socio oggi").should("be.visible");
  });
});
