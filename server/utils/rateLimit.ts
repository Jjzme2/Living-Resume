/**
 * KV-backed rate limiter.
 * Gracefully skips if Firebase is unavailable (fails open rather than blocking all traffic).
 */
import { kvGet, kvSet } from './kv'

interface Window {
  count: number
  resetAt: number
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  try {
    const now = Date.now()
    const stored = await kvGet<Window>(`ratelimit:${key}`)

    if (!stored || now >= stored.resetAt) {
      const resetAt = now + windowMs
      await kvSet(`ratelimit:${key}`, { count: 1, resetAt })
      return { allowed: true, remaining: limit - 1, resetAt }
    }

    if (stored.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: stored.resetAt }
    }

    await kvSet(`ratelimit:${key}`, { count: stored.count + 1, resetAt: stored.resetAt })
    return { allowed: true, remaining: limit - stored.count - 1, resetAt: stored.resetAt }
  } catch {
    // If KV is unavailable, fail open to avoid blocking legitimate traffic
    return { allowed: true, remaining: limit, resetAt: Date.now() + windowMs }
  }
}
