import { NextRequest, NextResponse } from "next/server";
import { initDb, SociRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/soci — Elenco soci (opzionale filtro ?anno=2026)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
    }

    await initDb();
    const url = new URL(req.url);
    const annoParam = url.searchParams.get("anno");
    const anno = annoParam ? parseInt(annoParam, 10) : undefined;

    const list = await SociRepo.getAll(anno);
    const nextInfo = await SociRepo.getNextTessera(anno || 2026);

    return NextResponse.json({
      success: true,
      count: list.length,
      data: list,
      nextInfo,
    });
  } catch (error: any) {
    console.error("GET /api/soci error:", error);
    return NextResponse.json({ error: "Errore recupero lista soci" }, { status: 500 });
  }
}

// POST /api/soci — Crea o aggiorna un socio a mano
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
    }

    await initDb();
    const body = await req.json();

    if (!body.nome || !body.anno) {
      return NextResponse.json({ error: "Nome e Anno sociale sono obbligatori" }, { status: 400 });
    }

    const anno = parseInt(String(body.anno), 10) || 2026;
    let progressivo = body.progressivo ? parseInt(String(body.progressivo), 10) : undefined;
    let numeroTessera = body.numeroTessera ? String(body.numeroTessera).trim() : undefined;

    if (!progressivo && !body.id) {
      const next = await SociRepo.getNextTessera(anno);
      progressivo = next.nextProgressivo;
      if (!numeroTessera) {
        numeroTessera = String(next.nextTessera);
      }
    }

    const saved = await SociRepo.save({
      id: body.id,
      anno,
      progressivo,
      nome: String(body.nome).trim(),
      dataLuogoNascita: body.dataLuogoNascita ? String(body.dataLuogoNascita).trim() : undefined,
      codiceFiscale: body.codiceFiscale ? String(body.codiceFiscale).trim().toUpperCase() : undefined,
      numeroTessera,
      quotaContanti: body.quotaContanti ? String(body.quotaContanti) : undefined,
      quotaBonifico: body.quotaBonifico ? String(body.quotaBonifico) : undefined,
      socioOnorario: Boolean(body.socioOnorario),
      tipologia: body.tipologia ? String(body.tipologia).trim() : "Socio Ordinario",
      email: body.email ? String(body.email).trim().toLowerCase() : undefined,
      telefono: body.telefono ? String(body.telefono).trim() : undefined,
      dataIscrizione: body.dataIscrizione || new Date().toISOString().split("T")[0],
      metodoPagamento: body.metodoPagamento || (body.quotaBonifico ? "bonifico" : body.quotaContanti ? "contanti" : "altro"),
      importoPagato: body.importoPagato ? Number(body.importoPagato) : undefined,
      note: body.note ? String(body.note).trim() : undefined,
      createdAt: body.createdAt,
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    console.error("POST /api/soci error:", error);
    return NextResponse.json({ error: "Errore salvataggio socio" }, { status: 500 });
  }
}

// DELETE /api/soci — Rimuove un socio
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
      return NextResponse.json({ error: "Parametro id mancante" }, { status: 400 });
    }

    await SociRepo.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/soci error:", error);
    return NextResponse.json({ error: "Errore eliminazione socio" }, { status: 500 });
  }
}
