import { NextRequest, NextResponse } from "next/server";
import { initDb, BlogRepo } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await initDb();
    const { slug } = await params;
    const post = await BlogRepo.getBySlug(slug);

    if (!post) {
      return NextResponse.json({ error: "Articolo non trovato" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error: unknown) {
    console.error("GET /api/blog/[slug] error:", error);
    return NextResponse.json({ error: "Errore recupero articolo" }, { status: 500 });
  }
}
