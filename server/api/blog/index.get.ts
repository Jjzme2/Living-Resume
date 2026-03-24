import { r2ListPosts } from '../../utils/r2'

export default defineEventHandler(async () => {
  try {
    return await r2ListPosts(false)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    throw createError({ statusCode: 500, statusMessage: `Failed to list posts: ${msg}` })
  }
})
