import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nessun file caricato" }, { status: 400 });
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato file non supportato. Usa JPG, PNG, WEBP o SVG." },
        { status: 400 }
      );
    }

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Il file supera la dimensione massima di 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const rawName = file.name || "upload";
    const ext = path.extname(rawName).toLowerCase() || ".jpg";
    const baseName = path
      .basename(rawName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-");

    const fileName = `${Date.now()}-${baseName}${ext}`;

    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${fileName}`,
        fileName,
      });
    } catch {
      // Fallback a Data URI in ambienti serverless senza disco scrivibile
      const base64Data = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${base64Data}`;
      return NextResponse.json({
        success: true,
        url: dataUri,
        fileName,
      });
    }
  } catch (error: unknown) {
    const msg =
      error instanceof Error
        ? error.message
        : "Errore durante il caricamento del file";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
