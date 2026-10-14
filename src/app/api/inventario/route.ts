import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { InventarioRepo, AcquistiRepo } from "@/lib/db";

// GET /api/inventario - Restituisce inventario attrezzature e piano acquisti
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope"); // "inventario" | "acquisti" | null

    if (scope === "inventario") {
      const inventario = await InventarioRepo.getAll();
      return NextResponse.json({ success: true, data: inventario });
    }

    if (scope === "acquisti") {
      const acquisti = await AcquistiRepo.getAll();
      return NextResponse.json({ success: true, data: acquisti });
    }

    const [inventario, acquisti] = await Promise.all([
      InventarioRepo.getAll(),
      AcquistiRepo.getAll(),
    ]);

    return NextResponse.json({
      success: true,
      data: { inventario, acquisti },
    });
  } catch (error) {
    console.error("GET /api/inventario error:", error);
    return NextResponse.json({ error: "Errore caricamento inventario o acquisti" }, { status: 500 });
  }
}

// POST /api/inventario - Crea o aggiorna un articolo di inventario o piano acquisti
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await req.json();
    const type = body.type; // "inventario" | "acquisto"

    if (type === "inventario") {
      if (!body.oggetto) {
        return NextResponse.json({ error: "Nome oggetto obbligatorio" }, { status: 400 });
      }
      const saved = await InventarioRepo.save(body);
      return NextResponse.json({ success: true, data: saved, message: "Articolo inventario salvato" });
    }

    if (type === "acquisto") {
      if (!body.oggetto) {
        return NextResponse.json({ error: "Nome articolo d'acquisto obbligatorio" }, { status: 400 });
      }
      const saved = await AcquistiRepo.save(body);
      return NextResponse.json({ success: true, data: saved, message: "Voce piano acquisti salvata" });
    }

    return NextResponse.json({ error: "Tipo specificato non valido" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/inventario error:", error);
    return NextResponse.json({ error: "Errore salvataggio dati inventario/acquisti" }, { status: 500 });
  }
}

// DELETE /api/inventario - Elimina articolo o voce acquisto
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // "inventario" | "acquisto"

    if (!id || !type) {
      return NextResponse.json({ error: "ID e tipo mancanti" }, { status: 400 });
    }

    if (type === "inventario") {
      await InventarioRepo.delete(id);
      return NextResponse.json({ success: true, message: "Articolo inventario eliminato" });
    }

    if (type === "acquisto") {
      await AcquistiRepo.delete(id);
      return NextResponse.json({ success: true, message: "Voce acquisto eliminata" });
    }

    return NextResponse.json({ error: "Tipo non valido" }, { status: 400 });
  } catch (error) {
    console.error("DELETE /api/inventario error:", error);
    return NextResponse.json({ error: "Errore eliminazione record" }, { status: 500 });
  }
}
