import { kvGet, kvSet } from '../../../utils/kv'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  date: string
  read: boolean
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Message ID required' })
  }

  const msg = await kvGet<ContactMessage>(`msg:${id}`)
  if (!msg) {
    throw createError({ statusCode: 404, statusMessage: 'Message not found' })
  }

  msg.read = true
  await kvSet(`msg:${id}`, msg)

  return { ok: true }
})
