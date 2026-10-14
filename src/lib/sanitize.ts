/**
 * Utility per la sanitizzazione degli input e la prevenzione di XSS e Header Injection
 */

/**
 * Escape dei caratteri HTML speciali per prevenire stored/reflected XSS e HTML injection nelle email
 */
export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Rimuove caratteri di controllo, ritorni a capo e tag pericolosi per campi di testo semplice (nome, titolo, ecc.)
 */
export function sanitizePlainText(str: unknown, maxLength = 255): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/[\r\n\t\0\x08]/g, " ") // rimuove control chars e newlines
    .replace(/<[^>]*>/g, "") // rimuove eventuali tag HTML
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitizza un indirizzo email prevenendo newline injection nei parametri SMTP
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== "string") return "";
  return email
    .replace(/[\r\n\t\0]/g, "") // previene CRLF header injection
    .trim()
    .toLowerCase()
    .slice(0, 255);
}

/**
 * Valida la sintassi di base di un indirizzo email
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 255) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email);
}
