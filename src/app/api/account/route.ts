import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AccountRepo } from "@/lib/db";

// GET /api/account - Restituisce account digitali e gruppi WhatsApp
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria") {
      return NextResponse.json({ error: "Accesso non autorizzato per il tuo profilo" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope"); // "accounts" | "whatsapp" | null

    if (scope === "accounts") {
      const accounts = await AccountRepo.getAccounts();
      return NextResponse.json({ success: true, data: accounts });
    }

    if (scope === "whatsapp") {
      const gruppi = await AccountRepo.getGruppiWhatsApp();
      return NextResponse.json({ success: true, data: gruppi });
    }

    const [accounts, gruppi] = await Promise.all([
      AccountRepo.getAccounts(),
      AccountRepo.getGruppiWhatsApp(),
    ]);

    return NextResponse.json({
      success: true,
      data: { accounts, gruppiWhatsApp: gruppi },
    });
  } catch (error) {
    console.error("GET /api/account error:", error);
    return NextResponse.json({ error: "Errore caricamento account o gruppi" }, { status: 500 });
  }
}

// POST /api/account - Salva o aggiorna un account digitale o un gruppo WhatsApp
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria") {
      return NextResponse.json({ error: "Accesso non autorizzato per il tuo profilo" }, { status: 403 });
    }

    const body = await req.json();
    const type = body.type; // "account" | "whatsapp"

    if (type === "account") {
      if (!body.servizio) {
        return NextResponse.json({ error: "Nome servizio obbligatorio" }, { status: 400 });
      }
      const saved = await AccountRepo.saveAccount(body);
      return NextResponse.json({ success: true, data: saved, message: "Account salvato" });
    }

    if (type === "whatsapp") {
      if (!body.nome) {
        return NextResponse.json({ error: "Nome gruppo WhatsApp obbligatorio" }, { status: 400 });
      }
      const saved = await AccountRepo.saveGruppoWhatsApp(body);
      return NextResponse.json({ success: true, data: saved, message: "Gruppo WhatsApp salvato" });
    }

    return NextResponse.json({ error: "Tipo specificato non valido" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/account error:", error);
    return NextResponse.json({ error: "Errore salvataggio dati account/canali" }, { status: 500 });
  }
}

// DELETE /api/account - Elimina un account o un gruppo
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria") {
      return NextResponse.json({ error: "Accesso non autorizzato per il tuo profilo" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // "account" | "whatsapp"

    if (!id || !type) {
      return NextResponse.json({ error: "ID e tipo mancanti" }, { status: 400 });
    }

    if (type === "account") {
      await AccountRepo.deleteAccount(id);
      return NextResponse.json({ success: true, message: "Account eliminato" });
    }

    if (type === "whatsapp") {
      await AccountRepo.deleteGruppoWhatsApp(id);
      return NextResponse.json({ success: true, message: "Gruppo WhatsApp eliminato" });
    }

    return NextResponse.json({ error: "Tipo non valido" }, { status: 400 });
  } catch (error) {
    console.error("DELETE /api/account error:", error);
    return NextResponse.json({ error: "Errore eliminazione record" }, { status: 500 });
  }
}
