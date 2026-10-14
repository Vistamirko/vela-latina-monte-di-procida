import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AttivitaRepo } from "@/lib/db";

// GET /api/attivita - Restituisce i progetti portfolio e i task operativi
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria" && user.role !== "istruttore" && user.role !== "editor") {
      return NextResponse.json({ error: "Accesso non autorizzato per il tuo profilo" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope"); // "portfolio" | "tasks" | null

    if (scope === "portfolio") {
      const portfolio = await AttivitaRepo.getPortfolio();
      return NextResponse.json({ success: true, data: portfolio });
    }

    if (scope === "tasks") {
      const tasks = await AttivitaRepo.getTasks();
      return NextResponse.json({ success: true, data: tasks });
    }

    const [portfolio, tasks] = await Promise.all([
      AttivitaRepo.getPortfolio(),
      AttivitaRepo.getTasks(),
    ]);

    return NextResponse.json({
      success: true,
      data: { portfolio, tasks },
    });
  } catch (error) {
    console.error("GET /api/attivita error:", error);
    return NextResponse.json({ error: "Errore caricamento attività" }, { status: 500 });
  }
}

// POST /api/attivita - Salva o aggiorna un progetto portfolio o un task operativo
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria" && user.role !== "istruttore" && user.role !== "editor") {
      return NextResponse.json({ error: "Accesso non autorizzato per il tuo profilo" }, { status: 403 });
    }

    const body = await req.json();
    const type = body.type; // "portfolio" | "task"

    if (type === "portfolio") {
      if (!body.titolo) {
        return NextResponse.json({ error: "Titolo progetto obbligatorio" }, { status: 400 });
      }
      const saved = await AttivitaRepo.savePortfolio(body);
      return NextResponse.json({ success: true, data: saved, message: "Progetto salvato" });
    }

    if (type === "task") {
      if (!body.attivita) {
        return NextResponse.json({ error: "Titolo attività / task obbligatorio" }, { status: 400 });
      }
      const saved = await AttivitaRepo.saveTask(body);
      return NextResponse.json({ success: true, data: saved, message: "Task salvato" });
    }

    return NextResponse.json({ error: "Tipo specificato non valido" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/attivita error:", error);
    return NextResponse.json({ error: "Errore salvataggio attività" }, { status: 500 });
  }
}

// DELETE /api/attivita - Elimina un progetto o un task
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria") {
      return NextResponse.json({ error: "Non hai i permessi per eliminare attività o progetti" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // "portfolio" | "task"

    if (!id || !type) {
      return NextResponse.json({ error: "ID e tipo mancanti" }, { status: 400 });
    }

    if (type === "portfolio") {
      await AttivitaRepo.deletePortfolio(id);
      return NextResponse.json({ success: true, message: "Progetto eliminato" });
    }

    if (type === "task") {
      await AttivitaRepo.deleteTask(id);
      return NextResponse.json({ success: true, message: "Task eliminato" });
    }

    return NextResponse.json({ error: "Tipo non valido" }, { status: 400 });
  } catch (error) {
    console.error("DELETE /api/attivita error:", error);
    return NextResponse.json({ error: "Errore eliminazione record" }, { status: 500 });
  }
}
