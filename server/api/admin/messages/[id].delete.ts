import { kvGet, kvSet, kvDel } from '../../../utils/kv'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Message ID required' })
  }

  // Delete the message
  await kvDel(`msg:${id}`)

  // Remove from index
  const index = (await kvGet<string[]>('msg:index')) ?? []
  const newIndex = index.filter((msgId) => msgId !== id)
  await kvSet('msg:index', newIndex)

  return { ok: true }
})
