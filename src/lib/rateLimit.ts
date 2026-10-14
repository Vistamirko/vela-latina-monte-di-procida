import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class MemoryRateLimiter {
  private records = new Map<string, RateLimitRecord>();
  private sweepTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Pulisce periodicamente le chiavi scadute per evitare memory leak
    if (typeof setInterval !== "undefined") {
      this.sweepTimer = setInterval(() => this.sweep(), 5 * 60 * 1000);
      if (this.sweepTimer.unref) {
        this.sweepTimer.unref();
      }
    }
  }

  private sweep() {
    const now = Date.now();
    for (const [key, rec] of this.records.entries()) {
      if (now > rec.resetTime) {
        this.records.delete(key);
      }
    }
  }

  /**
   * Controlla e incrementa il conteggio per una chiave e finestra temporale
   */
  public check(
    key: string,
    limit: number,
    windowSeconds: number
  ): { allowed: boolean; remaining: number; resetInSeconds: number } {
    const now = Date.now();
    const existing = this.records.get(key);

    if (!existing || now > existing.resetTime) {
      this.records.set(key, {
        count: 1,
        resetTime: now + windowSeconds * 1000,
      });
      return {
        allowed: true,
        remaining: limit - 1,
        resetInSeconds: windowSeconds,
      };
    }

    if (existing.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: Math.max(1, Math.ceil((existing.resetTime - now) / 1000)),
      };
    }

    existing.count += 1;
    return {
      allowed: true,
      remaining: limit - existing.count,
      resetInSeconds: Math.max(1, Math.ceil((existing.resetTime - now) / 1000)),
    };
  }

  /**
   * Resetta il conteggio per una chiave (es. login riuscito)
   */
  public reset(key: string) {
    this.records.delete(key);
  }
}

export const rateLimiter = new MemoryRateLimiter();

/**
 * Estrae l'IP del client gestendo proxy e load balancer (Cloudflare, Vercel, Nginx)
 */
export function getClientIp(req: Request | NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }
  return "127.0.0.1";
}
