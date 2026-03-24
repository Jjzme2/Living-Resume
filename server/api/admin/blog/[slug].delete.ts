import { requireAuth } from '~/server/utils/auth'
import { r2DeletePost } from '~/server/utils/r2'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug is required' })

  const clean = decodeURIComponent(slug).replace(/\\/g, '/').replace(/^\//, '')
  if (clean.includes('..')) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })

  await r2DeletePost(clean)
  return { ok: true }
})
