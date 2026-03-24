import { requireAuth } from '~/server/utils/auth'
import { r2SavePost } from '~/server/utils/r2'
import type { PostMeta } from '~/server/utils/r2'

interface SaveBody {
  slug: string
  body: string
  meta: Omit<PostMeta, 'slug' | 'path' | 'key'>
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const { slug, meta, body } = await readBody<SaveBody>(event)
  if (!slug || !meta?.title || !meta?.date) {
    throw createError({ statusCode: 400, statusMessage: 'slug, meta.title, and meta.date are required' })
  }

  // Prevent path traversal
  const clean = slug.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\//, '')
  if (clean.includes('..') || clean.startsWith('_')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })
  }

  try {
    const post = await r2SavePost(clean, meta, body ?? '')
    return { ok: true, post }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    throw createError({ statusCode: 500, statusMessage: `Failed to save post: ${msg}` })
  }
})
