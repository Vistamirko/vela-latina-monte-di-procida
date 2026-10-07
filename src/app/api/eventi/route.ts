import { NextRequest, NextResponse } from "next/server";
import { initDb, EventsRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const url = new URL(req.url);
    const showAll = url.searchParams.get("all") === "true";
    const user = await getCurrentUser();

    // Se richiede tutti i record (incluse bozze), richiediamo autenticazione admin
    const publishedOnly = !(showAll && user);
    const events = await EventsRepo.getAll(publishedOnly);

    return NextResponse.json({ success: true, count: events.length, data: events });
  } catch (error: any) {
    console.error("GET /api/eventi error:", error);
    return NextResponse.json({ error: "Errore recupero eventi" }, { status: 500 });
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

    if (!body.title || !body.date || !body.location || !body.description) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti (titolo, data, luogo, descrizione)" },
        { status: 400 }
      );
    }

    const id = body.id || `evt-${Date.now()}`;
    const saved = await EventsRepo.save({
      id,
      title: body.title,
      date: body.date,
      location: body.location,
      category: body.category || "regata",
      badge: body.badge || undefined,
      description: body.description,
      imageUrl: body.imageUrl || undefined,
      result: body.result || undefined,
      published: body.published !== false,
    });

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/eventi error:", error);
    return NextResponse.json({ error: "Errore salvataggio evento" }, { status: 500 });
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
        { error: "ID e titolo evento richiesti" },
        { status: 400 }
      );
    }

    const saved = await EventsRepo.save({
      id: body.id,
      title: body.title,
      date: body.date,
      location: body.location,
      category: body.category || "regata",
      badge: body.badge || undefined,
      description: body.description,
      imageUrl: body.imageUrl || undefined,
      result: body.result || undefined,
      published: Boolean(body.published),
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    console.error("PUT /api/eventi error:", error);
    return NextResponse.json({ error: "Errore aggiornamento evento" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
    }

    await initDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID evento richiesto" }, { status: 400 });
    }

    await EventsRepo.delete(id);
    return NextResponse.json({ success: true, message: "Evento eliminato" });
  } catch (error: any) {
    console.error("DELETE /api/eventi error:", error);
    return NextResponse.json({ error: "Errore eliminazione evento" }, { status: 500 });
  }
}
