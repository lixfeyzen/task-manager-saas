/**
 * Rate limiting utility — fixed-window algorithm.
 *
 * SERVERLESS NOTICE:
 * The in-memory store (Map) works correctly in long-running environments
 * (Node.js dev server, Railway, Render) but NOT on fully stateless serverless
 * platforms where each request may spawn a fresh process (e.g. Vercel Edge).
 *
 * For Vercel / other serverless: replace the in-memory store with an
 * Upstash Redis client:
 *   npm install @upstash/ratelimit @upstash/redis
 * and set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in your env.
 *
 * The public API (checkRateLimit) stays identical — only the store changes.
 */

interface WindowEntry {
  count: number;
  resetAt: number; // epoch ms
}

// In-memory store — suitable for dev and single-instance deployments
const store = new Map<string, WindowEntry>();

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Epoch ms when the window resets */
  resetAt: number;
}

/**
 * Check and increment the rate-limit counter for a given key.
 *
 * @param key       Identifier — typically IP + endpoint, e.g. "1.2.3.4:/api/auth/register"
 * @param config    Limit and window configuration
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // Start a fresh window if none exists or the previous window has expired
  if (!entry || now >= entry.resetAt) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: config.limit - 1, resetAt };
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: config.limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Extract the client IP from a Next.js request.
 * Respects X-Forwarded-For set by proxies / Vercel edge network.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

// ─── Pre-configured limiters for common endpoints ───────────────────────────

/** Auth endpoints (login, register): 10 requests per 15 minutes per IP */
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  limit: 10,
  windowMs: 15 * 60 * 1000,
};

/** Password-related endpoints: 5 requests per 15 minutes per IP */
export const PASSWORD_RATE_LIMIT: RateLimitConfig = {
  limit: 5,
  windowMs: 15 * 60 * 1000,
};
