import { requireAuth } from '~/server/utils/auth'
import { r2ListPosts } from '~/server/utils/r2'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  return r2ListPosts(true)
})
