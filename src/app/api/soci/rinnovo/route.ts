import { NextRequest, NextResponse } from "next/server";
import { initDb, SociRepo, AnagraficaRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendRenewalRequestEmail } from "@/lib/email";
import { sanitizeEmail, isValidEmail, sanitizePlainText } from "@/lib/sanitize";

interface RenewalSendResult {
  socioId?: string;
  nome: string;
  email: string;
  sent: boolean;
  provider?: string;
  error?: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const maxDuration = 60;

// POST /api/soci/rinnovo — Invia mail di richiesta rinnovo (singola, multipla o di prova)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria") {
      return NextResponse.json(
        { error: "Operazione consentita solo a Segreteria e Superadmin" },
        { status: 403 }
      );
    }

    await initDb();
    const body = await req.json();

    const annoRinnovo = parseInt(String(body.annoRinnovo || new Date().getFullYear() + 1), 10);
    if (isNaN(annoRinnovo) || annoRinnovo < 2024 || annoRinnovo > 2100) {
      return NextResponse.json({ error: "Anno di rinnovo non valido" }, { status: 400 });
    }

    const quota = sanitizePlainText(body.quota || "50,00", 30) || "50,00";
    const scadenza = body.scadenza ? sanitizePlainText(body.scadenza, 100) : undefined;
    const oggettoPersonalizzato = body.oggetto ? sanitizePlainText(body.oggetto, 180) : undefined;
    const messaggioPersonalizzato =
      typeof body.messaggioPersonalizzato === "string"
        ? body.messaggioPersonalizzato.replace(/<[^>]*>/g, "").trim().slice(0, 2000) || undefined
        : undefined;

    // Recupera coordinate ufficiali dall'Anagrafica dell'Associazione
    const anagrafica = await AnagraficaRepo.get();
    const iban =
      anagrafica?.banca?.iban || process.env.ASSOCIATION_IBAN || "IT61P0306909606100000405783";
    const intestatario =
      anagrafica?.banca?.intestatario ||
      anagrafica?.ragioneSociale ||
      "Associazione Vela Latina Monte di Procida APS";
    const codiceFiscaleEnte = anagrafica?.codiceFiscale || "96035970639";

    // MODALITÀ TEST: invia una singola mail di anteprima a un indirizzo email specificato
    if (body.testEmail) {
      const cleanTestEmail = sanitizeEmail(body.testEmail);
      if (!isValidEmail(cleanTestEmail)) {
        return NextResponse.json(
          { error: "Indirizzo email di prova non valido" },
          { status: 400 }
        );
      }

      const testRes = await sendRenewalRequestEmail({
        nome: user.name || "Socio di Prova",
        email: cleanTestEmail,
        annoRinnovo,
        annoPrecedente: annoRinnovo - 1,
        numeroTessera: "00",
        quota,
        scadenza,
        iban,
        intestatario,
        codiceFiscaleEnte,
        oggettoPersonalizzato: oggettoPersonalizzato
          ? `[PROVA] ${oggettoPersonalizzato}`
          : `[PROVA] Rinnovo Tesseramento ${annoRinnovo} | Associazione Vela Latina Monte di Procida`,
        messaggioPersonalizzato,
      });

      if (!testRes.sent) {
        return NextResponse.json(
          {
            error:
              testRes.error ||
              "Impossibile inviare l'email di prova. Verifica la configurazione SMTP o Resend.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        isTest: true,
        sentCount: 1,
        failedCount: 0,
        skippedCount: 0,
        message: `Email di prova inviata con successo a ${cleanTestEmail}`,
        results: [
          {
            nome: user.name || "Socio di Prova",
            email: cleanTestEmail,
            sent: true,
            provider: testRes.provider,
          },
        ],
      });
    }

    // MODALITÀ INVIO REALE (Singolo o Multiplo)
    const rawIds: unknown[] = Array.isArray(body.socioIds) ? body.socioIds : [];
    const socioIds = rawIds.map((id) => String(id).trim()).filter(Boolean);

    if (socioIds.length === 0) {
      return NextResponse.json(
        { error: "Seleziona almeno un socio a cui inviare la richiesta di rinnovo" },
        { status: 400 }
      );
    }

    const allSoci = await SociRepo.getAll();
    const sociMap = new Map(allSoci.map((s) => [s.id, s]));

    const results: RenewalSendResult[] = [];
    const seenEmails = new Set<string>();
    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < socioIds.length; i++) {
      const socio = sociMap.get(socioIds[i]);
      if (!socio) {
        skippedCount++;
        continue;
      }

      const cleanEmail = sanitizeEmail(socio.email || "");
      if (!cleanEmail || !isValidEmail(cleanEmail)) {
        skippedCount++;
        results.push({
          socioId: socio.id,
          nome: socio.nome,
          email: socio.email || "",
          sent: false,
          error: "Indirizzo email mancante o non valido",
        });
        continue;
      }

      // Evita duplicati se lo stesso indirizzo compare in più righe selezionate
      if (seenEmails.has(cleanEmail)) {
        skippedCount++;
        continue;
      }
      seenEmails.add(cleanEmail);

      // Leggero throttle in caso di invii multipli per rispettare i limiti SMTP/Resend
      if (sentCount + failedCount > 0) {
        await delay(250);
      }

      const sendRes = await sendRenewalRequestEmail({
        nome: socio.nome,
        email: cleanEmail,
        annoRinnovo,
        annoPrecedente: socio.anno,
        numeroTessera: socio.numeroTessera,
        quota,
        scadenza,
        iban,
        intestatario,
        codiceFiscaleEnte,
        oggettoPersonalizzato,
        messaggioPersonalizzato,
      });

      if (sendRes.sent) {
        sentCount++;
        results.push({
          socioId: socio.id,
          nome: socio.nome,
          email: cleanEmail,
          sent: true,
          provider: sendRes.provider,
        });
      } else {
        failedCount++;
        results.push({
          socioId: socio.id,
          nome: socio.nome,
          email: cleanEmail,
          sent: false,
          error: sendRes.error || "Errore invio email",
        });
      }
    }

    if (sentCount === 0 && failedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            results.find((r) => r.error)?.error ||
            "Nessuna email inviata. Verifica la configurazione SMTP o Resend.",
          sentCount,
          failedCount,
          skippedCount,
          results,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      skippedCount,
      message:
        sentCount === 1
          ? `Richiesta di rinnovo ${annoRinnovo} inviata con successo a ${results.find((r) => r.sent)?.nome}.`
          : `Richiesta di rinnovo ${annoRinnovo} inviata a ${sentCount} soci${
              failedCount > 0 ? ` (${failedCount} errori)` : ""
            }${skippedCount > 0 ? ` (${skippedCount} esclusi senza email)` : ""}.`,
      results,
    });
  } catch (error: any) {
    console.error("POST /api/soci/rinnovo error:", error);
    return NextResponse.json(
      { error: error.message || "Errore durante l'invio delle richieste di rinnovo" },
      { status: 500 }
    );
  }
}
