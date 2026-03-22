import { requireAuth } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // Only protect /api/admin/* routes
  if (!url.pathname.startsWith('/api/admin/')) return

  // Verifies JWT and silently refreshes the 30-day cookie window
  await requireAuth(event)
})
