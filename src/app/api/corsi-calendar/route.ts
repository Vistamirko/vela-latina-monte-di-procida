import { NextRequest, NextResponse } from "next/server";
import { initDb, CoursesRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const url = new URL(req.url);
    const showAll = url.searchParams.get("all") === "true";
    const user = await getCurrentUser();

    const publishedOnly = !(showAll && user);
    const courses = await CoursesRepo.getAll(publishedOnly);

    return NextResponse.json({ success: true, count: courses.length, data: courses });
  } catch (error: any) {
    console.error("GET /api/corsi-calendar error:", error);
    return NextResponse.json({ error: "Errore recupero calendario corsi" }, { status: 500 });
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

    if (!body.courseTitle || !body.startDate || !body.schedule || !body.instructor) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti (titolo corso, data inizio, orari, istruttore)" },
        { status: 400 }
      );
    }

    const id = body.id || `course-${Date.now()}`;
    const saved = await CoursesRepo.save({
      id,
      courseKey: body.courseKey || "voga",
      courseTitle: body.courseTitle,
      startDate: body.startDate,
      endDate: body.endDate || undefined,
      schedule: body.schedule,
      totalSeats: Number(body.totalSeats) || 10,
      availableSeats: Number(body.availableSeats) || 10,
      status: body.status || "aperte",
      instructor: body.instructor,
      notes: body.notes || undefined,
      price: body.price || undefined,
      published: body.published !== false,
    });

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/corsi-calendar error:", error);
    return NextResponse.json({ error: "Errore salvataggio sessione corso" }, { status: 500 });
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

    if (!body.id || !body.courseTitle) {
      return NextResponse.json(
        { error: "ID e titolo corso richiesti" },
        { status: 400 }
      );
    }

    const saved = await CoursesRepo.save({
      id: body.id,
      courseKey: body.courseKey || "voga",
      courseTitle: body.courseTitle,
      startDate: body.startDate,
      endDate: body.endDate || undefined,
      schedule: body.schedule,
      totalSeats: Number(body.totalSeats) || 10,
      availableSeats: Number(body.availableSeats) || 0,
      status: body.status || "aperte",
      instructor: body.instructor,
      notes: body.notes || undefined,
      price: body.price || undefined,
      published: Boolean(body.published),
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    console.error("PUT /api/corsi-calendar error:", error);
    return NextResponse.json({ error: "Errore aggiornamento sessione corso" }, { status: 500 });
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
      return NextResponse.json({ error: "ID sessione corso richiesto" }, { status: 400 });
    }

    await CoursesRepo.delete(id);
    return NextResponse.json({ success: true, message: "Sessione corso eliminata" });
  } catch (error: any) {
    console.error("DELETE /api/corsi-calendar error:", error);
    return NextResponse.json({ error: "Errore eliminazione sessione corso" }, { status: 500 });
  }
}
