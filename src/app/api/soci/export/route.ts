import { NextRequest, NextResponse } from "next/server";
import { initDb, SociRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/soci/export — Scarica file CSV/Excel del Libro Soci
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

    // Costruisci CSV compatibile al 100% con Excel (punto e virgola come separatore, UTF-8 BOM)
    const headers = [
      "Nr.",
      "Anno",
      "Cognome Nome",
      "Data & Luogo di Nascita",
      "Codice Fiscale",
      "Nr. Tessera",
      "Quota Contanti (€)",
      "Quota Bonifico (Bon)",
      "Socio Onorario (S.O.)",
      "Tipologia Socio",
      "Email",
      "Telefono",
      "Data Iscrizione",
      "Note",
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = list.map((s, idx) => [
      escapeCsv(s.progressivo || idx + 1),
      escapeCsv(s.anno),
      escapeCsv(s.nome),
      escapeCsv(s.dataLuogoNascita || ""),
      escapeCsv(s.codiceFiscale || ""),
      escapeCsv(s.numeroTessera || ""),
      escapeCsv(s.quotaContanti || ""),
      escapeCsv(s.quotaBonifico || ""),
      escapeCsv(s.socioOnorario ? "SÌ" : ""),
      escapeCsv(s.tipologia || ""),
      escapeCsv(s.email || ""),
      escapeCsv(s.telefono || ""),
      escapeCsv(s.dataIscrizione || ""),
      escapeCsv(s.note || ""),
    ]);

    const csvContent =
      "\uFEFF" + // UTF-8 Byte Order Mark per Excel
      [headers.map(escapeCsv).join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");

    const filename = anno
      ? `Libro_Soci_Vela_Latina_${anno}.csv`
      : `Libro_Soci_Vela_Latina_Completo.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("GET /api/soci/export error:", error);
    return NextResponse.json({ error: "Errore esportazione" }, { status: 500 });
  }
}
