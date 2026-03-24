import { requireAuth } from '~/server/utils/auth'
import { r2RebuildIndex } from '~/server/utils/r2'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const posts = await r2RebuildIndex()
  return { ok: true, count: posts.length }
})
