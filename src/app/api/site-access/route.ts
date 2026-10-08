import { NextRequest, NextResponse } from "next/server";
import { createSiteAccessToken, DEFAULT_SITE_PASSWORD, SITE_ACCESS_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    const validPassword = process.env.SITE_PASSWORD || DEFAULT_SITE_PASSWORD;

    if (!password || String(password).trim() !== validPassword) {
      return NextResponse.json({ error: "Password di accesso non corretta" }, { status: 401 });
    }

    const token = await createSiteAccessToken();

    const response = NextResponse.json({
      success: true,
      message: "Accesso all'anteprima autorizzato",
    });

    response.cookies.set({
      name: SITE_ACCESS_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 giorni
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("POST /api/site-access error:", error);
    return NextResponse.json({ error: "Errore durante la verifica della password" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Accesso revocato" });
  response.cookies.delete(SITE_ACCESS_COOKIE);
  return response;
}
