import { isDbConnected } from '../../utils/kv'

export default defineEventHandler(async () => {
  const db = await isDbConnected()

  return {
    db,
    email:  !!(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL),
    ai:     !!process.env.ANTHROPIC_API_KEY,
    github: !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO),
  }
})
