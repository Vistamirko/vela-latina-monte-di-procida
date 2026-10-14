import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PartnerRepo } from "@/lib/db";

// GET /api/partner - Restituisce la lista dei partner (pubblico)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true"; // se true include non pubblicati (richiesto da admin)
    const user = await getCurrentUser();

    let partners = await PartnerRepo.getAll();

    if (!all || !user) {
      partners = partners.filter((p) => p.published);
    }

    return NextResponse.json({
      success: true,
      data: partners,
    });
  } catch (error) {
    console.error("GET /api/partner error:", error);
    return NextResponse.json(
      { error: "Errore durante il caricamento dei partner" },
      { status: 500 }
    );
  }
}

// POST /api/partner - Crea o aggiorna un partner (richiede autenticazione)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria" && user.role !== "editor") {
      return NextResponse.json({ error: "Accesso non autorizzato per il tuo profilo" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Il nome del partner o sostenitore è obbligatorio" },
        { status: 400 }
      );
    }

    const saved = await PartnerRepo.save(body);
    return NextResponse.json({
      success: true,
      data: saved,
      message: "Partner salvato con successo",
    });
  } catch (error) {
    console.error("POST /api/partner error:", error);
    return NextResponse.json(
      { error: "Errore durante il salvataggio del partner" },
      { status: 500 }
    );
  }
}

// DELETE /api/partner - Elimina un partner (richiede autenticazione)
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria" && user.role !== "editor") {
      return NextResponse.json({ error: "Accesso non autorizzato per il tuo profilo" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID partner mancante" },
        { status: 400 }
      );
    }

    await PartnerRepo.delete(id);
    return NextResponse.json({
      success: true,
      message: "Partner rimosso con successo",
    });
  } catch (error) {
    console.error("DELETE /api/partner error:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione del partner" },
      { status: 500 }
    );
  }
}
