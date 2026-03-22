import { readBody } from 'h3'
import { kvSet } from '../../utils/kv'

const VALID_SECTIONS = ['person', 'business', 'social', 'skills', 'experience', 'education', 'projects', 'settings'] as const
type ValidSection = typeof VALID_SECTIONS[number]

export default defineEventHandler(async (event) => {
  const body = await readBody<{ section?: string; data?: unknown }>(event)

  if (!body?.section || !VALID_SECTIONS.includes(body.section as ValidSection)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid section' })
  }

  if (body.data === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'Data is required' })
  }

  await kvSet(`site:${body.section}`, body.data)

  return { ok: true }
})
