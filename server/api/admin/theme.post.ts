/** Admin endpoint — saves the public theme choice. */
import { readBody } from 'h3'
import { kvGet, kvSet } from '../../utils/kv'
import { siteSettings } from '~/config/site'
import { requireAuth } from '../../utils/auth'

const VALID_THEMES = ['midnight', 'glass', 'aero', 'noir', 'slate', 'dawn', 'dreamer', 'yinyang']

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody<{ theme?: string }>(event)
  if (!body?.theme || !VALID_THEMES.includes(body.theme)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid theme' })
  }

  const existing = (await kvGet<Record<string, unknown>>('site:settings')) ?? { ...siteSettings }
  existing.theme = body.theme
  await kvSet('site:settings', existing)

  return { ok: true, theme: body.theme }
})
