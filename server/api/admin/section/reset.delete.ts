import { readBody } from 'h3'
import { kvDel } from '../../../utils/kv'

const VALID_SECTIONS = ['person', 'social', 'skills', 'experience', 'education', 'projects', 'settings', 'business']

export default defineEventHandler(async (event) => {
  const body = await readBody<{ section?: string }>(event)

  if (!body?.section || !VALID_SECTIONS.includes(body.section)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid section' })
  }

  const key = body.section === 'settings' ? 'site:settings' : `site:${body.section}`
  await kvDel(key)

  return { ok: true }
})
