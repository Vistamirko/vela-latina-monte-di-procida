import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { BarcheRepo, ManutenzioniRepo } from "@/lib/db";

// GET /api/barche - Restituisce la lista barche e le relative manutenzioni
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria" && user.role !== "istruttore") {
      return NextResponse.json({ error: "Accesso non autorizzato per il tuo profilo" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope"); // "barche" | "manutenzioni" | null (entrambi)

    if (scope === "barche") {
      const barche = await BarcheRepo.getAll();
      return NextResponse.json({ success: true, data: barche });
    }

    if (scope === "manutenzioni") {
      const manutenzioni = await ManutenzioniRepo.getAll();
      return NextResponse.json({ success: true, data: manutenzioni });
    }

    const [barche, manutenzioni] = await Promise.all([
      BarcheRepo.getAll(),
      ManutenzioniRepo.getAll(),
    ]);

    return NextResponse.json({
      success: true,
      data: { barche, manutenzioni },
    });
  } catch (error) {
    console.error("GET /api/barche error:", error);
    return NextResponse.json({ error: "Errore caricamento flotta e manutenzioni" }, { status: 500 });
  }
}

// POST /api/barche - Crea o aggiorna una barca o una manutenzione
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria" && user.role !== "istruttore") {
      return NextResponse.json({ error: "Accesso non autorizzato per il tuo profilo" }, { status: 403 });
    }

    const body = await req.json();
    const type = body.type; // "barca" | "manutenzione"

    if (type === "barca") {
      if (!body.nome) {
        return NextResponse.json({ error: "Nome barca obbligatorio" }, { status: 400 });
      }
      const saved = await BarcheRepo.save(body);
      return NextResponse.json({ success: true, data: saved, message: "Imbarcazione salvata" });
    }

    if (type === "manutenzione") {
      if (!body.barcaAttrezzatura || !body.intervento) {
        return NextResponse.json({ error: "Oggetto e intervento obbligatori" }, { status: 400 });
      }
      const saved = await ManutenzioniRepo.save(body);
      return NextResponse.json({ success: true, data: saved, message: "Intervento manutenzione salvato" });
    }

    return NextResponse.json({ error: "Tipo specificato non valido" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/barche error:", error);
    return NextResponse.json({ error: "Errore salvataggio dati" }, { status: 500 });
  }
}

// DELETE /api/barche - Elimina una barca o un intervento
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria") {
      return NextResponse.json({ error: "Solo amministratori o segreteria possono eliminare imbarcazioni o interventi" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // "barca" | "manutenzione"

    if (!id || !type) {
      return NextResponse.json({ error: "ID e tipo mancanti" }, { status: 400 });
    }

    if (type === "barca") {
      await BarcheRepo.delete(id);
      return NextResponse.json({ success: true, message: "Imbarcazione eliminata" });
    }

    if (type === "manutenzione") {
      await ManutenzioniRepo.delete(id);
      return NextResponse.json({ success: true, message: "Intervento manutenzione eliminato" });
    }

    return NextResponse.json({ error: "Tipo non valido" }, { status: 400 });
  } catch (error) {
    console.error("DELETE /api/barche error:", error);
    return NextResponse.json({ error: "Errore eliminazione record" }, { status: 500 });
  }
}
