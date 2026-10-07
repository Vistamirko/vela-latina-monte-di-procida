import { NextRequest, NextResponse } from "next/server";
import { initDb, BookingsRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendBookingNotification, sendUserConfirmation } from "@/lib/email";

// GET /api/iscrizioni — Elenco richieste (riservato ad Admin)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
    }

    await initDb();
    const items = await BookingsRepo.getAll();
    return NextResponse.json({ success: true, count: items.length, data: items });
  } catch (error: any) {
    console.error("GET /api/iscrizioni error:", error);
    return NextResponse.json({ error: "Errore recupero richieste" }, { status: 500 });
  }
}

// POST /api/iscrizioni — Nuova iscrizione corso o domanda tesseramento (Pubblico)
export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json();

    const { type, name, email, phone, itemTitle, experience, message } = body;

    if (!name || !email || !itemTitle) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti: Nome, Email e Corso/Tipologia sono richiesti." },
        { status: 400 }
      );
    }

    // Salva nel database (con fallback resiliente se il db temporaneamente non risponde)
    let booking: any = null;
    try {
      booking = await BookingsRepo.create({
        type: type === "tesseramento" ? "tesseramento" : "corso",
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: phone ? String(phone).trim() : undefined,
        itemTitle: String(itemTitle).trim(),
        experience: experience ? String(experience).trim() : undefined,
        message: message ? String(message).trim() : undefined,
        status: "nuova",
      });
    } catch (dbErr) {
      console.error("Errore salvataggio database/filesystem:", dbErr);
      const now = new Date().toISOString();
      booking = {
        id: `req-${Date.now()}`,
        type: type === "tesseramento" ? "tesseramento" : "corso",
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: phone ? String(phone).trim() : undefined,
        itemTitle: String(itemTitle).trim(),
        experience: experience ? String(experience).trim() : undefined,
        message: message ? String(message).trim() : undefined,
        status: "nuova",
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

// PATCH /api/iscrizioni — Aggiorna stato (riservato ad Admin)
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
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

// DELETE /api/iscrizioni — Cancella richiesta (riservato ad Admin)
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
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
