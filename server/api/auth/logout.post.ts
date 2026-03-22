import { deleteCookie } from 'h3'

export default defineEventHandler((event) => {
  deleteCookie(event, 'admin_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
  })
  return { ok: true }
})
