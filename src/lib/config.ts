/**
 * Configurazione centralizzata URL del sito e ambiente.
 * Viene gestita tramite la variabile d'ambiente NEXT_PUBLIC_SITE_URL
 * (configurabile in .env.local e nelle impostazioni Environment Variables di Vercel).
 */
export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://vela-latina-monte-di-procida.vercel.app"
).replace(/\/$/, "");

export function getAbsoluteUrl(path: string = ""): string {
  if (!path) return SITE_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}
