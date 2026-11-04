import "server-only";

// In-memory sliding window, per IP: 5 requests per 10 minutes.
// This only works inside ONE server instance. On Vercel every instance has its own memory, so a determined
// client can exceed the limit. For production traffic, swap this for a shared store such as Upstash Redis
// (@upstash/ratelimit) behind the same `consume` signature.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;

const g = globalThis as unknown as { __avvvsRate?: Map<string, number[]> };
const hits = (g.__avvvsRate ??= new Map<string, number[]>());

export function consume(key: string, now = Date.now()): { ok: true } | { ok: false; retryAfterSec: number } {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(key, recent);
    return { ok: false, retryAfterSec: Math.ceil((recent[0] + WINDOW_MS - now) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  return { ok: true };
}
