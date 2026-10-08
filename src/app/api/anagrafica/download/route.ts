import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AnagraficaRepo } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Accesso riservato agli amministratori.", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const docKey = searchParams.get("doc");
    const anagrafica = await AnagraficaRepo.get();

    if (!docKey) {
      return new NextResponse("Specificare il parametro documento (?doc=...)", { status: 400 });
    }

    // Generatore di template stampabili / scaricabili per i documenti di conformità
    let title = "Documento Istituzionale";
    let contentHtml = "";

    switch (docKey) {
      case "presidente-ci":
        title = "Scheda Documento Identità Presidente";
        contentHtml = `
          <div class="card">
            <div class="badge">ATTESTAZIONE DI IDENTITÀ - AMMINISTRAZIONE</div>
            <h2>Scheda Riconoscimento Legale Rappresentante</h2>
            <div class="field-grid">
              <div class="field"><label>Cognome e Nome</label><div class="val font-bold">${anagrafica.presidente.nomeCompleto}</div></div>
              <div class="field"><label>Carica Associativa</label><div class="val">${anagrafica.presidente.ruolo}</div></div>
              <div class="field"><label>Codice Fiscale</label><div class="val font-mono">${anagrafica.presidente.codiceFiscale}</div></div>
              <div class="field"><label>Data e Luogo di Nascita</label><div class="val">${anagrafica.presidente.dataNascita} a ${anagrafica.presidente.luogoNascita}</div></div>
              <div class="field"><label>Cittadinanza</label><div class="val">${anagrafica.presidente.cittadinanza}</div></div>
              <div class="field"><label>Residenza Ufficiale</label><div class="val">${anagrafica.presidente.residenza}</div></div>
              <div class="field"><label>Qualifica Professionale</label><div class="val">${anagrafica.presidente.qualificaProfessionale}</div></div>
              <div class="field"><label>Recapito Telefonico</label><div class="val font-mono">${anagrafica.presidente.telefono}</div></div>
              <div class="field"><label>Email Istituzionale</label><div class="val font-mono">${anagrafica.presidente.email}</div></div>
            </div>

            <div class="sub-section">
              <h3>Dati Documento di Riconoscimento (CIE)</h3>
              <div class="field-grid">
                <div class="field"><label>Tipologia Documento</label><div class="val">${anagrafica.presidente.documentoIdentita.tipo}</div></div>
                <div class="field"><label>Numero Documento</label><div class="val font-mono font-bold">${anagrafica.presidente.documentoIdentita.numero}</div></div>
                <div class="field"><label>Rilasciato Da</label><div class="val">${anagrafica.presidente.documentoIdentita.rilasciatoDa}</div></div>
                <div class="field"><label>Data di Rilascio</label><div class="val">${anagrafica.presidente.documentoIdentita.dataRilascio}</div></div>
                <div class="field"><label>Data di Scadenza</label><div class="val text-emerald-800 font-bold">${anagrafica.presidente.documentoIdentita.dataScadenza} (In Corso di Validità)</div></div>
              </div>
            </div>

            <div class="legal-notice">
              Il presente estratto anagrafico e documentale viene rilasciato a uso interno dell'Associazione Vela Latina Monte di Procida APS, per le procedure di iscrizione e aggiornamento al Registro Unico Nazionale del Terzo Settore (RUNTS), istanze di concessione banchina demaniale marittima, e adempimenti bancari o con la Pubblica Amministrazione.
            </div>
          </div>
        `;
        break;

      case "presidente-cf":
        title = "Attestazione Codice Fiscale Presidente";
        contentHtml = `
          <div class="card">
            <div class="badge">CODICE FISCALE & DATI TRIBUTARI</div>
            <h2>Dati Fiscali del Legale Rappresentante</h2>
            <div class="field-grid">
              <div class="field"><label>Intestatario</label><div class="val font-bold">${anagrafica.presidente.nomeCompleto}</div></div>
              <div class="field"><label>Codice Fiscale</label><div class="val font-mono text-xl font-bold tracking-widest text-[#0a1c2a]">${anagrafica.presidente.codiceFiscale}</div></div>
              <div class="field"><label>Data di Nascita</label><div class="val">${anagrafica.presidente.dataNascita}</div></div>
              <div class="field"><label>Comune di Nascita</label><div class="val">${anagrafica.presidente.luogoNascita}</div></div>
              <div class="field"><label>Sesso</label><div class="val">M</div></div>
              <div class="field"><label>Ente Associativo di Riferimento</label><div class="val">${anagrafica.ragioneSociale} (CF ${anagrafica.codiceFiscale})</div></div>
            </div>
            <div class="legal-notice">
              Certificato anagrafico a supporto delle istanze di erogazione contributi, registrazione atti e rendicontazioni connesse alle attività del Terzo Settore.
            </div>
          </div>
        `;
        break;

      case "verbale-nomina":
        title = "Verbale Assemblea Nomina Legale Rappresentante";
        contentHtml = `
          <div class="card">
            <div class="badge">ATTI SOCIETARI E ASSEMBLEARI</div>
            <h2>Estratto Verbale di Nomina del Consiglio Direttivo</h2>
            <p><strong>Associazione Vela Latina Monte di Procida APS</strong></p>
            <p>Sede Legale in Monte di Procida (NA), Via Guglielmo Marconi snc — CF: <code>${anagrafica.codiceFiscale}</code></p>
            <div class="body-text">
              <p>L'Assemblea dei Soci ha confermato e rinnovato l'attribuzione delle cariche sociali del Consiglio Direttivo per il triennio in corso:</p>
              <ul>
                <li><strong>Presidente e Legale Rappresentante:</strong> ${anagrafica.presidente.nomeCompleto} (con conferimento di tutti i poteri di ordinaria e straordinaria amministrazione, firma disgiunta bancaria e rappresentanza processuale);</li>
                ${anagrafica.consiglioDirettivo
                  .filter((cd) => cd.nome !== anagrafica.presidente.nomeCompleto)
                  .map((cd) => `<li><strong>${cd.ruolo}:</strong> ${cd.nome} (${cd.note || ""})</li>`)
                  .join("")}
              </ul>
              <p>La carica è attiva e pienamente efficace fino al termine del mandato statutario fissato in data <strong>${anagrafica.presidente.scadenzaMandato}</strong>.</p>
            </div>
            <div class="signature-box">
              <div>Il Segretario dell'Assemblea<br /><br /><em>Giovanni Forte</em></div>
              <div>Il Presidente e Legale Rappresentante<br /><br /><em>Antonio Pugliese</em></div>
            </div>
          </div>
        `;
        break;

      case "presidente-cv":
        title = "Curriculum Vitae Tecnico Navale - Antonio Pugliese";
        contentHtml = `
          <div class="card">
            <div class="badge">PROFILO PROFESSIONALE & MARINARO</div>
            <h2>Antonio Pugliese — Tecnico Costruttore Navale</h2>
            <p class="subtitle">Presidente e Fondatore dell'Associazione Vela Latina Monte di Procida APS</p>
            <div class="body-text">
              <h4>Competenze Principali:</h4>
              <p>Maestro d'ascia e tecnico costruttore navale con oltre 30 anni di esperienza nella progettazione, recupero e armo tradizionale di imbarcazioni in legno dei Campi Flegrei e del bacino tirrenico. Esperto nella velatura latina, armamento con antenna e calcese, alberature storiche e idrodinamica applicata ai gozzi storici.</p>
              <h4>Iniziative e Traguardi di Rilievo:</h4>
              <ul>
                <li><strong>2008:</strong> Fondazione dell'Associazione Vela Latina Monte di Procida per salvare dall'abbandono le ultime unita a vela latina flegree.</li>
                <li><strong>2020:</strong> Promotore dell'iter per il Riconoscimento della marineria flegrea quale <em>Patrimonio Culturale Immateriale della Regione Campania (D.D. n. 239/2020)</em>.</li>
                <li><strong>2024:</strong> Timoniere e armatore di <em>Janara</em>, con vittoria assoluta a Saint-Tropez (Les Voiles Latines) e vittoria alla Procida Cup 2025.</li>
                <li><strong>2026-2027:</strong> Direzione del cantiere di restauro scientifico del gozzo ottocentesco <em>Ludovico Quandel</em> e coordinamento del Progetto ROSA (equipaggio femminile).</li>
              </ul>
            </div>
          </div>
        `;
        break;

      case "runts-iscrizione":
        title = "Attestazione Iscrizione RUNTS - Registro Unico Nazionale";
        contentHtml = `
          <div class="card">
            <div class="badge">REGISTRO UNICO NAZIONALE TERZO SETTORE</div>
            <h2>Certificato di Iscrizione al RUNTS</h2>
            <div class="field-grid">
              <div class="field"><label>Denominazione Ente</label><div class="val font-bold">${anagrafica.ragioneSociale}</div></div>
              <div class="field"><label>Tipologia / Sezione</label><div class="val">${anagrafica.runts.sezione}</div></div>
              <div class="field"><label>Numero Repertorio RUNTS</label><div class="val font-mono text-lg font-bold text-[#0a1c2a]">${anagrafica.runts.numeroRepertorio}</div></div>
              <div class="field"><label>Data Provvedimento Iscrizione</label><div class="val">${anagrafica.runts.dataIscrizione}</div></div>
              <div class="field"><label>Ufficio Competente</label><div class="val">${anagrafica.runts.enteCompetente}</div></div>
              <div class="field"><label>Codice Fiscale Ente</label><div class="val font-mono font-bold">${anagrafica.codiceFiscale}</div></div>
              <div class="field"><label>Stato Ente nel Registro</label><div class="val text-emerald-800 font-bold">ATTIVO / IN REGOLA CON DEPOSITI</div></div>
              <div class="field"><label>Riconoscimento Culturale</label><div class="val">${anagrafica.runts.decretoRegionaleCampania}</div></div>
            </div>
            <div class="sub-section">
              <h3>Dati Legale Rappresentante nel RUNTS</h3>
              <p><strong>${anagrafica.presidente.nomeCompleto}</strong> (CF: <code>${anagrafica.presidente.codiceFiscale}</code>), nominato il ${anagrafica.presidente.dataNomina}.</p>
            </div>
            <div class="legal-notice">
              Attestazione generata per fini amministrativi, partecipazione ad avvisi pubblici regionali e nazionali, erogazioni del 5x1000 e convenzioni istituzionali.
            </div>
          </div>
        `;
        break;

      case "statuto-aps":
        title = "Estratto Statuto Registrato APS";
        contentHtml = `
          <div class="card">
            <div class="badge">STATUTO SOCIALE REGISTRATO</div>
            <h2>Statuto dell'Associazione di Promozione Sociale</h2>
            <p>Registrato ai sensi del Codice del Terzo Settore (D.Lgs. 3 luglio 2017, n. 117)</p>
            <div class="body-text">
              <h4>Art. 1 - Denominazione e Sede</h4>
              <p>È costituita l'Associazione di Promozione Sociale denominata "<strong>${anagrafica.ragioneSociale}</strong>". L'Associazione ha sede legale nel Comune di Monte di Procida (NA), in ${anagrafica.indirizzo}.</p>
              <h4>Art. 2 - Scopo e Attività di Interesse Generale</h4>
              <p>L'Associazione non persegue scopo di lucro e ha finalità civiche, solidaristiche e di utilità sociale, promuovendo:</p>
              <ul>
                <li>La tutela e valorizzazione del patrimonio storico, navale e marittimo flegreo e campano;</li>
                <li>Il restauro navale tradizionale e l'insegnamento dell'arte della vela latina e della voga;</li>
                <li>L'inclusione sociale, la pratica sportiva dilettantistica e l'avvicinamento dei giovani al mare;</li>
                <li>La salvaguardia del gozzo montese quale Patrimonio Culturale Immateriale della Campania.</li>
              </ul>
              <h4>Art. 18 - Rappresentanza Legale</h4>
              <p>Il Presidente del Consiglio Direttivo ha la rappresentanza legale dell'Associazione di fronte a terzi ed in giudizio, cura l'esecuzione dei deliberati dell'Assemblea e del Consiglio Direttivo.</p>
            </div>
          </div>
        `;
        break;

      case "atto-costitutivo":
        title = "Estratto Atto Costitutivo (Fondazione 2008)";
        contentHtml = `
          <div class="card">
            <div class="badge">ATTO COSTITUTIVO ORIGINARIO</div>
            <h2>Atto Costitutivo dell'Associazione Vela Latina Monte di Procida</h2>
            <div class="body-text">
              <p>In data 12 Marzo 2008, presso il Porticciolo di Monte di Procida, è stata formalmente costituita l'Associazione Vela Latina Monte di Procida, con l'obiettivo prioritario di preservare dall'estinzione le imbarcazioni in legno flegree a vela latina, riunire maestri d'ascia, marinai e appassionati e avviare la scuola di marineria storica.</p>
              <div class="field-grid">
                <div class="field"><label>Anno di Fondazione</label><div class="val font-bold">2008</div></div>
                <div class="field"><label>Sede Storica</label><div class="val">Monte di Procida (NA)</div></div>
                <div class="field"><label>Presidente Fondatore</label><div class="val">${anagrafica.presidente.nomeCompleto}</div></div>
                <div class="field"><label>Codice Fiscale</label><div class="val font-mono">${anagrafica.codiceFiscale}</div></div>
              </div>
            </div>
          </div>
        `;
        break;

      case "decreto-regione-239":
        title = "Decreto Regionale n. 239/2020 - Patrimonio Immateriale";
        contentHtml = `
          <div class="card">
            <div class="badge">REGIONE CAMPANIA - PATRIMONIO CULTURALE IMMATERIALE</div>
            <h2>Decreto Dirigenziale n. 239 del 7 Luglio 2020</h2>
            <div class="body-text">
              <p>Iscrizione nell'Inventario IPIC (Patrimonio Culturale Immateriale Campano) dell'elemento:</p>
              <blockquote style="font-style: italic; border-left: 4px solid #c99a45; padding-left: 1rem; margin: 1rem 0; color: #0a1c2a;">
                “Sapere e abilità della marineria flegrea inerenti la costruzione, manutenzione e conduzione del gozzo tradizionale a remi e a vela latina.”
              </blockquote>
              <p>Promosso e documentato dall'Associazione Vela Latina Monte di Procida quale soggetto custode e presidio permanente del sapere immateriale flegreo.</p>
            </div>
          </div>
        `;
        break;

      case "fiscale-cf":
        title = "Certificato Codice Fiscale Associazione";
        contentHtml = `
          <div class="card">
            <div class="badge">AGENZIA DELLE ENTRATE</div>
            <h2>Attribuzione Codice Fiscale Ente Non Commerciale / ETS</h2>
            <div class="field-grid">
              <div class="field"><label>Denominazione</label><div class="val font-bold">${anagrafica.ragioneSociale}</div></div>
              <div class="field"><label>Codice Fiscale</label><div class="val font-mono text-2xl font-bold text-[#0a1c2a]">${anagrafica.codiceFiscale}</div></div>
              <div class="field"><label>Natura Giuridica</label><div class="val">${anagrafica.formaGiuridica}</div></div>
              <div class="field"><label>Sede Legale</label><div class="val">${anagrafica.indirizzo}, ${anagrafica.cap} ${anagrafica.comune} (${anagrafica.provincia})</div></div>
              <div class="field"><label>Codice Destinatario SDI</label><div class="val font-mono font-bold">${anagrafica.codiceDestinatarioSdi}</div></div>
              <div class="field"><label>PEC Ufficiale</label><div class="val font-mono">${anagrafica.pec}</div></div>
              <div class="field"><label>Legale Rappresentante</label><div class="val">${anagrafica.presidente.nomeCompleto} (CF: ${anagrafica.presidente.codiceFiscale})</div></div>
            </div>
          </div>
        `;
        break;

      case "banca-iban":
        title = "Scheda Coordinate Bancarie & Bonifici Ufficiali";
        contentHtml = `
          <div class="card">
            <div class="badge">TESORERIA & COORDINATE BANCARIE</div>
            <h2>Coordinate Bancarie Ufficiali per Accrediti e Contributi</h2>
            <div class="field-grid">
              <div class="field"><label>Istituto Bancario</label><div class="val font-bold">${anagrafica.banca.istituto}</div></div>
              <div class="field"><label>Filiale</label><div class="val">${anagrafica.banca.filiale}</div></div>
              <div class="field"><label>Intestazione Conto</label><div class="val font-bold text-[#0a1c2a]">${anagrafica.banca.intestatario}</div></div>
              <div class="field"><label>Codice IBAN</label><div class="val font-mono text-xl font-bold tracking-wider text-emerald-900 bg-emerald-50 p-3 border border-emerald-300 rounded">${anagrafica.banca.iban}</div></div>
              <div class="field"><label>Codice BIC / SWIFT</label><div class="val font-mono font-bold">${anagrafica.banca.bicSwift}</div></div>
              <div class="field"><label>Causale Iscrizioni Soci</label><div class="val font-mono text-xs">${anagrafica.banca.causaleIscrizione}</div></div>
              <div class="field"><label>Causale Donazioni / Bandi</label><div class="val font-mono text-xs">${anagrafica.banca.causaleDonazione}</div></div>
            </div>
          </div>
        `;
        break;

      default:
        return new NextResponse("Documento non trovato o chiave non valida", { status: 404 });
    }

    const fullPageHtml = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <title>${title} | Vela Latina Monte di Procida</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0a1c2a;
      background: #fbfaf6;
      margin: 0;
      padding: 30px;
    }
    .page-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .header {
      border-bottom: 2px solid #0a1c2a;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-logo {
      font-family: Georgia, serif;
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #0a1c2a;
    }
    .header-sub {
      font-size: 10px;
      font-family: monospace;
      color: #64748b;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .header-right {
      text-align: right;
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: bold;
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      background: #f1f5f9;
      color: #0a1c2a;
      padding: 4px 10px;
      border-left: 3px solid #c99a45;
      margin-bottom: 12px;
    }
    h2 {
      margin: 0 0 16px 0;
      font-size: 22px;
      font-weight: 700;
      color: #0a1c2a;
    }
    h3 {
      font-size: 15px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 24px;
      color: #0a1c2a;
    }
    .field-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-top: 16px;
    }
    .field {
      background: #fafaf9;
      padding: 12px;
      border: 1px solid #f1f5f9;
    }
    .field label {
      display: block;
      font-size: 10px;
      text-transform: uppercase;
      font-family: monospace;
      color: #64748b;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .field .val {
      font-size: 13px;
      color: #0a1c2a;
    }
    .font-bold { font-weight: bold; }
    .font-mono { font-family: monospace; }
    .text-xl { font-size: 18px; }
    .text-2xl { font-size: 22px; }
    .body-text {
      font-size: 13px;
      line-height: 1.6;
      color: #334155;
      margin-top: 20px;
    }
    .legal-notice {
      margin-top: 30px;
      padding: 16px;
      background: #f8fafc;
      border-left: 3px solid #0a1c2a;
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
    }
    .signature-box {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      text-align: center;
      font-size: 12px;
      color: #475569;
      padding-top: 20px;
    }
    .actions {
      margin-top: 30px;
      padding: 16px;
      background: #0a1c2a;
      color: white;
      text-align: center;
      border-radius: 4px;
    }
    .print-btn {
      background: #c99a45;
      color: #0a1c2a;
      font-weight: bold;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-radius: 2px;
    }
    @media print {
      body { background: white; padding: 0; }
      .page-container { border: none; box-shadow: none; padding: 0; }
      .actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="header">
      <div>
        <div class="header-logo">Vela Latina Monte di Procida APS</div>
        <div class="header-sub">Ente del Terzo Settore · RUNTS · D.D. Regione Campania 239/2020</div>
      </div>
      <div class="header-right">
        <div>CF: ${anagrafica.codiceFiscale}</div>
        <div>Data: ${new Date().toLocaleDateString("it-IT")}</div>
      </div>
    </div>

    ${contentHtml}

    <div class="actions">
      <button class="print-btn" onclick="window.print()">🖨️ Stampa / Salva in PDF</button>
      <span style="font-size: 11px; margin-left: 12px; opacity: 0.8;">(Documento Ufficiale Area Riservata)</span>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(fullPageHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("GET /api/anagrafica/download error:", error);
    return new NextResponse("Errore durante la generazione del documento.", { status: 500 });
  }
}
