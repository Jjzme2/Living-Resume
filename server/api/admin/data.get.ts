import { getSiteData, kvGet } from '../../utils/kv'

interface ContactMessage {
  id: string
  read: boolean
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const [siteData, msgIndex] = await Promise.all([
    getSiteData(),
    kvGet<string[]>('msg:index'),
  ])

  const index = msgIndex ?? []

  // Fetch all messages to count unread
  const messages = await Promise.all(
    index.map((id) => kvGet<ContactMessage>(`msg:${id}`))
  )
  const validMessages = messages.filter(Boolean) as ContactMessage[]
  const unreadCount = validMessages.filter((m) => !m.read).length

  return {
    ...siteData,
    messageCount: index.length,
    unreadCount,
  }
})
