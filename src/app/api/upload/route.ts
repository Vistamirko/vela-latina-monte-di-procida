import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rateLimiter, getClientIp } from "@/lib/rateLimit";
import fs from "fs/promises";
import path from "path";

const MIME_TO_EXTENSIONS: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "image/svg+xml": [".svg"],
  "image/avif": [".avif"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.oasis.opendocument.text": [".odt"],
  "text/plain": [".txt"],
  "application/zip": [".zip"],
};

const DANGEROUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /onload\s*=/i,
  /onerror\s*=/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
];

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    // Rate limiting per utente / IP: max 30 caricamenti ogni 10 minuti
    const clientIp = getClientIp(request);
    const rateCheck = rateLimiter.check(`upload:${user.userId || clientIp}`, 30, 10 * 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Limite di caricamenti raggiunto. Riprova tra qualche minuto." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nessun file caricato" }, { status: 400 });
    }

    const mime = file.type?.toLowerCase() || "";
    const allowedExtensions = MIME_TO_EXTENSIONS[mime];

    if (!allowedExtensions) {
      return NextResponse.json(
        { error: "Tipo di file non supportato. Formati ammessi: PDF, DOC, DOCX, JPG, PNG, WEBP, GIF, SVG, AVIF, TXT, ZIP." },
        { status: 400 }
      );
    }

    // 25 MB limit
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Il file supera la dimensione massima consentita di 25MB." },
        { status: 400 }
      );
    }

    const rawName = file.name || "upload";
    const detectedExt = path.extname(rawName).toLowerCase();
    const safeExt = allowedExtensions.includes(detectedExt) ? detectedExt : allowedExtensions[0];

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Se il file è un SVG, controlla che non contenga script o vettori XSS
    if (mime === "image/svg+xml" || safeExt === ".svg") {
      const content = buffer.toString("utf-8");
      const hasDangerousContent = DANGEROUS_PATTERNS.some((pattern) => pattern.test(content));
      if (hasDangerousContent) {
        return NextResponse.json(
          { error: "Il file SVG contiene codice o script non consentiti per motivi di sicurezza." },
          { status: 400 }
        );
      }
    }

    const baseName = path
      .basename(rawName, detectedExt)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50);

    const safeBase = baseName || "documento";
    const fileName = `${Date.now()}-${safeBase}${safeExt}`;

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
      const dataUri = `data:${mime};base64,${base64Data}`;
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
