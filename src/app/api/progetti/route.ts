import { NextRequest, NextResponse } from "next/server";
import { initDb, ProjectsRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const url = new URL(req.url);
    const showAll = url.searchParams.get("all") === "true";
    const user = await getCurrentUser();

    const publishedOnly = !(showAll && user);
    const projects = await ProjectsRepo.getAll(publishedOnly);

    return NextResponse.json({ success: true, count: projects.length, data: projects });
  } catch (error: unknown) {
    console.error("GET /api/progetti error:", error);
    return NextResponse.json({ error: "Errore recupero progetti" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
    }

    await initDb();
    const body = await req.json();

    if (!body.title || !body.highlight || !body.description) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti (titolo, highlight/sottotitolo, descrizione)" },
        { status: 400 }
      );
    }

    const id = body.id || `proj-${Date.now()}`;
    const saved = await ProjectsRepo.save({
      id,
      number: body.number || "01",
      title: body.title,
      highlight: body.highlight,
      category: body.category || "Regata Internazionale",
      badge: body.badge || undefined,
      partner: body.partner || "Campi Flegrei · Rete Partner",
      status: body.status || "In Corso",
      description: body.description,
      published: body.published !== false,
    });

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/progetti error:", error);
    return NextResponse.json({ error: "Errore salvataggio progetto" }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: "ID progetto mancante" }, { status: 400 });
    }

    const success = await ProjectsRepo.delete(id);
    return NextResponse.json({ success });
  } catch (error: unknown) {
    console.error("DELETE /api/progetti error:", error);
    return NextResponse.json({ error: "Errore eliminazione progetto" }, { status: 500 });
  }
}
