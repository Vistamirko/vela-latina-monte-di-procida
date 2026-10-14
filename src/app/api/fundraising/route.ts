import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { FundraisingRepo } from "@/lib/db";

// GET /api/fundraising - Restituisce tutte le iniziative di fundraising
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria") {
      return NextResponse.json({ error: "Accesso riservato alla gestione operativa" }, { status: 403 });
    }

    const items = await FundraisingRepo.getAll();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("GET /api/fundraising error:", error);
    return NextResponse.json({ error: "Errore caricamento fundraising" }, { status: 500 });
  }
}

// POST /api/fundraising - Salva o aggiorna un'iniziativa di raccolta fondi / bando
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria") {
      return NextResponse.json({ error: "Operazione riservata alla gestione operativa" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.progetto) {
      return NextResponse.json({ error: "Nome progetto obbligatorio" }, { status: 400 });
    }

    const saved = await FundraisingRepo.save(body);
    return NextResponse.json({ success: true, data: saved, message: "Iniziativa fundraising salvata" });
  } catch (error) {
    console.error("POST /api/fundraising error:", error);
    return NextResponse.json({ error: "Errore salvataggio fundraising" }, { status: 500 });
  }
}

// DELETE /api/fundraising - Elimina un'iniziativa
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria") {
      return NextResponse.json({ error: "Operazione riservata alla gestione operativa" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }

    await FundraisingRepo.delete(id);
    return NextResponse.json({ success: true, message: "Iniziativa eliminata con successo" });
  } catch (error) {
    console.error("DELETE /api/fundraising error:", error);
    return NextResponse.json({ error: "Errore eliminazione record" }, { status: 500 });
  }
}
