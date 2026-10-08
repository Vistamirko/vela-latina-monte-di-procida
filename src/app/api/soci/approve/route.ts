import { NextRequest, NextResponse } from "next/server";
import { initDb, BookingsRepo, SociRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendMembershipApprovedNotification } from "@/lib/email";

// POST /api/soci/approve — Registra avvenuto pagamento e iscrive formalmente nel Libro Soci
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
    }

    await initDb();
    const body = await req.json();
    const { bookingId, anno = 2026, metodoPagamento = "bonifico", importo = 50, numeroTessera, sendEmail = true, note } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "ID richiesta obbligatorio" }, { status: 400 });
    }

    const booking = await BookingsRepo.getById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
    }

    const targetYear = parseInt(String(anno), 10) || 2026;
    const nextInfo = await SociRepo.getNextTessera(targetYear);

    const tesseraFinal = numeroTessera ? String(numeroTessera).trim() : String(nextInfo.nextTessera);
    const progressivoFinal = nextInfo.nextProgressivo;

    const quotaContanti = metodoPagamento === "contanti" ? String(importo) : undefined;
    const quotaBonifico = metodoPagamento === "bonifico" ? String(importo) : undefined;

    // 1. Salva nel Libro Soci
    const socio = await SociRepo.save({
      anno: targetYear,
      progressivo: progressivoFinal,
      nome: booking.name,
      dataLuogoNascita: booking.dataLuogoNascita || undefined,
      codiceFiscale: booking.codiceFiscale || undefined,
      numeroTessera: tesseraFinal,
      quotaContanti,
      quotaBonifico,
      socioOnorario: false,
      tipologia: booking.itemTitle || "Socio Ordinario",
      email: booking.email,
      telefono: booking.phone,
      dataIscrizione: new Date().toISOString().split("T")[0],
      metodoPagamento,
      importoPagato: Number(importo) || 50,
      note: note || (booking.message ? `Da richiesta sito: ${booking.message}` : undefined),
    });

    // 2. Aggiorna lo stato della richiesta
    await BookingsRepo.updateStatus(bookingId, "iscritto");

    // 3. Spedisci notifica email all'utente se abilitata
    let emailResult = null;
    if (sendEmail && booking.email) {
      try {
        emailResult = await sendMembershipApprovedNotification({
          nome: booking.name,
          email: booking.email,
          anno: targetYear,
          numeroTessera: tesseraFinal,
          tipologia: booking.itemTitle || "Socio Ordinario",
          metodoPagamento,
          importo,
        });
      } catch (mailErr) {
        console.error("Errore invio email conferma approvazione socio:", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Socio ${booking.name} registrato con successo nel Libro Soci ${targetYear} con tessera #${tesseraFinal}.`,
      socio,
      emailSent: emailResult?.sent || false,
    });
  } catch (error: any) {
    console.error("POST /api/soci/approve error:", error);
    return NextResponse.json({ error: "Errore durante l'approvazione del socio" }, { status: 500 });
  }
}
