import nodemailer from "nodemailer";

export interface BookingNotificationData {
  type: "corso" | "tesseramento";
  name: string;
  email: string;
  phone?: string;
  itemTitle: string;
  experience?: string;
  message?: string;
  createdAt: string;
}

interface SendEmailParams {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  tag: string;
}

/**
 * Helper interno per inviare email con prioritizzazione:
 * 1. Resend API
 * 2. Fallback SMTP (Gmail)
 */
async function sendEmailMessage({ to, replyTo, subject, html, tag }: SendEmailParams) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, "") : undefined;
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const from =
    process.env.SMTP_FROM ||
    (resendApiKey
      ? "Vela Latina <onboarding@resend.dev>"
      : `"Vela Latina Monte di Procida" <${user || "vistamirko@gmail.com"}>`);

  // 1. Invio prioritario via RESEND REST API
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: replyTo,
          subject,
          html,
        }),
      });

      const resendData = await res.json();
      if (res.ok) {
        console.log(`[RESEND ${tag}] Inviata con successo a ${to}: ${resendData.id}`);
        return { sent: true, provider: "resend", messageId: resendData.id };
      }

      console.warn(`[RESEND ${tag} NOTICE] API ha risposto con errore:`, resendData.message || resendData);
      // Prosegui al fallback SMTP
    } catch (err: any) {
      console.warn(`[RESEND ${tag} ERROR]`, err.message);
      // Prosegui al fallback SMTP
    }
  }

  // 2. Invio fallback via SMTP (es. Gmail)
  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from: `"Vela Latina Monte di Procida" <${user}>`,
        to,
        replyTo,
        subject,
        html,
      });

      console.log(`[SMTP ${tag}] Inviata con successo a ${to}: ${info.messageId}`);
      return { sent: true, provider: "smtp", messageId: info.messageId };
    } catch (err: any) {
      console.error(`[SMTP ${tag} ERROR]`, err);
      return { sent: false, error: err.message };
    }
  }

  console.warn(`[EMAIL ${tag}] Nessun provider email attivo o entrambi hanno fallito.`);
  return {
    sent: false,
    reason: "EMAIL_NOT_CONFIGURED_OR_FAILED",
  };
}

/**
 * Notifica per la Segreteria / Admin
 */
export async function sendBookingNotification(data: BookingNotificationData) {
  const notificationRecipient = process.env.NOTIFICATION_EMAIL || "vistamirko@gmail.com";
  const isCorso = data.type === "corso";
  const subjectPrefix = isCorso ? "⛵ Nuova Iscrizione Corso" : "🏛️ Nuova Richiesta Tesseramento Socio";
  const subject = `${subjectPrefix}: ${data.name} — ${data.itemTitle}`;

  const cleanPhone = data.phone ? data.phone.replace(/[^0-9+]/g, "") : "";
  const waLink = cleanPhone
    ? `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(
        `Buongiorno ${data.name}, ti contatto dall'Associazione Vela Latina Monte di Procida in merito alla tua richiesta per "${data.itemTitle}".`
      )}`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbfaf6; color: #0a1c2a; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0a1c2a; color: #ffffff; padding: 24px; text-align: center; border-bottom: 3px solid #c99a45; }
    .header h1 { margin: 0; font-size: 17px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; color: #ffffff; }
    .header p { margin: 6px 0 0; font-size: 11px; opacity: 0.85; letter-spacing: 1px; color: #e2e8f0; }
    .body { padding: 28px; }
    .row { display: flex; border-bottom: 1px solid #f1f5f9; padding: 10px 0; font-size: 13px; }
    .label { width: 140px; font-weight: 600; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { flex: 1; color: #0a1c2a; }
    .note-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #1b5b80; padding: 12px 16px; margin-top: 16px; font-size: 13px; font-style: italic; color: #334155; }
    .actions { margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; gap: 12px; }
    .btn { display: inline-block; padding: 10px 18px; font-size: 11px; text-decoration: none; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; border-radius: 4px; }
    .btn-primary { background: #0a1c2a; color: #ffffff !important; }
    .btn-wa { background: #25D366; color: #ffffff !important; }
    .footer { padding: 16px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Associazione Vela Latina Monte di Procida</h1>
      <p>Notifica Segreteria · ${isCorso ? "Scuola di Mare" : "Adesione Socio"}</p>
    </div>
    <div class="body">
      <h2 style="font-size: 16px; margin: 0 0 16px; color: #0a1c2a;">
        Ricevuta nuova richiesta da <strong>${data.name}</strong>
      </h2>

      <div class="row">
        <div class="label">Tipologia</div>
        <div class="value"><strong>${isCorso ? "Iscrizione Corso di Mare" : "Domanda Tesseramento Socio"}</strong></div>
      </div>
      <div class="row">
        <div class="label">${isCorso ? "Corso Scelto" : "Categoria Socio"}</div>
        <div class="value" style="color: #1b5b80; font-weight: bold;">${data.itemTitle}</div>
      </div>
      <div class="row">
        <div class="label">Nominativo</div>
        <div class="value">${data.name}</div>
      </div>
      <div class="row">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
      </div>
      ${
        data.phone
          ? `
      <div class="row">
        <div class="label">Telefono</div>
        <div class="value"><a href="tel:${data.phone}">${data.phone}</a></div>
      </div>`
          : ""
      }
      ${
        data.experience
          ? `
      <div class="row">
        <div class="label">Esperienza</div>
        <div class="value">${data.experience}</div>
      </div>`
          : ""
      }
      <div class="row">
        <div class="label">Data Invio</div>
        <div class="value">${new Date(data.createdAt).toLocaleString("it-IT", { timeZone: "Europe/Rome" })}</div>
      </div>

      ${
        data.message
          ? `
      <div style="margin-top: 16px;">
        <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #64748b;">Messaggio / Note:</span>
        <div class="note-box">${data.message}</div>
      </div>`
          : ""
      }

      <div class="actions">
        ${
          waLink
            ? `<a href="${waLink}" class="btn btn-wa" target="_blank">Apri Chat WhatsApp</a>`
            : ""
        }
        <a href="mailto:${data.email}?subject=${encodeURIComponent(
          `Vela Latina Monte di Procida — Riscontro richiesta ${data.itemTitle}`
        )}" class="btn btn-primary">Rispondi via Email</a>
      </div>
    </div>
    <div class="footer">
      Questa notifica è stata generata automaticamente dal portale velalatinamontediprocida.it
    </div>
  </div>
</body>
</html>
  `;

  return sendEmailMessage({
    to: notificationRecipient,
    replyTo: data.email,
    subject,
    html,
    tag: "ADMIN_NOTIFICATION",
  });
}

/**
 * Ricevuta / Mail di riepilogo inviata all'utente che si è registrato
 */
export async function sendUserConfirmation(data: BookingNotificationData & { dataLuogoNascita?: string; codiceFiscale?: string }) {
  const isCorso = data.type === "corso";
  const subject = isCorso
    ? `Conferma ricezione richiesta: ${data.itemTitle} | Vela Latina Monte di Procida`
    : `Domanda di Tesseramento Ricevuta (In attesa di pagamento) | Vela Latina Monte di Procida`;

  const formattedDate = new Date(data.createdAt).toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const ibanCode = process.env.ASSOCIATION_IBAN || "IBAN in fase di aggiornamento segreteria (rispondi alla mail per riceverlo)";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbfaf6; color: #0a1c2a; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background: #0a1c2a; color: #ffffff; padding: 32px 24px; text-align: center; border-bottom: 3px solid #c99a45; }
    .header-logo { font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: #c99a45; font-weight: 700; margin-bottom: 8px; }
    .header h1 { margin: 0; font-size: 20px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; color: #ffffff; }
    .header p { margin: 8px 0 0; font-size: 12px; opacity: 0.85; letter-spacing: 1px; color: #cbd5e1; }
    .body { padding: 32px 28px; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
    .badge-pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .badge-ok { background: #e0f2fe; color: #0369a1; }
    .greeting { font-size: 18px; font-weight: 600; color: #0a1c2a; margin: 0 0 12px 0; }
    .intro { font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px; }
    .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px 20px; margin-bottom: 24px; }
    .summary-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #64748b; margin-bottom: 12px; }
    .summary-row { display: flex; padding: 8px 0; border-bottom: 1px solid #edf2f7; font-size: 13px; }
    .summary-row:last-child { border-bottom: none; }
    .summary-label { width: 140px; color: #64748b; font-weight: 500; font-size: 12px; }
    .summary-value { flex: 1; color: #0a1c2a; font-weight: 600; }
    
    .payment-box { background: #fffbeb; border: 1px solid #fcd34d; border-left: 4px solid #b45309; border-radius: 6px; padding: 18px 20px; margin-bottom: 24px; }
    .payment-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #92400e; margin-bottom: 12px; }
    .payment-item { margin-bottom: 8px; font-size: 13px; color: #78350f; }
    .payment-item strong { color: #0a1c2a; }
    .iban-code { font-family: monospace; font-size: 13px; font-weight: bold; background: #ffffff; padding: 6px 10px; border: 1px dashed #d97706; display: inline-block; margin-top: 4px; border-radius: 4px; color: #0a1c2a; }

    .steps-box { background: #fdfcf7; border: 1px solid #e7dfc6; border-radius: 6px; padding: 20px; margin-bottom: 24px; }
    .steps-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #854d0e; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
    .step-item { font-size: 13px; line-height: 1.5; color: #451a03; margin-bottom: 10px; }
    .step-item:last-child { margin-bottom: 0; }
    .step-number { font-weight: 700; color: #b45309; }
    .cta-area { text-align: center; padding: 20px 0 10px; }
    .btn-site { display: inline-block; background: #0a1c2a; color: #ffffff !important; padding: 12px 24px; border-radius: 4px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; }
    .signoff { font-size: 13px; color: #334155; margin-top: 24px; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; }
    .footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="header-logo">Vela Latina Monte di Procida APS</div>
      <h1>${isCorso ? "Scuola di Mare & Marineria Tradizionale" : "Domanda di Tesseramento Socio"}</h1>
      <p>Porticciolo di Acquamorta · Campi Flegrei</p>
    </div>
    <div class="body">
      <span class="badge ${isCorso ? "badge-ok" : "badge-pending"}">
        ${isCorso ? "✓ Richiesta Ricevuta" : "⏳ In Attesa di Pagamento Quota"}
      </span>
      <h2 class="greeting">Gentile ${data.name},</h2>
      <p class="intro">
        ${
          isCorso
            ? `Abbiamo registrato con successo la tua richiesta di partecipazione per <strong>"${data.itemTitle}"</strong>. Grazie per l'interesse dimostrato verso la nostra associazione!`
            : `Abbiamo ricevuto la tua domanda di tesseramento come <strong>"${data.itemTitle}"</strong> per l'Associazione Vela Latina Monte di Procida APS. Come previsto dallo statuto, l'iscrizione formale al <strong>Libro Soci Ufficiale</strong> e l'assegnazione del <strong>Numero di Tessera</strong> si perfezionano a seguito del versamento della quota associativa.`
        }
      </p>

      ${
        !isCorso
          ? `
      <div class="payment-box">
        <div class="payment-title">💳 Istruzioni per il Versamento della Quota Sociale</div>
        <div class="payment-item"><strong>Beneficiario:</strong> Associazione Vela Latina Monte di Procida APS</div>
        <div class="payment-item"><strong>Quota associativa annuale:</strong> € 50,00</div>
        <div class="payment-item"><strong>Causale:</strong> Quota Sociale 2026 - ${data.name}</div>
        <div class="payment-item"><strong>Coordinate IBAN:</strong><br>
          <span class="iban-code">${ibanCode}</span>
        </div>
        <div style="margin-top: 10px; font-size: 12px; color: #78350f; font-style: italic;">
          Nota: Se preferisci, puoi effettuare il versamento anche in contanti direttamente presso il porticciolo di Acquamorta concordando l'orario con la segreteria.
        </div>
      </div>`
          : ""
      }

      <div class="summary-card">
        <div class="summary-title">Riepilogo dei dettagli inseriti</div>
        <div class="summary-row">
          <div class="summary-label">Attività / Voce</div>
          <div class="summary-value" style="color: #1b5b80;">${data.itemTitle}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Tipologia</div>
          <div class="summary-value">${isCorso ? "Corso di Vela Tradizionale" : "Tesseramento Socio"}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Nome e Cognome</div>
          <div class="summary-value">${data.name}</div>
        </div>
        ${
          data.dataLuogoNascita
            ? `
        <div class="summary-row">
          <div class="summary-label">Nascita</div>
          <div class="summary-value">${data.dataLuogoNascita}</div>
        </div>`
            : ""
        }
        <div class="summary-row">
          <div class="summary-label">Email</div>
          <div class="summary-value">${data.email}</div>
        </div>
        ${
          data.phone
            ? `
        <div class="summary-row">
          <div class="summary-label">Telefono</div>
          <div class="summary-value">${data.phone}</div>
        </div>`
            : ""
        }
        <div class="summary-row">
          <div class="summary-label">Data registrazione</div>
          <div class="summary-value">${formattedDate}</div>
        </div>
        ${
          data.message
            ? `
        <div class="summary-row" style="flex-direction: column; gap: 4px; padding-top: 10px;">
          <div class="summary-label">Messaggio / Note:</div>
          <div style="font-size: 12px; color: #475569; font-style: italic; background: #ffffff; padding: 8px 12px; border-radius: 4px; border: 1px solid #e2e8f0; margin-top: 4px;">
            ${data.message}
          </div>
        </div>`
            : ""
        }
      </div>

      <div class="steps-box">
        <div class="steps-title">🧭 Cosa succede adesso?</div>
        ${
          isCorso
            ? `
        <div class="step-item"><span class="step-number">1. Verifica e Calendario:</span> I nostri istruttori verificano disponibilità e calendario.</div>
        <div class="step-item"><span class="step-number">2. Contatto Diretto:</span> Ti ricontatteremo via email o WhatsApp per definire le uscite.</div>
        <div class="step-item"><span class="step-number">3. Domande?</span> Puoi rispondere direttamente a questa email.</div>`
            : `
        <div class="step-item"><span class="step-number">1. Esecuzione Pagamento:</span> Esegui il bonifico con la causale indicata sopra o salda in sede.</div>
        <div class="step-item"><span class="step-number">2. Convalida Segreteria:</span> La segreteria riscontra l'avvenuto accredito bancario o contante.</div>
        <div class="step-item"><span class="step-number">3. Emissione Tessera:</span> Riceverai una mail di conferma con l'attribuzione del tuo Numero di Tessera ufficiale e l'iscrizione nel Libro Soci 2026.</div>`
        }
      </div>

      <div class="cta-area">
        <a href="https://velalatinamontediprocida.it" class="btn-site" target="_blank">Esplora il nostro portale</a>
      </div>

      <div class="signoff">
        Buon Vento,<br>
        <strong>Il Consiglio Direttivo</strong><br>
        <em>Associazione Vela Latina Monte di Procida APS</em>
      </div>
    </div>

    <div class="footer">
      Associazione Vela Latina Monte di Procida APS · C.F. 96024970634<br>
      Porticciolo di Acquamorta, 80070 Monte di Procida (NA)<br>
      Email di contatto: <a href="mailto:vistamirko@gmail.com" style="color: #64748b;">vistamirko@gmail.com</a> · <a href="https://velalatinamontediprocida.it" style="color: #64748b;">velalatinamontediprocida.it</a>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmailMessage({
    to: data.email,
    replyTo: "vistamirko@gmail.com",
    subject,
    html,
    tag: "USER_CONFIRMATION",
  });
}

/**
 * Notifica di Benvenuto e Approvazione Tessera Socio a pagamento avvenuto
 */
export async function sendMembershipApprovedNotification(params: {
  nome: string;
  email: string;
  anno: number;
  numeroTessera?: string | number;
  tipologia?: string;
  metodoPagamento?: string;
  importo?: number | string;
}) {
  const subject = `🎉 Benvenuto/a nel Libro Soci! Tessera #${params.numeroTessera || ""} (${params.anno}) | Vela Latina Monte di Procida`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbfaf6; color: #0a1c2a; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background: #0a1c2a; color: #ffffff; padding: 32px 24px; text-align: center; border-bottom: 3px solid #c99a45; }
    .header-logo { font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: #c99a45; font-weight: 700; margin-bottom: 8px; }
    .header h1 { margin: 0; font-size: 20px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; color: #ffffff; }
    .body { padding: 32px 28px; }
    .badge-success { display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
    .tessera-card { background: linear-gradient(135deg, #0a1c2a 0%, #1b5b80 100%); color: #ffffff; border-radius: 8px; padding: 24px; margin: 20px 0; border: 1px solid #c99a45; text-align: center; box-shadow: 0 4px 10px rgba(10,28,42,0.15); }
    .tessera-num { font-size: 36px; font-weight: 700; color: #c99a45; letter-spacing: 2px; margin: 8px 0; font-family: monospace; }
    .tessera-name { font-size: 18px; font-weight: 600; color: #ffffff; letter-spacing: 1px; }
    .tessera-sub { font-size: 12px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1.5px; }
    .info-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
    .info-table td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .info-label { color: #64748b; font-weight: 500; width: 45%; }
    .info-val { color: #0a1c2a; font-weight: 600; }
    .footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="header-logo">Vela Latina Monte di Procida APS</div>
      <h1>Tessera Socio Ufficiale</h1>
      <p>Anno Sociale ${params.anno}</p>
    </div>
    <div class="body">
      <span class="badge-success">✓ Pagamento Confermato & Iscritto</span>
      <h2 style="font-size: 20px; margin: 0 0 12px 0;">Benvenuto/a a bordo, ${params.nome}!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Con grande piacere ti comunichiamo che il pagamento della tua quota associativa è stato registrato con successo. Sei ufficialmente iscritto/a al <strong>Libro Soci dell'Associazione Vela Latina Monte di Procida</strong> per l'anno sociale <strong>${params.anno}</strong>.
      </p>

      <div class="tessera-card">
        <div class="tessera-sub">Tessera Socio Ordinario · Anno ${params.anno}</div>
        <div class="tessera-num">#${params.numeroTessera || "---"}</div>
        <div class="tessera-name">${params.nome}</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">Porticciolo di Acquamorta · Campi Flegrei</div>
      </div>

      <table class="info-table">
        <tr>
          <td class="info-label">Numero Tessera</td>
          <td class="info-val">#${params.numeroTessera || "Assegnata"}</td>
        </tr>
        <tr>
          <td class="info-label">Anno Sociale</td>
          <td class="info-val">${params.anno}</td>
        </tr>
        <tr>
          <td class="info-label">Qualifica Socio</td>
          <td class="info-val">${params.tipologia || "Socio Ordinario"}</td>
        </tr>
        <tr>
          <td class="info-label">Metodo Pagamento Registrato</td>
          <td class="info-val">${params.metodoPagamento === "bonifico" ? "Bonifico Bancario" : (params.metodoPagamento === "contanti" ? "Contanti in sede" : "Registrato")}</td>
        </tr>
      </table>

      <div style="background: #fdfcf7; border: 1px solid #e7dfc6; border-radius: 6px; padding: 18px; margin-top: 24px; font-size: 13px; line-height: 1.6; color: #451a03;">
        <strong>⚓ Cosa puoi fare adesso come socio:</strong>
        <ul style="margin: 8px 0 0; padding-left: 20px;">
          <li>Partecipare a tutti gli eventi, iniziative culturali, uscite in mare e attività di voga.</li>
          <li>Frequentare le attività di cantiere e navigazione a bordo dei gozzi della flotta (Janara, San Michele Arcangelo, Quandel).</li>
          <li>Contribuire alla salvaguardia dell'arte marinaresca tradizionale flegrea.</li>
        </ul>
      </div>

      <div style="margin-top: 24px; font-size: 13px; color: #334155; line-height: 1.5;">
        Buon Vento e ci vediamo presto in banchina ad Acquamorta!<br>
        <strong>Il Consiglio Direttivo</strong><br>
        <em>Associazione Vela Latina Monte di Procida APS</em>
      </div>
    </div>
    <div class="footer">
      Associazione Vela Latina Monte di Procida APS · C.F. 96024970634<br>
      Porticciolo di Acquamorta, 80070 Monte di Procida (NA)
    </div>
  </div>
</body>
</html>
  `;

  return sendEmailMessage({
    to: params.email,
    replyTo: "vistamirko@gmail.com",
    subject,
    html,
    tag: "MEMBERSHIP_APPROVED",
  });
}

