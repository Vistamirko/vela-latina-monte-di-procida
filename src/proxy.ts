import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "vela-latina-secret-key-flegrea-2026-super-secure-token";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Percorsi sempre pubblici ed esclusi dal blocco password
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api/site-access") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/admin") ||
    pathname === "/access" ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // 2. Controllo se la protezione è disabilitata da env
  if (process.env.SITE_PROTECTION_ENABLED === "false") {
    return NextResponse.next();
  }

  // 3. Verifica presenza e validità del cookie di accesso al sito
  const siteCookie = req.cookies.get("vl_site_access")?.value;
  if (siteCookie) {
    try {
      const { payload } = await jwtVerify(siteCookie, JWT_SECRET);
      if (payload && payload.access === "granted") {
        return NextResponse.next();
      }
    } catch {
      // Token non valido o scaduto, prosegui
    }
  }

  // 4. Verifica se l'utente è un admin già loggato
  const adminCookie = req.cookies.get("vl_admin_session")?.value;
  if (adminCookie) {
    try {
      await jwtVerify(adminCookie, JWT_SECRET);
      return NextResponse.next();
    } catch {
      // Token admin non valido, prosegui
    }
  }

  // 5. Reindirizza alla pagina di sblocco password
  const url = req.nextUrl.clone();
  url.pathname = "/access";
  if (pathname !== "/") {
    url.searchParams.set("returnUrl", pathname);
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
