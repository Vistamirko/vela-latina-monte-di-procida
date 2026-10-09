describe("Pagina Diventa Socio", () => {
  beforeEach(() => {
    cy.visit("/diventa-socio");
  });

  it("mostra la quota associativa e i campi del form", () => {
    cy.contains("€ 50").should("be.visible");
    cy.contains("Libro Soci APS").should("be.visible");

    // Verifica presenza di tutti i campi obbligatori
    cy.get('input[name="nome"]').should("be.visible");
    cy.get('input[name="email"]').should("be.visible");
    cy.get('input[name="telefono"]').should("be.visible");
    cy.get('input[name="dataLuogoNascita"]').should("be.visible");
    cy.get('input[name="codiceFiscale"]').should("be.visible");
  });

  it("permette la compilazione del form di adesione", () => {
    // Intercetta la chiamata POST all'API per testare il flusso UI senza salvare dati fittizi nel DB
    cy.intercept("POST", "/api/iscrizioni", {
      statusCode: 200,
      body: { success: true },
    }).as("iscrizioneRequest");

    cy.get('input[name="nome"]').type("Mario Rossi");
    cy.get('input[name="email"]').type("mario.rossi@example.com");
    cy.get('input[name="telefono"]').type("+39 333 1234567");
    cy.get('input[name="dataLuogoNascita"]').type("01/01/1990 - Napoli");
    cy.get('input[name="codiceFiscale"]').type("RSSMRA90A01F839U");

    cy.get('button[type="submit"]').contains("Invia Domanda di Tesseramento").click();

    cy.wait("@iscrizioneRequest");

    // Deve mostrare il messaggio di avvenuta ricezione
    cy.contains("Richiesta Ricevuta con Successo").should("be.visible");
    cy.contains("Mario Rossi").should("be.visible");
  });
});
