import nodemailer from "nodemailer";

interface BookingNotificationData {
  type: "corso" | "tesseramento";
  name: string;
  email: string;
  phone?: string;
  itemTitle: string;
  experience?: string;
  message?: string;
  createdAt: string;
}

export async function sendBookingNotification(data: BookingNotificationData) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const from = process.env.SMTP_FROM || `"Vela Latina Monte di Procida" <info@velalatinamontediprocida.it>`;
  const notificationRecipient = process.env.NOTIFICATION_EMAIL || "vistamirko@gmail.com";

  if (!host || !user || !pass) {
    console.warn(
      `[EMAIL NOTIFICATION] SMTP non configurato. Nuova richiesta salvata nel Database per ${data.name} (${data.email}) - ${data.itemTitle}.`
    );
    return {
      sent: false,
      reason: "SMTP_NOT_CONFIGURED",
      info: "Dati salvati con successo nel database e visibili nel pannello admin.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

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
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; }
    .header { background: #0a1c2a; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 18px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }
    .header p { margin: 6px 0 0; font-size: 11px; opacity: 0.8; letter-spacing: 1px; }
    .body { padding: 28px; }
    .row { display: flex; border-bottom: 1px solid #f1f5f9; padding: 10px 0; font-size: 13px; }
    .label { width: 140px; font-weight: 600; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { flex: 1; color: #0a1c2a; }
    .note-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #1b5b80; padding: 12px 16px; margin-top: 16px; font-size: 13px; font-style: italic; }
    .actions { margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; gap: 12px; }
    .btn { display: inline-block; padding: 10px 18px; font-size: 11px; text-decoration: none; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; border-radius: 2px; }
    .btn-primary { background: #0a1c2a; color: #ffffff; }
    .btn-wa { background: #25D366; color: #ffffff; }
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
        <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #64748b;">Messaggio / Disponibilità:</span>
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

    const info = await transporter.sendMail({
      from,
      to: notificationRecipient,
      replyTo: data.email,
      subject,
      html,
    });

    console.log(`[EMAIL NOTIFICATION] Inviata con successo a ${notificationRecipient}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[EMAIL NOTIFICATION ERROR]`, err);
    return { sent: false, error: err.message };
  }
}
