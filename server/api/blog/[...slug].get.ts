import { r2GetPost } from '../../utils/r2'

export default defineEventHandler(async (event) => {
  const slugParts = getRouterParam(event, 'slug')
  if (!slugParts) throw createError({ statusCode: 400, statusMessage: 'slug is required' })

  // slugParts may be "tech/my-post" (from catch-all route)
  const slug = Array.isArray(slugParts) ? slugParts.join('/') : slugParts

  const post = await r2GetPost(slug)
  if (!post) throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  if (post.status === 'draft') throw createError({ statusCode: 404, statusMessage: 'Post not found' })

  return post
})
