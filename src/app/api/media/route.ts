import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export interface MediaItem {
  url: string;
  name: string;
  title: string;
  category: string;
  sizeBytes?: number;
  updatedAt?: string;
}

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);

function humanizeName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^/.]+$/, "");
  return withoutExt
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function determineCategory(relPath: string): string {
  const lower = relPath.toLowerCase();
  if (lower.includes("museo")) return "Museo & Reperti";
  if (lower.includes("attivita") || lower.includes("voga") || lower.includes("corso")) return "Scuola & Attività";
  if (lower.includes("sede") || lower.includes("bitta")) return "Sede & Cantieri";
  if (lower.includes("uploads")) return "Caricamenti Recenti";
  if (lower.includes("janara") || lower.includes("regatta") || lower.includes("sailing") || lower.includes("fleet")) {
    return "Flotta & Regate";
  }
  return "Archivio Generale";
}

async function scanDirectory(dirPath: string, basePublic: string): Promise<MediaItem[]> {
  const items: MediaItem[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;

      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subItems = await scanDirectory(fullPath, basePublic);
        items.push(...subItems);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ALLOWED_EXTENSIONS.has(ext)) {
          const relativeToPublic = path.relative(basePublic, fullPath).replace(/\\/g, "/");
          const url = `/${relativeToPublic}`;
          let sizeBytes: number | undefined;
          let updatedAt: string | undefined;

          try {
            const stats = await fs.stat(fullPath);
            sizeBytes = stats.size;
            updatedAt = stats.mtime.toISOString();
          } catch {
            // Ignora errori di stat
          }

          items.push({
            url,
            name: entry.name,
            title: humanizeName(entry.name),
            category: determineCategory(relativeToPublic),
            sizeBytes,
            updatedAt,
          });
        }
      }
    }
  } catch (err) {
    console.warn(`[MEDIA API] Errore scansione directory ${dirPath}:`, err);
  }

  return items;
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").toLowerCase().trim();
    const categoryFilter = searchParams.get("category") || "";

    const publicDir = path.join(process.cwd(), "public");
    const imagesDir = path.join(publicDir, "images");
    const uploadsDir = path.join(publicDir, "uploads");

    const [imagesList, uploadsList] = await Promise.all([
      scanDirectory(imagesDir, publicDir),
      scanDirectory(uploadsDir, publicDir),
    ]);

    let allMedia = [...imagesList, ...uploadsList];

    // Ordinamento: immagini più recenti o con nome significativo prima
    allMedia.sort((a, b) => {
      if (a.updatedAt && b.updatedAt) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return a.title.localeCompare(b.title);
    });

    if (categoryFilter && categoryFilter !== "Tutte") {
      allMedia = allMedia.filter((item) => item.category === categoryFilter);
    }

    if (query) {
      allMedia = allMedia.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.url.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      data: allMedia,
      total: allMedia.length,
    });
  } catch (error: any) {
    console.error("[MEDIA API ERROR]", error);
    return NextResponse.json(
      { error: "Errore durante il recupero dei media" },
      { status: 500 }
    );
  }
}
