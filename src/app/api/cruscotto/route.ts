import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { CruscottoRepo } from "@/lib/db";

// GET /api/cruscotto - Restituisce i KPI del cruscotto operativo e le proposte software
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    if (user.role !== "superadmin" && user.role !== "admin" && user.role !== "segreteria") {
      return NextResponse.json({ error: "Accesso riservato alla Segreteria e Superadmin" }, { status: 403 });
    }

    const kpi = await CruscottoRepo.getKPI();

    return NextResponse.json({
      success: true,
      data: {
        kpi,
      },
    });
  } catch (error) {
    console.error("GET /api/cruscotto error:", error);
    return NextResponse.json({ error: "Errore caricamento cruscotto" }, { status: 500 });
  }
}
