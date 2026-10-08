import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AnagraficaRepo } from "@/lib/db";
import { DocumentoIstituzionale } from "@/lib/db/types";

// GET /api/anagrafica - Ottiene l'anagrafica completa e l'archivio documenti
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato. Accesso riservato agli amministratori." }, { status: 401 });
    }

    const anagrafica = await AnagraficaRepo.get();
    return NextResponse.json({ success: true, data: anagrafica });
  } catch (error) {
    console.error("GET /api/anagrafica error:", error);
    return NextResponse.json(
      { error: "Errore durante il caricamento dell'anagrafica" },
      { status: 500 }
    );
  }
}

// POST /api/anagrafica - Aggiorna l'anagrafica o aggiunge/cancella un documento
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = await req.json();

    // Se richiesta di aggiunta documento
    if (body.action === "add_document") {
      const doc: DocumentoIstituzionale = body.document;
      if (!doc || !doc.titolo || !doc.fileUrl) {
        return NextResponse.json({ error: "Dati documento incompleti" }, { status: 400 });
      }
      const updated = await AnagraficaRepo.addDocument(doc);
      return NextResponse.json({ success: true, data: updated, message: "Documento aggiunto all'archivio" });
    }

    // Se richiesta di eliminazione documento
    if (body.action === "delete_document") {
      const docId = body.id;
      if (!docId) {
        return NextResponse.json({ error: "ID documento mancante" }, { status: 400 });
      }
      const updated = await AnagraficaRepo.deleteDocument(docId);
      return NextResponse.json({ success: true, data: updated, message: "Documento rimosso dall'archivio" });
    }

    // Aggiornamento dati anagrafici
    const updated = await AnagraficaRepo.save(body);
    return NextResponse.json({ success: true, data: updated, message: "Anagrafica aggiornata con successo" });
  } catch (error) {
    console.error("POST /api/anagrafica error:", error);
    return NextResponse.json(
      { error: "Errore durante il salvataggio dei dati anagrafici" },
      { status: 500 }
    );
  }
}
