import { SignJWT, jwtVerify } from 'jose'
import { getCookie, setCookie } from 'h3'
import type { H3Event } from 'h3'

const COOKIE_NAME  = 'admin_token'
const TOKEN_TTL    = '30d'
const COOKIE_MAX   = 60 * 60 * 24 * 30   // 30 days in seconds
// Refresh the cookie whenever the token is older than this many seconds
const REFRESH_AFTER = 60 * 60 * 24       // 1 day

function getSecret(): Uint8Array {
  const { jwtSecret } = useRuntimeConfig()
  return new TextEncoder().encode(jwtSecret)
}

function cookieOpts(event: H3Event) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: COOKIE_MAX,
    path: '/',
  }
}

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

export function getTokenFromEvent(event: H3Event): string | null {
  return getCookie(event, COOKIE_NAME) ?? null
}

/**
 * Verify the request is authenticated.
 * Silently refreshes the cookie if the token is older than REFRESH_AFTER seconds,
 * resetting the 30-day window so the admin stays logged in indefinitely.
 */
export async function requireAuth(event: H3Event): Promise<void> {
  const token = getTokenFromEvent(event)
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const payload = await verifyToken(token)
  if (!payload) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  // Sliding refresh: re-issue cookie if token is getting stale
  const iat = typeof payload.iat === 'number' ? payload.iat : 0
  const age = Math.floor(Date.now() / 1000) - iat
  if (age > REFRESH_AFTER) {
    const fresh = await signToken({ role: 'admin' })
    setCookie(event, COOKIE_NAME, fresh, cookieOpts(event))
  }
}

/** Issue the auth cookie on login. */
export function issueAuthCookie(event: H3Event, token: string): void {
  setCookie(event, COOKIE_NAME, token, cookieOpts(event))
}
