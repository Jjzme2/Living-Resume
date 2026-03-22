import { readBody, getRequestIP } from 'h3'
import { signToken, issueAuthCookie } from '../../utils/auth'
import { checkRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Rate limit: 5 attempts per IP per 15 minutes
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const rl = await checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000)
  if (!rl.allowed) {
    const retryAfterSec = Math.ceil((rl.resetAt - Date.now()) / 1000)
    setResponseHeader(event, 'Retry-After', String(retryAfterSec))
    throw createError({
      statusCode: 429,
      statusMessage: `Too many login attempts. Try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
    })
  }

  const body = await readBody<{ password?: string }>(event)

  if (!body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Password required' })
  }

  const { adminPassword } = useRuntimeConfig()
  if (!adminPassword) {
    throw createError({ statusCode: 500, statusMessage: 'Server misconfigured' })
  }

  if (body.password !== adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid password' })
  }

  const token = await signToken({ role: 'admin' })
  issueAuthCookie(event, token)

  return { ok: true }
})
