import { NextRequest, NextResponse } from "next/server";
import { initDb, BlogRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const url = new URL(req.url);
    const showAll = url.searchParams.get("all") === "true";
    const user = await getCurrentUser();

    const publishedOnly = !(showAll && user);
    const posts = await BlogRepo.getAll(publishedOnly);

    return NextResponse.json({ success: true, count: posts.length, data: posts });
  } catch (error: unknown) {
    console.error("GET /api/blog error:", error);
    return NextResponse.json({ error: "Errore recupero articoli blog" }, { status: 500 });
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

    if (!body.title || !body.content || !body.excerpt) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti (titolo, estratto, contenuto)" },
        { status: 400 }
      );
    }

    // Genera slug da titolo se non specificato
    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const id = body.id || `post-${Date.now()}`;
    const saved = await BlogRepo.save({
      id,
      slug,
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage || undefined,
      author: body.author || user.name || "Vela Latina Redazione",
      category: body.category || "Cultura & Mare",
      published: body.published !== false,
      publishedAt: body.publishedAt || new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/blog error:", error);
    return NextResponse.json({ error: "Errore salvataggio articolo" }, { status: 500 });
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

    if (!body.id || !body.title || !body.slug) {
      return NextResponse.json(
        { error: "ID, titolo e slug articolo richiesti" },
        { status: 400 }
      );
    }

    const saved = await BlogRepo.save({
      id: body.id,
      slug: body.slug,
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage || undefined,
      author: body.author,
      category: body.category || "Cultura & Mare",
      published: Boolean(body.published),
      publishedAt: body.publishedAt,
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: unknown) {
    console.error("PUT /api/blog error:", error);
    return NextResponse.json({ error: "Errore aggiornamento articolo" }, { status: 500 });
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
      return NextResponse.json({ error: "ID articolo richiesto" }, { status: 400 });
    }

    await BlogRepo.delete(id);
    return NextResponse.json({ success: true, message: "Articolo eliminato" });
  } catch (error: unknown) {
    console.error("DELETE /api/blog error:", error);
    return NextResponse.json({ error: "Errore eliminazione articolo" }, { status: 500 });
  }
}
