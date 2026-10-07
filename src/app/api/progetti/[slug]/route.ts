import { NextRequest, NextResponse } from "next/server";
import { initDb, ProjectsRepo } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await initDb();
    const { slug } = await params;
    const project = await ProjectsRepo.getBySlug(slug);

    if (!project) {
      return NextResponse.json({ error: "Progetto non trovato" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error: unknown) {
    console.error("GET /api/progetti/[slug] error:", error);
    return NextResponse.json({ error: "Errore recupero progetto" }, { status: 500 });
  }
}
