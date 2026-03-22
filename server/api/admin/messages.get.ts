import { kvGet } from '../../utils/kv'

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
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const index = (await kvGet<string[]>('msg:index')) ?? []

  const messages = await Promise.all(
    index.map((id) => kvGet<ContactMessage>(`msg:${id}`))
  )

  // Filter nulls, already sorted newest first (index is maintained that way)
  return messages.filter(Boolean) as ContactMessage[]
})
