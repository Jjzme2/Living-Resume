import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const available = !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO)
  return { available }
})
