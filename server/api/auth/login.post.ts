import { readBody } from 'h3'
import { signToken, issueAuthCookie } from '../../utils/auth'

export default defineEventHandler(async (event) => {
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
