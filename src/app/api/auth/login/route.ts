import { NextRequest, NextResponse } from "next/server";
import { initDb, UsersRepo } from "@/lib/db";
import { verifyPassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { rateLimiter, getClientIp } from "@/lib/rateLimit";
import { sanitizeEmail } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = rateLimiter.check(`login:${clientIp}`, 8, 15 * 60); // 8 tentativi ogni 15 minuti per IP

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Troppi tentativi di accesso. Riprova tra ${Math.ceil(rateCheck.resetInSeconds / 60)} minuti.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.resetInSeconds),
          },
        }
      );
    }

    await initDb();
    const body = await req.json();
    const rawEmail = body.email;
    const password = body.password;

    if (!rawEmail || !password) {
      return NextResponse.json(
        { error: "Email e password richieste" },
        { status: 400 }
      );
    }

    const email = sanitizeEmail(rawEmail);
    const user = await UsersRepo.findByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "Credenziali non valide" },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Credenziali non valide" },
        { status: 401 }
      );
    }

    // Login riuscito: resetta il rate limiter per questo IP
    rateLimiter.reset(`login:${clientIp}`);

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 giorni
      path: "/",
    });

    return res;
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Errore durante il login" },
      { status: 500 }
    );
  }
}
