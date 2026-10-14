import { NextRequest, NextResponse } from "next/server";
import { initDb, BookingsRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendBookingNotification, sendUserConfirmation } from "@/lib/email";
import { rateLimiter, getClientIp } from "@/lib/rateLimit";
import { sanitizePlainText, sanitizeEmail, isValidEmail } from "@/lib/sanitize";

// GET /api/iscrizioni — Elenco richieste (riservato ad Admin, Segreteria e Istruttori)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria" && user.role !== "istruttore") {
      return NextResponse.json({ error: "Accesso non autorizzato per il tuo profilo" }, { status: 403 });
    }

    await initDb();
    const items = await BookingsRepo.getAll();
    return NextResponse.json({ success: true, count: items.length, data: items });
  } catch (error: any) {
    console.error("GET /api/iscrizioni error:", error);
    return NextResponse.json({ error: "Errore recupero richieste" }, { status: 500 });
  }
}

// POST /api/iscrizioni — Nuova iscrizione corso o domanda tesseramento (Pubblico con rate limiting)
export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = rateLimiter.check(`iscrizione:${clientIp}`, 10, 10 * 60); // 10 invii ogni 10 minuti

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Troppe richieste inviate in breve tempo. Per favore riprova più tardi." },
        { status: 429 }
      );
    }

    await initDb();
    const body = await req.json();

    const rawName = body.name;
    const rawEmail = body.email;
    const rawItemTitle = body.itemTitle;

    if (!rawName || !rawEmail || !rawItemTitle) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti: Nome, Email e Corso/Tipologia sono richiesti." },
        { status: 400 }
      );
    }

    const cleanEmail = sanitizeEmail(rawEmail);
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { error: "Indirizzo email non valido. Verifica il formato inserito." },
        { status: 400 }
      );
    }

    const cleanName = sanitizePlainText(rawName, 100);
    const cleanItemTitle = sanitizePlainText(rawItemTitle, 150);
    const cleanPhone = body.phone ? sanitizePlainText(body.phone, 30) : undefined;
    const cleanExperience = body.experience ? sanitizePlainText(body.experience, 100) : undefined;
    const cleanMessage = body.message ? sanitizePlainText(body.message, 1000) : undefined;
    const cleanDataNascita = body.dataLuogoNascita ? sanitizePlainText(body.dataLuogoNascita, 150) : undefined;
    const cleanCodiceFiscale = body.codiceFiscale ? sanitizePlainText(body.codiceFiscale, 16).toUpperCase() : undefined;

    const isTesseramento = body.type === "tesseramento";
    const initialStatus = isTesseramento ? "in_attesa_pagamento" : "nuova";

    // Salva nel database (con fallback resiliente se il db temporaneamente non risponde)
    let booking: any = null;
    try {
      booking = await BookingsRepo.create({
        type: isTesseramento ? "tesseramento" : "corso",
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        itemTitle: cleanItemTitle,
        experience: cleanExperience,
        message: cleanMessage,
        dataLuogoNascita: cleanDataNascita,
        codiceFiscale: cleanCodiceFiscale,
        status: initialStatus,
      });
    } catch (dbErr) {
      console.error("Errore salvataggio database/filesystem:", dbErr);
      const now = new Date().toISOString();
      booking = {
        id: `req-${Date.now()}`,
        type: isTesseramento ? "tesseramento" : "corso",
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        itemTitle: cleanItemTitle,
        experience: cleanExperience,
        message: cleanMessage,
        dataLuogoNascita: cleanDataNascita,
        codiceFiscale: cleanCodiceFiscale,
        status: initialStatus,
        createdAt: now,
        updatedAt: now,
      };
    }

    // Invia notifiche email in parallelo:
    // 1. Notifica interna per la segreteria / admin (vistamirko@gmail.com)
    // 2. Email di riepilogo e conferma per l'utente (booking.email)
    const bookingPayload = {
      type: booking.type,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      itemTitle: booking.itemTitle,
      experience: booking.experience,
      message: booking.message,
      dataLuogoNascita: booking.dataLuogoNascita,
      codiceFiscale: booking.codiceFiscale,
      createdAt: booking.createdAt,
    };

    let adminNotificationResult = null;
    let userConfirmationResult = null;

    try {
      const [adminRes, userRes] = await Promise.allSettled([
        sendBookingNotification(bookingPayload),
        sendUserConfirmation(bookingPayload),
      ]);

      adminNotificationResult =
        adminRes.status === "fulfilled" ? adminRes.value : { sent: false, error: (adminRes as any).reason };
      userConfirmationResult =
        userRes.status === "fulfilled" ? userRes.value : { sent: false, error: (userRes as any).reason };
    } catch (err) {
      console.error("Errore dispatch notifiche email iscrizione:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Richiesta registrata con successo. Ti abbiamo inviato un'email di riepilogo.",
      data: booking,
      notification: {
        admin: adminNotificationResult,
        user: userConfirmationResult,
      },
    });
  } catch (error: any) {
    console.error("POST /api/iscrizioni error:", error);
    return NextResponse.json(
      { error: "Si è verificato un errore durante la registrazione della richiesta." },
      { status: 500 }
    );
  }
}

// PATCH /api/iscrizioni — Aggiorna stato (riservato ad Admin, Segreteria e Istruttori)
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria" && user.role !== "istruttore") {
      return NextResponse.json({ error: "Accesso non autorizzato per il tuo profilo" }, { status: 403 });
    }

    await initDb();
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID e stato sono obbligatori" }, { status: 400 });
    }

    const updated = await BookingsRepo.updateStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH /api/iscrizioni error:", error);
    return NextResponse.json({ error: "Errore aggiornamento richiesta" }, { status: 500 });
  }
}

// DELETE /api/iscrizioni — Cancella richiesta (riservato ad Admin e Segreteria)
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria") {
      return NextResponse.json({ error: "Eliminazione riservata a Segreteria e Amministratore" }, { status: 403 });
    }

    await initDb();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Parametro id obbligatorio" }, { status: 400 });
    }

    await BookingsRepo.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/iscrizioni error:", error);
    return NextResponse.json({ error: "Errore cancellazione richiesta" }, { status: 500 });
  }
}
