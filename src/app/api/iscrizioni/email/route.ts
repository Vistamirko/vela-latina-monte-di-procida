import { NextRequest, NextResponse } from "next/server";
import { initDb, BookingsRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendCourseResponse, sendUserConfirmation } from "@/lib/email";

// POST /api/iscrizioni/email — Invia o reinvia email a un utente registrato (Riservato ad Admin)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
    }

    await initDb();
    const body = await req.json();
    const { bookingId, customMessage, dataLezione, luogo, updateStatus } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "ID richiesta obbligatorio" }, { status: 400 });
    }

    const booking = await BookingsRepo.getById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
    }

    if (!booking.email) {
      return NextResponse.json({ error: "L'utente non ha un indirizzo email registrato" }, { status: 400 });
    }

    let result;
    if (booking.type === "corso" || customMessage) {
      result = await sendCourseResponse({
        nome: booking.name,
        email: booking.email,
        corso: booking.itemTitle,
        messaggioPersonalizzato: customMessage,
        dataLezione,
        luogo,
      });
    } else {
      result = await sendUserConfirmation({
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
      });
    }

    if (!result.sent) {
      return NextResponse.json(
        {
          error: result.error || "Impossibile inviare l'email. Verifica le credenziali email (SMTP o Resend).",
          provider: result.provider,
        },
        { status: 500 }
      );
    }

    // Aggiorna lo stato della richiesta se richiesto
    if (updateStatus) {
      await BookingsRepo.updateStatus(bookingId, updateStatus);
    }

    return NextResponse.json({
      success: true,
      message: `Email inviata con successo a ${booking.email}`,
      provider: result.provider,
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error("POST /api/iscrizioni/email error:", error);
    return NextResponse.json(
      { error: error.message || "Errore durante l'invio dell'email" },
      { status: 500 }
    );
  }
}
