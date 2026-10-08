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
    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const saved = await ProjectsRepo.save({
      id,
      slug,
      number: body.number || "01",
      title: body.title,
      highlight: body.highlight,
      category: body.category || "Regata Internazionale",
      badge: body.badge || undefined,
      partner: body.partner || "Campi Flegrei · Rete Partner",
      status: body.status || "In Corso",
      description: body.description,
      content: body.content || undefined,
      imageUrl: body.imageUrl || undefined,
      location: body.location || undefined,
      timeline: body.timeline || undefined,
      published: body.published !== false,
      anagrafica: body.anagrafica || undefined,
      referente: body.referente || undefined,
    });

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/progetti error:", error);
    return NextResponse.json({ error: "Errore salvataggio progetto" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
    }

    await initDb();
    const body = await req.json();

    if (!body.id || !body.title) {
      return NextResponse.json(
        { error: "ID e titolo progetto richiesti" },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const saved = await ProjectsRepo.save({
      id: body.id,
      slug,
      number: body.number || "01",
      title: body.title,
      highlight: body.highlight || "",
      category: body.category || "Regata Internazionale",
      badge: body.badge || undefined,
      partner: body.partner || "Campi Flegrei · Rete Partner",
      status: body.status || "In Corso",
      description: body.description || "",
      content: body.content || undefined,
      imageUrl: body.imageUrl || undefined,
      location: body.location || undefined,
      timeline: body.timeline || undefined,
      published: body.published !== false,
      anagrafica: body.anagrafica || undefined,
      referente: body.referente || undefined,
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: unknown) {
    console.error("PUT /api/progetti error:", error);
    return NextResponse.json({ error: "Errore aggiornamento progetto" }, { status: 500 });
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
